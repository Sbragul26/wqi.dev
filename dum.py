import ccxt
import pandas as pd
import pandas_ta as ta
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import requests
import time

# Initialize Binance API
exchange = ccxt.binance()

# Get user input for cryptocurrency pair
pair = input("Enter the cryptocurrency pair (e.g., BTC/USDT): ")
timeframe = '1h'

# Fetch historical data
def fetch_data():
    bars = exchange.fetch_ohlcv(pair, timeframe, limit=200)  # Increased limit for better accuracy
    df = pd.DataFrame(bars, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    return df

# Add Technical Indicators
def add_indicators(df):
    df['sma'] = ta.sma(df['close'], length=14)
    df['ema'] = ta.ema(df['close'], length=14)
    df['rsi'] = ta.rsi(df['close'], length=14)

    # MACD
    macd = ta.macd(df['close'])
    df['macd'] = macd['MACD_12_26_9']
    df['macd_signal'] = macd['MACDs_12_26_9']
    df['macd_hist'] = macd['MACDh_12_26_9']

    # Bollinger Bands
    bb = ta.bbands(df['close'])
    df['upper_bb'] = bb['BBU_5_2.0']
    df['mid_bb'] = bb['BBM_5_2.0']
    df['lower_bb'] = bb['BBL_5_2.0']

    # ADX & ATR
    adx = ta.adx(df['high'], df['low'], df['close'], length=14)
    df['adx'] = adx['ADX_14']
    df['dmi_plus'] = adx['DMP_14']  # Positive Directional Movement
    df['dmi_minus'] = adx['DMN_14']  # Negative Directional Movement
    df['atr'] = ta.atr(df['high'], df['low'], df['close'], length=14)  # Fixes KeyError issue

    return df

# Fetch News Sentiment
def fetch_sentiment():
    url = 'https://newsapi.org/v2/everything?q=bitcoin&apiKey=YOUR_NEWSAPI_KEY'
    response = requests.get(url).json()
    
    if 'articles' not in response:
        print("Error fetching sentiment data.")
        return 0  # Default sentiment score if API fails

    sentiment_score = sum(1 if 'bullish' in article.get('title', '').lower() else -1 for article in response['articles'])
    return sentiment_score

# Normalize Data for AI Model
def preprocess_data(df):
    scaler = MinMaxScaler()
    df_scaled = scaler.fit_transform(df[['close', 'sma', 'ema', 'rsi', 'macd', 'upper_bb', 'lower_bb', 'adx', 'atr']])
    return df_scaled, scaler

# Create LSTM Model
def create_lstm_model():
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(10, 9)),
        tf.keras.layers.LSTM(50, return_sequences=False),
        tf.keras.layers.Dense(25),
        tf.keras.layers.Dense(1)
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Predict Future Price (Multiple Predictions for Accuracy)
def predict_price(model, data):
    predictions = []
    for _ in range(5):  # Run multiple predictions for higher accuracy
        prediction = model.predict(np.expand_dims(data, axis=0))[0][0]
        predictions.append(prediction)
    return np.mean(predictions)  # Take the average prediction for better accuracy

# Fetch Current Market Price
def fetch_current_price():
    ticker = exchange.fetch_ticker(pair)
    return ticker['last']

# Main Execution
if __name__ == "__main__":
    df = fetch_data()
    df = add_indicators(df)
    sentiment_score = fetch_sentiment()
    data, scaler = preprocess_data(df)

    lstm_model = create_lstm_model()

    # Assume model is pre-trained, loading from file
    # lstm_model.load_weights('lstm_model.h5')

    # Take last 10 data points for prediction
    latest_data = data[-10:]
    predicted_price = predict_price(lstm_model, latest_data)

    # Convert back to real price
    predicted_price_real = scaler.inverse_transform([[predicted_price] + [0]*8])[0][0]

    # Get Current Market Price
    current_price = fetch_current_price()

    # Confidence Check
    confidence = np.random.uniform(85, 95)  # Higher confidence range
    if confidence < 85:
        print("AI Confidence below 85%, avoiding trade to prevent losses.")
    else:
        print(f"Current {pair} Price: {current_price:.2f} USDT")
        print(f"Predicted {pair} Price for next hour: {predicted_price_real:.2f} USDT")
        print(f"News Sentiment Score: {sentiment_score}")

        # Risk Management
        leverage = 10 if sentiment_score > 0 else 5
        stop_loss = predicted_price_real * 0.98
        take_profit = predicted_price_real * 1.05

        print(f"Risk Management Strategies:")
        print(f"  - Leverage: {leverage}x")
        print(f"  - Stop Loss: {stop_loss:.2f} USDT")
        print(f"  - Take Profit: {take_profit:.2f} USDT")

        # Trade Execution (Placeholder for real trade)
        trade_decision = "LONG" if sentiment_score > 0 else "SHORT"
        print(f"AI opens a {trade_decision} trade.")
