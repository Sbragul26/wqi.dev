from flask import Flask, request, jsonify
import ccxt
import pandas as pd
import numpy as np
import os
import threading
import time
import json
import sys
import subprocess
from flask_cors import CORS

# Handle TensorFlow import for Python 3.10
try:
    import tensorflow as tf
except ImportError:
    print("[WARNING] TensorFlow not found, installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflow"])
    import tensorflow as tf

# Handle scikit-learn import
try:
    from sklearn.preprocessing import MinMaxScaler
except ImportError:
    print("[WARNING] scikit-learn not found, installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "scikit-learn"])
    from sklearn.preprocessing import MinMaxScaler

# Set Numpy NaN explicitly to fix pandas_ta issue
np.NaN = np.nan

app = Flask(__name__)
CORS(app)

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

# Add Technical Indicators (without relying on pandas_ta)
def add_indicators(df):
    try:
        # SMA - Simple Moving Average
        df['sma'] = df['close'].rolling(window=14).mean()
        
        # EMA - Exponential Moving Average
        df['ema'] = df['close'].ewm(span=14, adjust=False).mean()
        
        # RSI - Relative Strength Index
        delta = df['close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        rs = avg_gain / avg_loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD - Moving Average Convergence Divergence
        ema12 = df['close'].ewm(span=12, adjust=False).mean()
        ema26 = df['close'].ewm(span=26, adjust=False).mean()
        df['macd'] = ema12 - ema26
        df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
        df['macd_hist'] = df['macd'] - df['macd_signal']
        
        # Bollinger Bands
        sma20 = df['close'].rolling(window=5).mean()
        std20 = df['close'].rolling(window=5).std()
        df['upper_bb'] = sma20 + (std20 * 2)
        df['lower_bb'] = sma20 - (std20 * 2)
        
        # ADX - Average Directional Index
        # This is simplified, a full implementation would be more complex
        tr1 = abs(df['high'] - df['low'])
        tr2 = abs(df['high'] - df['close'].shift())
        tr3 = abs(df['low'] - df['close'].shift())
        tr = pd.DataFrame([tr1, tr2, tr3]).max()
        df['atr'] = tr.rolling(window=14).mean()
        
        # Simple ADX placeholder (not accurate but provides a value for the model)
        df['adx'] = ((df['high'] - df['low']) / df['close']).rolling(window=14).mean() * 100
        
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
        print(f"[WARNING] Model not found at {MODEL_PATH}! Creating a dummy model for testing...")
        # Create a simple dummy LSTM model for testing if no model exists
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(10, 9)),
            tf.keras.layers.LSTM(50),
            tf.keras.layers.Dense(1)
        ])
        return model

# Initialize the AI model
model = load_model()
if model:
    model.compile(loss="mse", optimizer="adam")

# Predict Future Price
def predict_price(model, data):
    try:
        prediction = model.predict(np.expand_dims(data, axis=0), verbose=0)[0][0]
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
ai_thread = threading.Thread(target=ai_trading_loop, daemon=True)
ai_thread.start()

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
def predict_endpoint():
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
        "current_price": float(df['close'].iloc[-1]),
        "predicted_price": float(predicted_price_real)
    })

# New Trade Processing Route
@app.route('/api/trade', methods=['POST'])
def process_trade():
    try:
        # Get trade data from the frontend
        trade_data = request.json
        
        # Validate required fields
        required_fields = ['tradingPair', 'investmentAmount']
        for field in required_fields:
            if field not in trade_data or not trade_data[field]:
                return jsonify({
                    'status': 'error', 
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Convert data to JSON string for passing to Node.js script
        trade_data_json = json.dumps(trade_data)
        
        # Path to the Node.js AI trading script
        script_path = os.path.join(os.path.dirname(__file__), 'ai_model.js')
        
        # Check if the Node.js script exists
        if not os.path.exists(script_path):
            print(f"[WARNING] Node.js script not found at {script_path}")
            # Return a mock response for testing
            return jsonify({
                'status': 'success',
                'message': 'Trade simulated (Node.js script not found)',
                'tradingPair': trade_data.get('tradingPair'),
                'investmentAmount': trade_data.get('investmentAmount'),
                'prediction': 'UP',
                'confidence': 0.85
            })
        
        # Execute the Node.js script with trade data
        result = subprocess.run(
            ['node', script_path, trade_data_json],
            capture_output=True,
            text=True
        )
        
        # Print full stdout and stderr for debugging
        print("Full stdout:", result.stdout)
        print("Full stderr:", result.stderr)
        
        # Find the JSON output by looking for the last JSON-like output
        json_output = None
        for line in reversed(result.stdout.splitlines()):
            try:
                json_output = json.loads(line)
                break
            except json.JSONDecodeError:
                continue
        
        if json_output is None:
            print("No valid JSON output found")
            return jsonify({
                'status': 'error',
                'message': 'Failed to parse AI trading script output'
            }), 500
        
        # Process the JSON output
        if json_output.get('status') == 'success':
            return jsonify(json_output), 200
        else:
            return jsonify({
                'status': 'error',
                'message': json_output.get('message', 'Unknown error occurred')
            }), 500
    
    except Exception as e:
        # Log the full exception details
        print("Exception occurred:", str(e))
        print("Exception type:", type(e))
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'status': 'error', 
            'message': str(e)
        }), 500

# Add a healthcheck endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Trading Bot API is running"})

# Ensure the entry point uses double underscores
if __name__ == "__main__":
    print("[INFO] Starting Flask API server for Trading Bot...")
    app.run(host="0.0.0.0", port=5000)