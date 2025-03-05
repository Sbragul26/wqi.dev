from flask import Flask, request, jsonify
from flask_cors import CORS
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
CORS(app)  # Enable CORS for all routes

# Initialize Binance exchange
exchange = ccxt.binance({
    'enableRateLimit': True,
})
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
        print("[ERROR] Model not found! Using mock prediction.")
        return None

# Initialize the AI model
model = load_model()
if model:
    model.compile(loss="mse", optimizer="adam")

# Predict Future Price
def predict_price(model, data):
    try:
        if model is None:
            # Mock prediction if no model
            return data[-1][0] * 1.05  # 5% increase
        prediction = model.predict(np.expand_dims(data, axis=0), verbose=0)[0][0]
        return prediction
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return None

# API Route for Predictive Values
@app.route("/api/predictive-values", methods=["GET"])
def get_predictive_values():
    pair = request.args.get("pair", "BTC/USDT")
    print(f"[INFO] Received request for pair: {pair}")
    
    valid_pairs = ["BTC/USDT", "ETH/USDT", "APT/USDT", "SOL/USDT", "BNB/USDT"]
    if pair not in valid_pairs:
        return jsonify({"error": f"Invalid trading pair. Supported pairs: {valid_pairs}"}), 400

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

    current_price = df['close'].iloc[-1]
    predicted_price_real = scaler.inverse_transform([[predicted_price] + [0]*8])[0][0]
    avg_atr = df['atr'].iloc[-10:].mean()
    
    if predicted_price_real > current_price:
        entry_price = current_price
        stop_loss = current_price - (avg_atr * 1.5)
        take_profit = predicted_price_real * 1.02
    else:
        entry_price = current_price
        stop_loss = current_price + (avg_atr * 1.5)
        take_profit = predicted_price_real * 0.98

    response = {
        "pair": pair,
        "entryPrice": float(f"{entry_price:.2f}"),
        "stopLossPrice": float(f"{stop_loss:.2f}"),
        "takeProfitPrice": float(f"{take_profit:.2f}"),
        "predictedPrice": float(f"{predicted_price_real:.2f}")
    }
    print(f"[INFO] Sending response: {response}")
    return jsonify(response)

# Other routes (keeping minimal for focus)
@app.route("/api/trade", methods=["POST"])
def submit_trade():
    data = request.json
    required_fields = ['tradingPair', 'tradeType', 'orderType', 'investmentAmount']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    response = {
        "message": "Trade setup completed successfully",
        "txnHash": f"mock-tx-{int(time.time())}",
        "tradeDetails": data
    }
    print(f"[INFO] Trade submitted: {data}")
    return jsonify(response)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)