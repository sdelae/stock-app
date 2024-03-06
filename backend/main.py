import requests
from flask import Flask, jsonify, abort
import json
from flask_cors import CORS

app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}}) 

def get_current_price(ticker):
    """Fetch the current price of a stock using Alpha Vantage API."""
    try:
        response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
        # If the response status code indicates an error, raise an exception
        response.raise_for_status()
        data = response.json()
        return float(data["Global Quote"]["05. price"])
    except Exception as e:
        print(f"Error fetching current price for {ticker}: {e}")
        return None

def get_past_data(ticker):
    """Fetch weekly time series data for the past two months for a stock."""
    try:
        response = requests.get(f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
        # If the response status code indicates an error, raise an exception
        response.raise_for_status()
        data = response.json()
        data = response.json()
        weekly_data = list(data["Weekly Time Series"].items())[:8]
        return [{
            "date": week[0],
            "open": float(week[1]['1. open']),
            "high": float(week[1]['2. high']),
            "low": float(week[1]['3. low']),
            "close": float(week[1]['4. close']),
            "volume": int(week[1]['5. volume'])
        } 
        for week in weekly_data]
    except Exception as e:
        print(f"Error fetching past data for {ticker}: {e}")
        return []


        

@app.route('/')
def home():
    """Endpoint that returns portfolio data including each stock's contribution percentage."""
    try:
        with open('portfolio.json', 'r') as file:
            portfolio = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Failed to load portfolio: {e}")
        abort(500) # If an error occurs, print a message and return a 500 Internal Server Error

    total_portfolio_value = 0  # Initialize the total portfolio value
    stocks = []

    # First, calculate the total portfolio value
    for item in portfolio["portfolios"][0]["items"]:
        current_price = get_current_price(item["ticker"])
        if current_price:
            total_portfolio_value += current_price * item["quantity"]

    # Then, calculate individual stock data and their percentage of the total value
    for item in portfolio["portfolios"][0]["items"]:
        current_price = get_current_price(item["ticker"])
        if current_price:
            total_stock_value = current_price * item["quantity"]
            profit_loss = (current_price - item["purchase_price"]) * item["quantity"]
            percentage_of_total = (total_stock_value / total_portfolio_value * 100) if total_portfolio_value else 0
            past_data = get_past_data(item["ticker"])
        stocks.append({
                "ticker": item["ticker"],
                "profit_loss": profit_loss,
                "current_value": total_stock_value,
                "percentage_of_total": percentage_of_total,  # Added percentage of total portfolio value
                "past_data": past_data
            })

    # Include the total_portfolio_value in the JSON response
    return jsonify({
        "total_portfolio_value": total_portfolio_value,
        "stocks": stocks
    })

if __name__ == '__main__':
    app.run(debug=True)