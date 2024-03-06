from flask import Flask, render_template
import json
import requests
import time

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/stock/<ticker>')
def stock(ticker):
    """
    This function handles the '/stock/<ticker>' route. It fetches data for the specified ticker symbol from the 
    AlphaVantage API and calculates the profit or loss for the stock.

    Parameters:
    ticker (str): The ticker symbol of the stock.

    Returns:
    A rendered HTML template displaying the stock data and profit or loss.
    """

    # Try to open and load the portfolio.json file
    try:
        with open('portafolio.json') as portfolio_file:
            portfolios = json.load(portfolio_file)
    except Exception as error:
        # If there's an error, render the error.html template with the error message
        return render_template('error.html', message='Error reading portfolio data.')

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
                    # If there's an error, render the error.html template with the error message
                    return render_template('error.html', message='Could not retrieve stock data. Please try again later.')

                data = response.json()

                # If there's an error message in the API response data, render the error.html template with the error message
                if 'Error Message' in data:
                    return render_template('error.html', message=data['Error Message'])

                quote_data = data['Global Quote']

                # Extract the stock data from the API response data
                open_price = float(quote_data['02. open'])
                high_price = float(quote_data['03. high'])
                low_price = float(quote_data['04. low'])
                volume = int(quote_data.get('06. volume', 0))
                latest_close = float(quote_data['08. previous close'])
                change = float(quote_data['09. change'])
                change_percent = quote_data['10. change percent']

                # Calculate the profit or loss for the stock
                purchase_price = float(item['purchase_price'])
                profit_loss = (latest_close - purchase_price) * float(item['quantity'])
                stock_quantity[ticker] = item['quantity']

    # If the ticker was not found in the portfolio.json file, render the error.html template with an error message
    if not ticker_found:
        return render_template('error.html', message='Ticker not found in portfolio.')

    # Render the stock.html template with the stock data and profit or loss
    return render_template('stock.html', ticker=ticker, open_price=open_price, high_price=high_price, low_price=low_price, 
                           volume=volume, latest_close=latest_close, change=change, change_percent=change_percent, 
                           profit_loss=profit_loss_per_stock[ticker], quantity=stock_quantity[ticker])

@app.route('/stock/<ticker>/history')
def stock_history(ticker):
    """
    This function handles the '/stock/<ticker>/history' route. It fetches historical data for the specified 
    ticker symbol from the AlphaVantage API.

    Parameters:
    ticker (str): The ticker symbol of the stock.

    Returns:
    A rendered HTML template displaying the historical stock data.
    """

    # Build the API URL
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0'

    # Try to make the API request
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.RequestException as request_error:
        # If there's an error, render the error.html template with the error message
        return render_template('error.html', message='Could not retrieve stock data. Please try again later.')

    data = response.json()

    # If there's an error message in the API response data, render the error.html template with the error message
    if 'Error Message' in data:
        return render_template('error.html', message=data['Error Message'])

    # Extract the weekly data from the API response data
    weekly_data = data['Weekly Time Series']

    # Render the history.html template with the weekly data
    return render_template('history.html', ticker=ticker, weekly_data=weekly_data)

if __name__ == '__main__':
    app.run(debug=True)