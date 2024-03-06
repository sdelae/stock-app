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
    """Fetch weekly time series data for the past two months for a stock and calculate weekly change."""
    try:
        response = requests.get(f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
        response.raise_for_status()
        data = response.json()
        
        if "Weekly Time Series" not in data:
            raise ValueError("Weekly Time Series data is not in the response")

        # Convert the response into a list of tuples (date, data)
        weekly_data = list(data["Weekly Time Series"].items())[:8]

        # Calculate weekly change between the most recent two weeks
        if len(weekly_data) >= 2:
            # Get the most recent close and the close from the previous week
            last_close = float(weekly_data[0][1]['4. close'])
            prev_close = float(weekly_data[1][1]['4. close'])
            weekly_change = (last_close - prev_close) / prev_close * 100
        else:
            weekly_change = 0  # If not enough data is available, default to 0

        # Format the weekly data for the response
        formatted_data = [{
            "date": week[0],
            "open": float(week[1]['1. open']),
            "high": float(week[1]['2. high']),
            "low": float(week[1]['3. low']),
            "close": float(week[1]['4. close']),
            "volume": int(week[1]['5. volume'])
        } for week in weekly_data]

        return formatted_data, weekly_change
    except requests.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return [], 0
    except ValueError as val_err:
        print(f"Value error: {val_err}")
        return [], 0
    except Exception as e:
        print(f"Other error occurred: {e}")
        return [], 0

@app.route('/')
def home():
    """Endpoint that returns portfolio data including each stock's contribution percentage."""
    try:
        with open('portfolio.json', 'r') as file:
            portfolio = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Failed to load portfolio: {e}")
        abort(500) # If an error occurs, print a message and return a 500 Internal Server Error

        # Accumulate total portfolio value and prepare stock data
    total_portfolio_value = 0
    stocks = []
    try:
        with open('portfolio.json', 'r') as file:
            portfolio = json.load(file)

        for item in portfolio["portfolios"][0]["items"]:
            current_price = get_current_price(item["ticker"])
            if current_price is None:
                continue  # Skip if current price couldn't be fetched
            
            total_stock_value = current_price * item["quantity"]
            total_portfolio_value += total_stock_value
            
            profit_loss = (current_price - item["purchase_price"]) * item["quantity"]
            past_data, weekly_change = get_past_data(item["ticker"])  # This should return the data directly
            percentage_of_total = (total_stock_value / total_portfolio_value * 100) if total_portfolio_value else 0

            stocks.append({
                "ticker": item["ticker"],
                "quantity": item["quantity"],
                "profit_loss": profit_loss,
                "current_value": total_stock_value,
                "percentage_of_total": percentage_of_total,
                "past_data": past_data,
                "weekly_change": weekly_change
            })

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Failed to load portfolio: {e}")
        abort(500) # Return a 500 Internal Server Error

    # Now total_portfolio_value is calculated, we can calculate percentage_of_total
    for stock in stocks:
        stock["percentage_of_total"] = (stock["current_value"] / total_portfolio_value) * 100 if total_portfolio_value else 0

    return jsonify({
        "total_portfolio_value": total_portfolio_value,
        "stocks": stocks
    })

if __name__ == '__main__':
    app.run(debug=True)