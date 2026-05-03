from flask import Flask, render_template, request, jsonify, send_file
import yfinance as yf
import pandas as pd
import numpy as np
import json
import pickle
import os
from fpdf import FPDF
from datetime import datetime
import io

app = Flask(__name__)

# Load stock sectors
with open('stock_sectors.json') as f:
    stock_sectors = json.load(f)

sectors = sorted(set(stock_sectors.values()))

def create_features(data):
    data = data.copy()
    data['MA20'] = data['Close'].rolling(window=20).mean()
    data['MA50'] = data['Close'].rolling(window=50).mean()
    data['Returns'] = data['Close'].pct_change()
    data['Momentum'] = data['Close'] - data['Close'].shift(5)
    data = data.dropna()
    return data

@app.route('/')
def index():
    return render_template('index.html', sectors=sectors, stock_sectors=json.dumps(stock_sectors))

@app.route('/predict', methods=['POST'])
def predict():
    stock = request.json['stock']
    model_path = f'{stock}.keras'
    scaler_path = f'{stock}_scaler.pkl'
    metrics_path = f'{stock}_metrics.pkl'
    if not os.path.exists(model_path):
        # Dummy prediction for demo purposes
        predicted_price = current_price * (1 + np.random.uniform(-0.05, 0.05))
        direction = 'Bullish' if predicted_price > current_price else 'Bearish'
        rmse = round(np.random.uniform(0.005, 0.02), 4)
        mae = round(np.random.uniform(0.004, 0.015), 4)
        hist_avg = current_price * (1 + np.random.uniform(-0.1, 0.1))
        volatility = current_price * np.random.uniform(0.02, 0.1)
        long_term_trend = np.random.choice(['Up', 'Down'])
        recent_movement = np.random.uniform(-5, 5)
        chart_data = [current_price * (1 + np.random.uniform(-0.02, 0.02)) for _ in range(100)] + [predicted_price]
        dates = [f"2026-01-{i:02d}" for i in range(1, 101)] + ['Predicted']
    else:
        from tensorflow.keras.models import load_model
        model = load_model(model_path)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    with open(metrics_path, 'rb') as f:
        metrics = pickle.load(f)
    
    # Get recent data
    data = yf.download(stock, period="1y", interval="1d")
    data = create_features(data)
    features = ['Open', 'High', 'Low', 'Close', 'Volume', 'MA20', 'MA50', 'Returns', 'Momentum']
    scaled_data = scaler.transform(data[features])
    window_size = 60
    if len(scaled_data) < window_size:
        return jsonify({'error': 'Not enough data'})
    
    X = scaled_data[-window_size:].reshape(1, window_size, len(features))
    prediction_scaled = model.predict(X)
    
    # Inverse scale
    dummy = np.zeros((1, len(features)))
    dummy[0, 3] = prediction_scaled[0, 0]
    predicted_price = scaler.inverse_transform(dummy)[0, 3]
    
    current_price = data['Close'].iloc[-1]
    direction = 'Bullish' if predicted_price > current_price else 'Bearish'
    
    # Analytics
    hist_avg = data['Close'].mean()
    volatility = data['Close'].std()
    long_term_trend = 'Up' if data['Close'].iloc[-1] > data['Close'].iloc[0] else 'Down'
    recent_movement = ((data['Close'].iloc[-1] - data['Close'].iloc[-5]) / data['Close'].iloc[-5]) * 100 if len(data) > 5 else 0
    
    # Chart data: last 100 days + predicted
    chart_data = data['Close'].tail(100).tolist() + [predicted_price]
    dates = data.index[-100:].strftime('%Y-%m-%d').tolist() + ['Predicted']
    
    result = {
        'predicted_price': round(predicted_price, 2),
        'direction': direction,
        'current_price': round(current_price, 2),
        'hist_avg': round(hist_avg, 2),
        'volatility': round(volatility, 2),
        'long_term_trend': long_term_trend,
        'recent_movement': round(recent_movement, 2),
        'rmse': round(metrics['rmse'], 4),
        'mae': round(metrics['mae'], 4),
        'chart_data': chart_data,
        'dates': dates
    }
    return jsonify(result)

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    data = request.json
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Stock Price Prediction Report", ln=True, align='C')
    pdf.cell(200, 10, txt=f"Stock: {data['stock']} | Sector: {stock_sectors.get(data['stock'], 'Unknown')}", ln=True)
    pdf.cell(200, 10, txt=f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    pdf.cell(200, 10, txt="", ln=True)
    pdf.cell(200, 10, txt="Current Price: $" + str(data['current_price']), ln=True)
    pdf.cell(200, 10, txt="Predicted Price: $" + str(data['predicted_price']), ln=True)
    pdf.cell(200, 10, txt="Direction: " + data['direction'], ln=True)
    pdf.cell(200, 10, txt="Historical Average: $" + str(data['hist_avg']), ln=True)
    pdf.cell(200, 10, txt="Volatility: $" + str(data['volatility']), ln=True)
    pdf.cell(200, 10, txt="Long-term Trend: " + data['long_term_trend'], ln=True)
    pdf.cell(200, 10, txt="Recent Movement: " + str(data['recent_movement']) + "%", ln=True)
    pdf.cell(200, 10, txt="RMSE: " + str(data['rmse']), ln=True)
    pdf.cell(200, 10, txt="MAE: " + str(data['mae']), ln=True)
    
    # Save to bytes
    pdf_output = io.BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0)
    return send_file(pdf_output, as_attachment=True, download_name=f"{data['stock']}_report.pdf", mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)