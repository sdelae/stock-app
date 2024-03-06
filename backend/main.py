import requests
from flask import Flask, jsonify
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

def get_current_price(ticker):
    response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
    data = response.json()
    return float(data["Global Quote"]["05. price"])

def get_past_data(ticker):
    response = requests.get(f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
    data = response.json()
    # Get the past 2 months of data
    weekly_data = list(data["Weekly Time Series"].items())[:8]
    # Return the open, high, low, close, and volume for each week
    return [{"open": float(week[1]['1. open']), "high": float(week[1]['2. high']), "low": float(week[1]['3. low']), "close": float(week[1]
            ['4. close']), "volume": int(week[1]['5. volume'])} for week in weekly_data]

@app.route('/')
def home():
    with open('portfolio.json', 'r') as file:
        portfolio = json.load(file)
    stocks = []
    for item in portfolio["portfolios"][0]["items"]:
        current_price = get_current_price(item["ticker"])
        profit_loss = (current_price - item["purchase_price"]) * item["quantity"]
        past_data = get_past_data(item["ticker"])
        stocks.append({"ticker": item["ticker"], "profit_loss": profit_loss, "past_data": past_data})
    return jsonify(stocks)

if __name__ == '__main__':
    app.run(debug=True)
