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

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = "28d8c1d608fa26a304bc47063e1d4807"

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

@app.route('/user/login', methods=["POST"])
def user_login():
    credentials = request.json
    user_name = credentials.get("user_name")  # Use user_name to match your model
    password = credentials.get("password", "").encode("utf-8")
    hashed_password = hashlib.sha256(password).hexdigest()

    user = Users.query.filter_by(user_name=user_name, password=hashed_password).first()
    if user:
        return jsonify({"message": "Login successful", "user_id": user.user_id}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(debug=True)
