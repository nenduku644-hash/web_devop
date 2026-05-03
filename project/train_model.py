import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
import os
import pickle
import json

# Get S&P 500 tickers - using static list for demo
def get_sp500_tickers():
    # Static list of popular stocks with sectors
    stock_sectors = {
        'AAPL': 'Technology',
        'MSFT': 'Technology',
        'GOOGL': 'Communication Services',
        'AMZN': 'Consumer Discretionary',
        'TSLA': 'Consumer Discretionary',
        'NVDA': 'Technology',
        'META': 'Communication Services',
        'NFLX': 'Communication Services',
        'BABA': 'Consumer Discretionary',
        'ORCL': 'Technology'
    }
    return list(stock_sectors.keys()), stock_sectors

# Function to create features
def create_features(data):
    data = data.copy()
    data['MA20'] = data['Close'].rolling(window=20).mean()
    data['MA50'] = data['Close'].rolling(window=50).mean()
    data['Returns'] = data['Close'].pct_change()
    data['Momentum'] = data['Close'] - data['Close'].shift(5)
    data = data.dropna()
    return data

# Function to prepare data for LSTM
def prepare_data(data, window_size=60):
    features = ['Open', 'High', 'Low', 'Close', 'Volume', 'MA20', 'MA50', 'Returns', 'Momentum']
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data[features])
    X = []
    y = []
    for i in range(window_size, len(scaled_data)):
        X.append(scaled_data[i-window_size:i])
        y.append(scaled_data[i, 3])  # Close price
    X = np.array(X)
    y = np.array(y)
    return X, y, scaler

# Function to build model
def build_model(input_shape):
    model = Sequential()
    model.add(Input(shape=input_shape))
    model.add(LSTM(units=50, return_sequences=True))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(units=1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Main training
if __name__ == "__main__":
    tickers, stock_sectors = get_sp500_tickers()
    tickers = tickers[:2]  # Limit for demo
    # with open('stock_sectors.json', 'w') as f:
    #     json.dump(stock_sectors, f)
    model_dir = 'model'
    os.makedirs(model_dir, exist_ok=True)
    print(f"Current dir: {os.getcwd()}")
    print(f"Model dir exists: {os.path.exists(model_dir)}")
    for ticker in tickers:
        try:
            data = yf.download(ticker, period="2y", interval="1d")
            if data.empty or len(data) < 100:
                continue
            data = create_features(data)
            X, y, scaler = prepare_data(data)
            if len(X) == 0:
                continue
            split_size = int(len(X) * 0.8)
            X_train = X[:split_size]
            y_train = y[:split_size]
            X_test = X[split_size:]
            y_test = y[split_size:]
            model = build_model((X.shape[1], X.shape[2]))
            model.fit(X_train, y_train, epochs=1, batch_size=32, verbose=0)
            predictions = model.predict(X_test)
            rmse = np.sqrt(mean_squared_error(y_test, predictions))
            mae = mean_absolute_error(y_test, predictions)
            model.save(f'{ticker}.keras')
            with open(f'{ticker}_scaler.pkl', 'wb') as f:
                pickle.dump(scaler, f)
            with open(f'{ticker}_metrics.pkl', 'wb') as f:
                pickle.dump({'rmse': rmse, 'mae': mae}, f)
            print(f'Model for {ticker} saved')
        except Exception as e:
            print(f'Error training for {ticker}: {e}')