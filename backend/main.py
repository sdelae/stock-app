import click
import requests
import uuid
import oracledb
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask.cli import with_appcontext
from sqlalchemy import NullPool
from models import db, Users, User_stocks
import uuid

# Initialize Flask application
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = "28d8c1d608fa26a304bc47063e1d4807"

# Configure logging
logging.basicConfig(level=logging.INFO)
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)

# Oracle database credentials and connection string configuration
un = 'ADMIN'
pw = 'CapstoneProject2024'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=gec19704fd34d4a_c42uk8h9eko6mmm7_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}

db.init_app(app)  # Initialize the db (SQLAlchemy) with the app

apikey = 'ZSLQEIEAP5XSK6N0'

# Initialize bcrypt
bcrypt = Bcrypt(app)

# Flask CLI command to create the database tables
@app.cli.command("create_db")
@with_appcontext
def create_db_command():
    db.create_all()
    click.echo("Database tables created.")

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the home page!"})

# User registration endpoint
@app.route('/register', methods=["POST"])
def register_user():
    data = request.get_json()
    user_name = data['user_name']
    password = data['password']
    user_mail = data['user_mail']
    
    existing_user = Users.query.filter_by(user_name=user_name).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user_id = str(uuid.uuid4())  # Generate a unique UUID for the user_id
    new_user = Users(user_id=user_id, user_name=user_name, password=hashed_password, user_mail=user_mail)
    db.session.add(new_user)
    try:
        db.session.commit()
        return jsonify({"message": "User registered successfully", "user_id": user_id}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# User login endpoint
@app.route('/login', methods=["POST"])
def user_login():
    try:
        credentials = request.get_json()
        if not credentials:
            return jsonify({"error": "No JSON data provided"}), 400
        
        user_name = credentials.get("user_name")
        password = credentials.get("password")

        # You need to retrieve the user object from the database first
        user = Users.query.filter_by(user_name=user_name).first()
        
        if user and bcrypt.check_password_hash(user.password, password):
            app.logger.info(f"User {user_name} logged in successfully.")
            return jsonify({"message": "Login successful", "user_id": user.user_id}), 200
        else:
            app.logger.warning(f"Login failed for user {user_name}.")
            return jsonify({"error": "Invalid credentials"}), 401
    
    except Exception as e:
        app.logger.error(f"An error occurred during login: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    
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
    item_data = request.get_json()  # Use get_json() method to parse JSON data
    if not item_data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_id = item_data.get("user_id")
    ticker = item_data.get("ticker")
    quantity = item_data.get("quantity")
    purchase_price = item_data.get("purchase_price")
    action = item_data.get("action")
    stock_id = item_data.get("stock_id", uuid.uuid4().hex)

    if action not in ["add", "update", "delete"]:
        return jsonify({"error": "Invalid action specified"}), 400

    try:
        if action == "add":
            new_item = User_stocks(stock_id=stock_id, user_id=user_id, ticker=ticker, quantity=quantity, purchase_price=purchase_price)
            db.session.add(new_item)
            db.session.commit()
            return jsonify({"message": "Stock added successfully"}), 201

        elif action == "update":
            item = User_stocks.query.filter_by(stock_id=stock_id, user_id=user_id).first()
            if item:
                item.quantity = quantity
                item.purchase_price = purchase_price
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
        app.logger.error(f"An error occurred during portfolio modification: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/portfolio/<user_id>', methods=["GET"])
def get_portfolio(user_id):
    app.logger.info(f"Fetching portfolio for user: {user_id}")

    try:
        # Fetch portfolio from database
        portfolio_items = User_stocks.query.filter_by(user_id=user_id).all()
        # Convert to JSON serializable format
        portfolio_data = [
            {
                "ticker": item.ticker, 
                "quantity": item.quantity, 
                "purchase_price": item.purchase_price
            }
            for item in portfolio_items
        ]
        return jsonify(portfolio_data), 200
    
    except Exception as e:
        app.logger.error(f"An error occurred while fetching the portfolio: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(debug=True)