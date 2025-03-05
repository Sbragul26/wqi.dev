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
import sqlite3
import requests

app = Flask(__name__)

# Initialize Binance exchange
exchange = ccxt.binance()
timeframe = '1h'
MODEL_PATH = "lstm_model.keras"
AI_RUNNING = False

print("[INFO] AI is running in the background but disabled. Use API to turn ON.")

# Database Setup
def init_db():
    conn = sqlite3.connect("trades.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS trade_history
                 (id INTEGER PRIMARY KEY, pair TEXT, action TEXT, price REAL, timestamp TEXT)''')
    conn.commit()
    conn.close()

init_db()

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

# Add Indicators
def add_indicators(df):
    df['sma'] = ta.sma(df['close'], length=14)
    df['ema'] = ta.ema(df['close'], length=14)
    df['rsi'] = ta.rsi(df['close'], length=14)
    df['obv'] = ta.obv(df['close'], df['volume'])
    df.fillna(method='ffill', inplace=True)
    return df

# Normalize Data
def preprocess_data(df):
    scaler = MinMaxScaler()
    df_scaled = scaler.fit_transform(df[['close', 'sma', 'ema', 'rsi', 'obv']])
    return df_scaled, scaler

# Load AI Model
def load_model():
    if os.path.exists(MODEL_PATH):
        print(f"[INFO] Loading model from {MODEL_PATH}...")
        return tf.keras.models.load_model(MODEL_PATH, compile=False)
    else:
        print("[ERROR] Model not found!")
        return None

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

# Store Trade History
def store_trade(pair, action, price):
    conn = sqlite3.connect("trades.db")
    c = conn.cursor()
    c.execute("INSERT INTO trade_history (pair, action, price, timestamp) VALUES (?, ?, ?, datetime('now'))", 
              (pair, action, price))
    conn.commit()
    conn.close()

# AI Trading Loop
def ai_trading_loop():
    global AI_RUNNING
    trade_open = False
    entry_price = None

    while True:
        if not AI_RUNNING:
            time.sleep(10)
            continue
        
        try:
            pair = "BTC/USDT"
            df = fetch_data(pair)
            if df is None:
                time.sleep(60)
                continue
            
            df = add_indicators(df)
            processed_data, scaler = preprocess_data(df)
            latest_data = processed_data[-10:]
            predicted_price = predict_price(model, latest_data)
            if predicted_price is None:
                time.sleep(60)
                continue
            
            current_price = df['close'].iloc[-1]
            stop_loss = current_price * 0.98
            take_profit = current_price * 1.02
            
            if not trade_open and predicted_price > current_price * 1.01:
                print(f"[INFO] Buying at {current_price}")
                store_trade(pair, "BUY", current_price)
                trade_open = True
                entry_price = current_price
            
            elif trade_open and (current_price <= stop_loss or current_price >= take_profit):
                print(f"[INFO] Closing trade at {current_price}")
                store_trade(pair, "SELL", current_price)
                trade_open = False
                entry_price = None
            
            time.sleep(60)
        except Exception as e:
            print(f"[ERROR] AI Trading Loop Error: {e}")
            time.sleep(60)

threading.Thread(target=ai_trading_loop, daemon=True).start()

# API Routes
@app.route("/toggle_ai", methods=["POST"])
def toggle_ai():
    global AI_RUNNING
    state = request.json.get("state", "").lower()
    if state == "on":
        AI_RUNNING = True
        return jsonify({"message": "AI Trading ON"})
    elif state == "off":
        AI_RUNNING = False
        return jsonify({"message": "AI Trading OFF"})
    return jsonify({"error": "Invalid state. Use 'on' or 'off'."}), 400

@app.route("/predict", methods=["POST"])
def predict():
    pair = request.json.get("pair", "BTC/USDT")
    df = fetch_data(pair)
    if df is None:
        return jsonify({"error": f"Failed to fetch data for {pair}"}), 500
    
    df = add_indicators(df)
    processed_data, scaler = preprocess_data(df)
    latest_data = processed_data[-10:]
    predicted_price = predict_price(model, latest_data)
    if predicted_price is None:
        return jsonify({"error": "Prediction failed"}), 500
    
    predicted_price_real = scaler.inverse_transform([[predicted_price] + [0]*4])[0][0]
    return jsonify({"pair": pair, "predicted_price": predicted_price_real})

@app.route("/trade_history", methods=["GET"])
def trade_history():
    conn = sqlite3.connect("trades.db")
    c = conn.cursor()
    c.execute("SELECT * FROM trade_history ORDER BY timestamp DESC LIMIT 50")
    trades = c.fetchall()
    conn.close()
    return jsonify(trades)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
