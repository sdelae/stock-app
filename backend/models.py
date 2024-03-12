from flask_sqlalchemy import SQLAlchemy

# Initialize an instance of the SQLAlchemy class
# This object will be used as the database adapter
db = SQLAlchemy()

# Define a Stock class which is a model for the 'stocks' table in the database
class Stock(db.Model):
    
    id = db.Column(db.Integer, primary_key=True, autoincrement="auto")  # Primary key, integer type, autoincrement
    ticker = db.Column(db.String(10), nullable=False)  # Stock ticker symbol, string type, max length 10, cannot be null
    quantity = db.Column(db.Float, nullable=False)  # Quantity of stocks owned, float type, cannot be null
    purchase_price = db.Column(db.Float, nullable=False)  # Purchase price of the stock, float type, cannot be null

    def __repr__(self):
        # This method returns a string that includes the class name and the ticker symbol
        # of the Stock object whenever it is printed out or displayed in the interpreter
        return f'<Stock {self.ticker}>'
