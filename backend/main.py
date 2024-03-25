from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from flask import request, jsonify, session
import requests
from models import db, User, Stock
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,JWTManager 
import logging
import sys

DATABASE_NAME = "mcsbt-capstone-sara"
USER = "sara"
PASSWORD = "Capstone123"
HOST = "34.175.227.7"

app = Flask(__name__)
app.secret_key= '156673d0aadd4b35e899d59664edd52f'
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://sara:Capstone123@34.175.227.7/mcsbt-capstone-sara'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_ECHO'] = False

db.init_app(app)
with app.app_context():
    db.create_all()

logging.basicConfig(level=logging.DEBUG)
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.INFO)

def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response

@app.route("/register", methods=["POST", "OPTIONS"])
def handle_register():
    if request.method == 'OPTIONS':
        return add_cors_headers(make_response())
    data = request.json
    username = data.get('USERNAME')
    email = data.get('EMAIL')
    password = data.get('PASSWORD')

    if not username or not email or not password:
        return jsonify({'error': 'Missing username, email, or password'}), 400
    
    hashed_password = generate_password_hash(password)
    user = User(USERNAME=username, EMAIL=email, PASSWORD=hashed_password)  # Uppercase to match model
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route("/login", methods=["POST", "OPTIONS"])
def handle_login():
    if request.method == 'OPTIONS':
        return add_cors_headers(make_response())
    data = request.get_json()
    username = data.get('USERNAME')
    password = data.get('PASSWORD')
    
    user = User.query.filter_by(USERNAME=username).first()
    
    if user and check_password_hash(user.PASSWORD, password):
        access_token = create_access_token(identity=username)
        return jsonify({
            "message": "Login successful",
            "access_token": access_token  # Include the access token in the response
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/logout', methods=["GET"])
def logout():
    session.pop('user_id', None) 
    return jsonify({"message": "Logout successful"}), 200

@app.route('/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(EMAIL=current_user_email).first()
    if user:
        user_info = {
            'USER_ID': user.USER_ID,
            'USERNAME': user.USERNAME,
            'EMAIL': user.EMAIL
        }
        return jsonify(user_info)
    else:
        return jsonify({'error': 'User not found'}), 404

def get_latest_closing_price(ticker):
    apikey = "ZSLQEIEAP5XSK6N0"
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey={apikey}"
    response = requests.get(url)
    data = response.json()
    latest_week = list(data["Weekly Time Series"].keys())[0]
    latest_close_price = data["Weekly Time Series"][latest_week]["4. close"]
    return float(latest_close_price)

@app.route('/portfolio/<email>', methods=["GET"])
def get_portfolio(email):
    user = User.query.filter_by(EMAIL=email).first()  
    if user:
        stocks_list = [
            {
                "ticker": stock.TICKER,  
                "quantity": stock.QUANTITY  
            } for stock in user.Stock.all()  
        ]
        return jsonify(stocks_list)
    return jsonify({"message": "User not found"}), 404

@app.route('/<ticker>', methods=["GET"])
def get_ticker_info(ticker):
    try:
        apikey = "ZSLQEIEAP5XSK6N0"
        stock = ticker
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={stock}&apikey={apikey}"
       
        response = requests.get(url)
        data = response.json()
        stock_info = data["Weekly Time Series"]
        selected_items = list(stock_info.items())[:10]
        stock_info = dict(selected_items)
        latest_week_key = list(stock_info.keys())[0]
        previous_week_key = list(stock_info.keys())[1]
        latest_close = float(stock_info[latest_week_key]["4. close"])
        previous_close = float(stock_info[previous_week_key]["4. close"])
        percent_change = ((latest_close - previous_close) / previous_close) * 100
        
        return jsonify({"stock_info": stock_info, "percent_change": percent_change})

    except Exception as e:
        print(str(e))
        return {"error": "Failed to fetch ticker information"}, 500

@app.route('/add-stock/<string:stock>/<int:quantity>', methods=["POST"])
@jwt_required()
def add_stock(stock, quantity):
    if quantity <= 0:
        return jsonify({"error": "Quantity must be a positive number"}), 400

    username = get_jwt_identity()
    user = User.query.filter_by(USERNAME=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        # Assume get_latest_closing_price(stock) is defined elsewhere
        get_latest_closing_price(stock)
    except Exception as e:
        return jsonify({"error": f"Invalid or inaccessible stock ticker: {stock}. Error: {str(e)}"}), 400

    existing_stock = Stock.query.filter_by(USER_ID=user.USER_ID, TICKER=stock).first()
    if existing_stock:
        existing_stock.QUANTITY += quantity
    else:
        new_stock = Stock(TICKER=stock, QUANTITY=quantity, USER_ID=user.USER_ID)
        db.session.add(new_stock)

    db.session.commit()
    return jsonify({"message": f"{quantity} units of stock {stock} added for user {username}"}), 201

@app.route('/remove-stock/<string:stock>', methods=["DELETE"])
@jwt_required()
def remove_stock(stock):
    username = get_jwt_identity()
    user = User.query.filter_by(USERNAME=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    stock_to_remove = Stock.query.filter_by(USER_ID=user.USER_ID, TICKER=stock).first()
    if stock_to_remove:
        db.session.delete(stock_to_remove)
        db.session.commit()
        return jsonify({"message": f"Stock {stock} removed for user {username}"}), 200
    else:
        return jsonify({"error": "Stock not found"}), 404
       
if __name__ == "__main__":
    app.run(debug=True)  