import React, { useState, useEffect } from 'react';

const Stock = ({ ticker }) => {
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/stock/${ticker}`)
            .then(response => response.json())
            .then(data => {
                setStockData(data);
                setLoading(false);
            });
    }, [ticker]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!stockData) {
        return <div>Error: Stock data not found</div>;
    }

    return (
        <div>
            <h1>{stockData.ticker}</h1>
            <p>Profit/Loss: {stockData.profit_loss}</p>
            <p>Quantity: {stockData.quantity}</p>
        </div>
    );
};

export default Stock;