from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
class User(db.Model):
    __tablename__ = 'USERS'
    USER_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USERNAME = db.Column(db.String(255), unique=True, nullable=False)
    EMAIL = db.Column(db.String(255), unique=True, nullable=False)
    PASSWORD = db.Column(db.String(128), nullable=False)
    Stock = db.relationship('Stock', backref='owner', lazy='dynamic')

    def __init__(self, username, email, password):  
        self.USERNAME = username
        self.EMAIL = email
        self.PASSWORD = password
    

class Stock(db.Model):
    __tablename__ = 'USER_STOCKS'
    
    STOCK_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TICKER = db.Column(db.String(10), nullable=False)
    QUANTITY = db.Column(db.Float, nullable=False)
    USER_ID = db.Column(db.Integer, db.ForeignKey('USERS.USER_ID'))
    
    def __repr__(self):
        return f'<Stock {self.TICKER}>'
