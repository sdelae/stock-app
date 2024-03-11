import requests
from flask import Flask, jsonify, abort
import json
from flask_cors import CORS

app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}}) 

def make_api_request(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"API request error: {e}")
        return None

def get_current_price(ticker):
    """Fetch the current price of a stock using Alpha Vantage API."""
    try:
        data = make_api_request(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
        if data:
            return float(data["Global Quote"]["05. price"])
        return None
    except Exception as e:
        print(f"Error fetching current price for {ticker}: {e}")
        return None
    
def get_past_data(ticker):
    """Fetch weekly time series data for the past two months for a stock and calculate weekly change."""
    try:
        # Fetch the data using a standardized API request function
        data = make_api_request(f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0")
        
        if not data or "Weekly Time Series" not in data:
            raise ValueError("Weekly Time Series data is not in the response")

        # Process the data using the dedicated function
        formatted_data, weekly_change = process_weekly_data(data)

        return formatted_data, weekly_change
    except requests.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except ValueError as val_err:
        print(f"Value error: {val_err}")
    except Exception as e:
        print(f"Other error occurred: {e}")
    return [], 0


def process_weekly_data(data):
    """Extract and process the weekly time series data from the API response."""
    # Assuming data is the JSON response already verified to contain "Weekly Time Series"
    weekly_data = list(data["Weekly Time Series"].items())[:8]
    
    # The rest of your data processing logic...
    if len(weekly_data) >= 2:
        last_close = float(weekly_data[0][1]['4. close'])
        prev_close = float(weekly_data[1][1]['4. close'])
        weekly_change = (last_close - prev_close) / prev_close * 100
    else:
        weekly_change = 0  # Default to 0 if not enough data

    formatted_data = [{
        "date": week[0],
        "open": float(week[1]['1. open']),
        "high": float(week[1]['2. high']),
        "low": float(week[1]['3. low']),
        "close": float(week[1]['4. close']),
        "volume": int(week[1]['5. volume'])
    } for week in weekly_data]

    return formatted_data, weekly_change


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