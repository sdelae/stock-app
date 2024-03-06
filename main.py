"""
Ran within the terminal to install the flask and flask-cors packages

pip install -U flask-cors
"""

from flask import Flask, jsonify
from flask_cors import CORS
import json
import requests
import time

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the home page!"})

@app.route('/api/stock/<ticker>', methods=['GET'])
def stock(ticker):
    """
    This function handles the '/api/stock/<ticker>' route. It fetches data for the specified ticker symbol from the AlphaVantage API 
    and calculates the profit or loss for the stock.

    Parameters:
    ticker (str): The ticker symbol of the stock.

    Returns:
    A JSON object containing the stock data and profit or loss.
    """

    # Try to open and load the portfolio.json file
    try:
        with open('portafolio.json') as portfolio_file:
            portfolios = json.load(portfolio_file)
    except Exception as error:
        # If there's an error, return JSON object with error message
        return jsonify({'error': 'Error reading portfolio data.'}), 500

    profit_loss_per_stock = {}
    stock_quantity = {}

    ticker_found = False

    # Loop through each portfolio and item in the portfolio
    for portfolio in portfolios['portfolios']:
        for item in portfolio['items']:
            # If the item's ticker matches the specified ticker
            if item['ticker'] == ticker:
                ticker_found = True

                # Build the API URL
                url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0'

                # Try to make the API request
                try:
                    response = requests.get(url)
                    response.raise_for_status()
                except requests.exceptions.RequestException as request_error:
                    # If there's an error, return JSON object with error message
                    return jsonify({'error': 'Could not retrieve stock data. Please try again later.'}), 500

                # Delay to control API rate limits
                time.sleep(5)

                data = response.json()

                # If there's an error message in the API response data, return JSON object with error message
                if 'Error Message' in data:
                    return jsonify({'error': data['Error Message']}), 500

                quote_data = data['Global Quote']

                # Extract the stock data from the API response data
                open_price = float(quote_data['02. open'])
                high_price = float(quote_data['03. high'])
                low_price = float(quote_data['04. low'])
                volume = int(quote_data.get('06. volume', 0))
                latest_close = float(quote_data['08. previous close'])
                change = float(quote_data['09. change'])
                change_percent = float(quote_data['10. change percent'].rstrip('%'))

                # Calculate the profit or loss for the stock
                profit_loss_per_stock[ticker] = (latest_close - item['purchase_price']) * item['quantity']
                stock_quantity[ticker] = item['quantity']

    # If the ticker was not found in portfolio.json, return JSON object with error message
    if not ticker_found:
        return jsonify({'error': 'Ticker not found in portfolio.'}), 404

    # Return the stock data and profit or loss as a JSON object
    return jsonify({
        'ticker': ticker,
        'open_price': open_price,
        'high_price': high_price,
        'low_price': low_price,
        'volume': volume,
        'latest_close': latest_close,
        'change': change,
        'change_percent': change_percent,
        'profit_loss': profit_loss_per_stock[ticker],
        'quantity': stock_quantity[ticker]
    })

if __name__ == '__main__':
    app.run(debug=True)