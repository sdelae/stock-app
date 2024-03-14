import requests
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool
import hashlib
from flask_cors import CORS
import uuid
import oracledb
from models import db, Users, User_stocks 
import click
from flask.cli import with_appcontext

# Initialize a Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for all domains on all routes
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
# Set a secret key for session management and cookies
app.secret_key = "VFVETDZPXW4IOBLDKK"

# Oracle database credentials and connection string configuration
un = 'ADMIN'
pw = 'CapstoneProject2024'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=gb3264e6f832c8b_database1_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

# Create a connection pool to the Oracle database
pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)
# SQLAlchemy configuration for Oracle database connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,  
    'poolclass': NullPool  
}

db.init_app(app) 

# Flask CLI command to create the database tables
@app.cli.command("create_db")
@with_appcontext
def create_db_command():
    """Create database tables."""
    db.create_all()
    click.echo("Database tables created.")

# Alpha Vantage API key for fetching stock information
apikey = 'ZSLQEIEAP5XSK6N0'

# Function to fetch stock information from Alpha Vantage API
def fetch_stock_info(ticker):
    response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={API_KEY}")
    return response.json()

# Function to generate a unique identifier for a stock item in the portfolio
def generate_stock_id():
    return str(uuid.uuid4())

# Function to hash a password using SHA-256
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Route to display a user's portfolio
@app.route('/portfolio/<user_id>', methods=["GET"])
def display_portfolio(user_id):
    portfolio_items = User_stocks.query.filter_by(user_id=user_id).all()
    portfolio_summary = {}
    for item in portfolio_items:
        stock_info = fetch_stock_info(item.ticker)
        portfolio_summary[item.ticker] = {
            "quantity": item.quantity,
            "current_price": stock_info["Global Quote"]["05. price"]
        }
    return jsonify(portfolio_summary)

# Route to get detailed stock information
@app.route('/stock/<ticker>', methods=["GET"])
def get_stock_details(ticker):
    stock_details = fetch_stock_info(ticker)
    return jsonify(stock_details)

# Route for user login
@app.route('/user/login', methods=["POST"])
def user_login():
    credentials = request.json
    user = Users.query.filter_by(user_mail=credentials["email"], password=hash_password(credentials["password"])).first()
    if user:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# Route to update a user's profile
@app.route('/user/update', methods=["POST"])
def update_user_profile():
    user_data = request.json
    user = Users.query.filter_by(user_id=user_data["user_id"]).first()
    if user:
        user.user_name = user_data.get("name", user.user_name)
        user.user_mail = user_data.get("email", user.user_mail)
        db.session.commit()
        return jsonify({"message": "User profile updated successfully"}), 200
    else:
        return jsonify({"message": "User not found"}), 404

# Route to add a new item to the user's portfolio
@app.route('/portfolio/add', methods=["POST"])
def add_portfolio_item():
    item_data = request.json
    new_item = User_stocks(
        stock_id=generate_stock_id(),
        user_id=item_data["user_id"],
        ticker=item_data["ticker"],
        quantity=item_data["quantity"]
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Portfolio item added successfully"}), 201

# Route to update an existing portfolio item
@app.route('/portfolio/update', methods=["POST"])
def update_portfolio_item():
    item_data = request.json
    portfolio_item = User_stocks.query.filter_by(stock_id=item_data["item_id"]).first()
    if portfolio_item:
        portfolio_item.quantity = item_data.get("quantity", portfolio_item.quantity)
        db.session.commit()
        return jsonify({"message": "Portfolio item updated successfully"}), 200
    else:
        return jsonify({"message": "Portfolio item not found"}), 404

# Route to delete an item from the user's portfolio
@app.route('/portfolio/delete', methods=["POST"])
def delete_portfolio_item():
    item_data = request.json
    portfolio_item = User_stocks.query.filter_by(stock_id=item_data["item_id"]).first()
    if portfolio_item:
        db.session.delete(portfolio_item)
        db.session.commit()
        return jsonify({"message": "Portfolio item deleted successfully"}), 200
    else:
        return jsonify({"message": "Portfolio item not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
