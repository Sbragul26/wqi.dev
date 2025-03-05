from flask import Flask, request, jsonify
import ccxt
import pandas as pd
import pandas_ta as ta
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import os
import threading
import time

app = Flask(__name__)

# Initialize Binance exchange
exchange = ccxt.binance()
timeframe = '1h'
MODEL_PATH = "lstm_model.keras"

# Global AI control flag
AI_RUNNING = False

print("[INFO] AI is running in the background but disabled. Use API to turn ON.")

# Fetch Historical Data
def fetch_data(pair):
    try:
        bars = exchange.fetch_ohlcv(pair, timeframe, limit=200)
        df = pd.DataFrame(bars, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except Exception as e:
        print(f"[ERROR] Failed to fetch data for {pair}: {e}")
        return None

# Add Technical Indicators
def add_indicators(df):
    try:
        df['sma'] = ta.sma(df['close'], length=14)
        df['ema'] = ta.ema(df['close'], length=14)
        df['rsi'] = ta.rsi(df['close'], length=14)

        macd = ta.macd(df['close'])
        df['macd'] = macd['MACD_12_26_9']
        df['macd_signal'] = macd['MACDs_12_26_9']
        df['macd_hist'] = macd['MACDh_12_26_9']

        bb = ta.bbands(df['close'])
        df['upper_bb'] = bb['BBU_5_2.0']
        df['lower_bb'] = bb['BBL_5_2.0']

        adx = ta.adx(df['high'], df['low'], df['close'], length=14)
        df['adx'] = adx['ADX_14']
        df['atr'] = ta.atr(df['high'], df['low'], df['close'], length=14)

        df.fillna(method='ffill', inplace=True)
        return df
    except Exception as e:
        print(f"[ERROR] Failed to compute indicators: {e}")
        return None

# Normalize Data for AI Model
def preprocess_data(df):
    try:
        scaler = MinMaxScaler()
        df_scaled = scaler.fit_transform(df[['close', 'sma', 'ema', 'rsi', 'macd', 'upper_bb', 'lower_bb', 'adx', 'atr']])
        return df_scaled, scaler
    except Exception as e:
        print(f"[ERROR] Data preprocessing failed: {e}")
        return None, None

# Load AI Model
def load_model():
    if os.path.exists(MODEL_PATH):
        print(f"[INFO] Loading model from {MODEL_PATH}...")
        return tf.keras.models.load_model(MODEL_PATH, compile=False)
    else:
        print("[ERROR] Model not found! Please train a model first.")
        return None

# Initialize the AI model
model = load_model()
if model:
    model.compile(loss="mse", optimizer="adam")

# Predict Future Price
def predict_price(model, data):
    try:
        prediction = model.predict(np.expand_dims(data, axis=0))[0][0]
        return prediction
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return None

# AI Trading Loop (Background Process)
def ai_trading_loop():
    global AI_RUNNING

    print("[INFO] AI trading bot is initialized but will only trade when enabled.")

    trade_open = False
    entry_price = None

    while True:
        if not AI_RUNNING:
            time.sleep(10)  # Check every 10 seconds if AI is turned on
            continue

        try:
            pair = "BTC/USDT"
            df = fetch_data(pair)
            if df is None:
                print("[ERROR] Failed to fetch data. Skipping this cycle...")
                time.sleep(60)
                continue
            
            df = add_indicators(df)
            if df is None:
                print("[ERROR] Failed to compute indicators. Skipping...")
                time.sleep(60)
                continue

            processed_data, scaler = preprocess_data(df)
            if processed_data is None:
                print("[ERROR] Data preprocessing failed. Skipping...")
                time.sleep(60)
                continue

            latest_data = processed_data[-10:]  # Last 10 time steps for LSTM input
            predicted_price = predict_price(model, latest_data)
            if predicted_price is None:
                print("[ERROR] Prediction failed. Skipping...")
                time.sleep(60)
                continue

            current_price = df['close'].iloc[-1]

            # Dynamic Stop-Loss & Take-Profit Based on Market Volatility
            avg_atr = df['atr'].iloc[-10:].mean()
            stop_loss = current_price - (avg_atr * 1.5)  # Dynamic SL based on ATR
            take_profit = current_price + (avg_atr * 2.5)  # Dynamic TP based on ATR

            # AI Decision Making
            if not trade_open:
                if predicted_price > current_price * 1.01:  # Buy if AI expects 1% rise
                    print(f"[INFO] Buying at {current_price} with SL: {stop_loss:.2f}, TP: {take_profit:.2f}")
                    trade_open = True
                    entry_price = current_price

            else:
                if current_price <= stop_loss:
                    print("[ALERT] Stop-Loss hit! Closing trade...")
                    trade_open = False
                    entry_price = None
                    time.sleep(60)  # Cooldown before next trade

                elif current_price >= take_profit:
                    print("[ALERT] Take-Profit reached! Closing trade...")
                    trade_open = False
                    entry_price = None
                    time.sleep(60)  # Cooldown before next trade

            time.sleep(60)  # AI checks every minute
        except Exception as e:
            print(f"[ERROR] AI Trading Loop Error: {e}")
            time.sleep(60)

# Start AI Trading in Background
threading.Thread(target=ai_trading_loop, daemon=True).start()

# API Route to Toggle AI ON/OFF
@app.route("/toggle_ai", methods=["POST"])
def toggle_ai():
    global AI_RUNNING
    data = request.json
    state = data.get("state", "").lower()

    if state == "on":
        AI_RUNNING = True
        print("[INFO] AI Trading is now ON.")
        return jsonify({"message": "AI Trading has been turned ON."})
    
    elif state == "off":
        AI_RUNNING = False
        print("[INFO] AI Trading is now OFF.")
        return jsonify({"message": "AI Trading has been turned OFF."})
    
    return jsonify({"error": "Invalid state. Use 'on' or 'off'."}), 400

# API Route for Predictions
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    pair = data.get("pair", "BTC/USDT")

    df = fetch_data(pair)
    if df is None:
        return jsonify({"error": f"Failed to fetch data for {pair}"}), 500

    df = add_indicators(df)
    if df is None:
        return jsonify({"error": "Failed to compute indicators"}), 500

    processed_data, scaler = preprocess_data(df)
    if processed_data is None:
        return jsonify({"error": "Data preprocessing failed"}), 500

    latest_data = processed_data[-10:]
    predicted_price = predict_price(model, latest_data)
    if predicted_price is None:
        return jsonify({"error": "Prediction failed"}), 500

    predicted_price_real = scaler.inverse_transform([[predicted_price] + [0]*8])[0][0]

    return jsonify({
        "pair": pair,
        "predicted_price": predicted_price_real
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
