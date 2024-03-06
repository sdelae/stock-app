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
    with open('portafolio.json') as f:
        portfolios = json.load(f)

    profit_loss_per_stock = {}
    stock_quantity = {}

    for portfolio in portfolios['portfolios']:
        for item in portfolio['items']:
            if item['ticker'] == ticker:
                url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0'
                r = requests.get(url)
                data = r.json()

                quote_data = data['Global Quote']

                open_price = float(quote_data['02. open'])
                high_price = float(quote_data['03. high'])
                low_price = float(quote_data['04. low'])
                volume = int(quote_data.get('06. volume', 0))
                latest_close = float(quote_data['08. previous close'])
                change = float(quote_data['09. change'])
                change_percent = quote_data['10. change percent']

                purchase_price = float(item['purchase_price'])
                profit_loss = (latest_close - purchase_price) * float(item['quantity'])
                stock_quantity[ticker] = item['quantity']

                profit_loss_per_stock[ticker] = profit_loss

                # Sleep for 12 seconds to avoid hitting API limit
                time.sleep(12)

    return render_template('stock.html', ticker=ticker, open_price=open_price, high_price=high_price, low_price=low_price, 
                           volume=volume, latest_close=latest_close, change=change, change_percent=change_percent, 
                           profit_loss=profit_loss_per_stock[ticker], quantity=stock_quantity[ticker])

@app.route('/stock/<ticker>/history')
def stock_history(ticker):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={ticker}&apikey=ZSLQEIEAP5XSK6N0'
    r = requests.get(url)
    data = r.json()

    weekly_data = data['Weekly Time Series']

    # Extract the data for the last 8 weeks
    history = list(weekly_data.items())[:8]

    return render_template('history.html', ticker=ticker, history=history)

if __name__ == '__main__':
    app.run(debug=True)