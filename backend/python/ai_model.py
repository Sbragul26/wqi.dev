import ccxt
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import snscrape.modules.twitter as sntwitter
import gym
from stable_baselines3 import PPO

# ✅ Fetch Crypto Data (BTC/USDT from Binance)
def fetch_crypto_data(symbol='BTC/USDT', timeframe='1m', limit=1000):
    exchange = ccxt.binance()
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    return df

# ✅ Calculate RSI (Relative Strength Index)
def rsi(data, window=14):
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

# ✅ Fetch Twitter Sentiment
def get_twitter_sentiment(coin='Bitcoin', limit=100):
    analyzer = SentimentIntensityAnalyzer()
    tweets = [tweet.content for tweet in sntwitter.TwitterSearchScraper(f'{coin} since:2025-02-25').get_items()]
    tweets = tweets[:limit]
    sentiments = [analyzer.polarity_scores(tweet)['compound'] for tweet in tweets]
    return np.mean(sentiments) if sentiments else 0

# ✅ Data Preprocessing
def preprocess_data(df):
    df['RSI'] = rsi(df)
    df.dropna(inplace=True)
    scaler = MinMaxScaler()
    df_scaled = scaler.fit_transform(df[['close', 'RSI']])
    return df_scaled, scaler

# ✅ Create LSTM Training Data
def create_sequences(data, seq_length=60):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i + seq_length])
        y.append(data[i + seq_length, 0])  # Predicting 'close' price
    return np.array(X), np.array(y)

# ✅ Build LSTM Model
def build_lstm_model(input_shape):
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# ✅ Reinforcement Learning Environment (Custom Gym)
class CryptoTradingEnv(gym.Env):
    def __init__(self, df, model, scaler):
        super(CryptoTradingEnv, self).__init__()
        self.df = df
        self.model = model
        self.scaler = scaler
        self.index = 60
        self.balance = 10000  # Start with $10,000
        self.position = None
        self.reward = 0
        self.observation_space = gym.spaces.Box(low=0, high=1, shape=(60, 2), dtype=np.float32)
        self.action_space = gym.spaces.Discrete(3)  # 0 = Hold, 1 = Buy, 2 = Sell

    def step(self, action):
        state = self.df[self.index-60:self.index]
        state = self.scaler.transform(state[['close', 'RSI']])

        if action == 1:  # Buy
            self.position = self.df.iloc[self.index]['close']
        elif action == 2 and self.position is not None:  # Sell
            profit = self.df.iloc[self.index]['close'] - self.position
            self.reward = profit
            self.balance += profit
            self.position = None
        else:  # Hold
            self.reward = 0
        
        self.index += 1
        done = self.index >= len(self.df) - 1
        return np.array(state), self.reward, done, {}

    def reset(self):
        self.index = 60
        self.balance = 10000
        self.position = None
        return np.array(self.scaler.transform(self.df.iloc[self.index-60:self.index][['close', 'RSI']]))

# ✅ Train PPO Reinforcement Learning Model
def train_rl(env):
    model = PPO("MlpPolicy", env, verbose=1)
    model.learn(total_timesteps=10000)
    return model

# ✅ Execute AI Model
df = fetch_crypto_data()
sentiment = get_twitter_sentiment()
df_scaled, scaler = preprocess_data(df)
X, y = create_sequences(df_scaled)

lstm_model = build_lstm_model((X.shape[1], X.shape[2]))
lstm_model.fit(X, y, epochs=5, batch_size=32, verbose=1)

# ✅ Predict Next Minute Price
latest_data = np.array([df_scaled[-60:]])
predicted_price = lstm_model.predict(latest_data)
predicted_price = scaler.inverse_transform([[predicted_price[0][0], 0]])[0][0]

print(f"Predicted Next-Minute Price: {predicted_price}")

# ✅ Train RL Model
env = CryptoTradingEnv(df, lstm_model, scaler)
rl_model = train_rl(env)

# ✅ Test RL Model
state = env.reset()
done = False
while not done:
    action, _ = rl_model.predict(state)
    state, reward, done, _ = env.step(action)
    print(f"Action: {action}, Reward: {reward}")
