from utilities import hash_password
import click
from flask.cli import with_appcontext
import requests
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool
import hashlib
from flask_cors import CORS
import uuid
import oracledb
from models import db, Users, User_stocks 
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = "28d8c1d608fa26a304bc47063e1d4807"

# Configure logging
logging.basicConfig(level=logging.INFO)  # Set the logging level you want here

# Create a file handler which logs even debug messages
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
handler.setLevel(logging.INFO)  # Set the logging level for the file handler

# Create a logging format
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

# Add the handlers to the logger
app.logger.addHandler(handler)

# Oracle database credentials and connection string configuration
un = 'ADMIN'
pw = 'CapstoneProject2024'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=gb3264e6f832c8b_database1_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

# Setup database connection
pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}

# Flask CLI command to create the database tables
@app.cli.command("create_db")
@with_appcontext
def create_db_command():
    """Create database tables."""
    db.create_all()
    click.echo("Database tables created.")

db.init_app(app) 

apikey = 'ZSLQEIEAP5XSK6N0'

def fetch_stock_info(ticker):
    response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={apikey}")
    if response.ok:
        data = response.json()
        stock_info = {
            "price": data["Global Quote"]["05. price"],
            "latest_trading_day": data["Global Quote"]["07. latest trading day"]}
        return stock_info
    else:
        return None
    
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# Manually hash the single user's password
password = hash_password('hello')

@app.route('/search/<ticker>', methods=["GET"])
def search_stock(ticker):
    response = requests.get(f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={ticker}&apikey={apikey}")
    if response.ok:
        data = response.json()
        return jsonify(data["bestMatches"])
    else:
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/portfolio/modify', methods=["POST"])
def modify_portfolio():
    item_data = request.json
    user_id = item_data.get("user_id")
    ticker = item_data.get("ticker")
    quantity = item_data.get("quantity")
    action = item_data.get("action")
    stock_id = item_data.get("stock_id", uuid.uuid4().hex)

    if action not in ["add", "update", "delete"]:
        return jsonify({"error": "Invalid action specified"}), 400

    try:
        if action == "add":
            new_item = User_stocks(stock_id=stock_id, user_id=user_id, ticker=ticker, quantity=quantity)
            db.session.add(new_item)
            db.session.commit()
            return jsonify({"message": "Stock added successfully"}), 201

        elif action == "update":
            item = User_stocks.query.filter_by(stock_id=stock_id, user_id=user_id).first()
            if item:
                item.quantity = quantity
                db.session.commit()
                return jsonify({"message": "Stock updated successfully"}), 200
            else:
                return jsonify({"error": "Stock not found"}), 404

        elif action == "delete":
            item = User_stocks.query.filter_by(stock_id=stock_id, user_id=user_id).first()
            if item:
                db.session.delete(item)
                db.session.commit()
                return jsonify({"message": "Stock deleted successfully"}), 200
            else:
                return jsonify({"error": "Stock not found"}), 404

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route('/portfolio/<user_id>', methods=["GET"])
def get_portfolio(user_id):
    app.logger.info(f"Fetching portfolio for user: {user_id}")
    try:
        # Fetch portfolio from database
        portfolio_items = User_stocks.query.filter_by(user_id=user_id).all()
        # Convert to JSON serializable format
        portfolio_data = [{"ticker": item.ticker, "quantity": item.quantity} for item in portfolio_items]
        return jsonify(portfolio_data), 200
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/user/login', methods=["POST"])
def user_login():
    credentials = request.json
    user_name = credentials.get("user_name")
    password = credentials.get("password")

    app.logger.info(f"Attempting login for user: {user_name}")

    try:
        # Manually hash the incoming password to compare
        password = hashlib.sha256(password.encode('utf-8')).hexdigest()

        # Fetch the user from the database
        user = Users.query.filter_by(user_name=user_name).first()

        if user and user.password == password:
            # Successful login
            app.logger.info(f"User {user_name} logged in successfully.")
            return jsonify({"message": "Login successful", "user_id": user.user_id}), 200
        else:
            # Failed login
            app.logger.warning(f"Login failed for user {user_name}.")
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(debug=True)
