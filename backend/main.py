import oracledb
import requests
from flask import Flask, jsonify, abort, request
import json
from flask_cors import CORS
from sqlalchemy import NullPool
from models import Stock, db 

# Initialize a Flask application
app = Flask(__name__)
# Enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Oracle database credentials and connection string
un = 'ADMIN'
pw = 'CapstoneProject2024'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=gb3264e6f832c8b_stockdatabase_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

# Create a connection pool to the Oracle database
pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)

# Configure the Flask app to use the SQLAlchemy ORM with Oracle database
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}

# Initialize the database with the app
db.init_app(app)

# Create the database tables
with app.app_context():
    db.create_all()

# Function to make a generic API request and handle errors
def make_api_request(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"API request error: {e}")
        return None

# Function to get the current price of a stock using an external API
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
    
# Function to get historical weekly data for a stock
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

# Function to process the received weekly data
def process_weekly_data(data):
    """Extract and process the weekly time series data from the API response."""
    weekly_data = list(data["Weekly Time Series"].items())[:8]
    
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

# Define the root endpoint which provides aggregated portfolio data
@app.route('/')
def home():
    """Endpoint that returns portfolio data including each stock's contribution percentage."""
    total_portfolio_value = 0
    stocks_data = []
    stocks = Stock.query.all()  # Retrieve all stock records from the database

    for stock in stocks:
        current_price = get_current_price(stock.ticker)
        if current_price is None:
            continue  # Skip if current price couldn't be fetched

        total_stock_value = current_price * stock.quantity
        total_portfolio_value += total_stock_value

        profit_loss = (current_price - stock.purchase_price) * stock.quantity
        past_data, weekly_change = get_past_data(stock.ticker)  # Fetch weekly data
        percentage_of_total = (total_stock_value / total_portfolio_value * 100) if total_portfolio_value else 0

        stocks_data.append({
            "ticker": stock.ticker,
            "quantity": stock.quantity,
            "profit_loss": profit_loss,
            "current_value": total_stock_value,
            "percentage_of_total": percentage_of_total,
            "past_data": past_data,
            "weekly_change": weekly_change
        })

    # Now total_portfolio_value is calculated, we can calculate percentage_of_total
    for stock in stocks_data:
        stock["percentage_of_total"] = (stock["current_value"] / total_portfolio_value) * 100 if total_portfolio_value else 0

    return jsonify({
        "total_portfolio_value": total_portfolio_value,
        "stocks": stocks_data
    })

# Define the endpoint for adding a new stock entry to the portfolio
@app.route('/add_stock', methods=['POST'])
def add_stock():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    ticker = data.get('ticker')
    quantity = data.get('quantity')
    purchase_price = data.get('purchase_price')

    # Validation of input data
    if not ticker or quantity is None or purchase_price is None:
        return jsonify({'message': 'Missing data for ticker, quantity, or purchase_price'}), 400

    try:
        # Convert quantity and purchase_price to the correct data types
        quantity = float(quantity)
        purchase_price = float(purchase_price)
    except ValueError:
        return jsonify({'message': 'Invalid data types for quantity or purchase_price'}), 400

    existing_stock = Stock.query.filter_by(ticker=ticker).first()

    if existing_stock:
        # If an existing stock is found, update its quantity and purchase_price
        new_total_quantity = existing_stock.quantity + quantity
        # Calculate the new average purchase price
        new_purchase_price = (
            (existing_stock.purchase_price * existing_stock.quantity) + (purchase_price * quantity)
        ) / new_total_quantity

        existing_stock.quantity = new_total_quantity
        existing_stock.purchase_price = new_purchase_price
        db.session.commit()
        return jsonify({'message': 'Stock quantity updated successfully'}), 200
    else:
        # If no existing stock is found, add a new stock entry
        new_stock = Stock(ticker=ticker, quantity=quantity, purchase_price=purchase_price)
        db.session.add(new_stock)
        db.session.commit()
        return jsonify({'message': 'Stock added successfully'}), 201


# Define the endpoint for handling failed stock addition
@app.route('/failed_add_stock')
def failed_add_stock():
    return jsonify({'message': 'Failed to add stock'}), 500

# Main entry point of the Flask application
if __name__ == '__main__':
    app.run(debug=True)