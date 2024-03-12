import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import StockSummary from './StockSummary';
import PortfolioBreakdown from './PortfolioBreakdown';
import StockDetail from './StockDetail';

function AddStockForm({ onNewStock }) {
  // State hooks for the form inputs
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Call the onNewStock function passed as a prop with the new stock data
    onNewStock({ ticker, quantity: Number(quantity), purchase_price: Number(purchasePrice) });
    // Reset the form fields after submission
    setTicker('');
    setQuantity('');
    setPurchasePrice('');
  };

  // Render the form component
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        type="text"
        placeholder="Ticker"
        required
      />
      <input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        type="number"
        placeholder="Quantity"
        required
      />
      <input
        value={purchasePrice}
        onChange={(e) => setPurchasePrice(e.target.value)}
        type="number"
        placeholder="Purchase Price"
        step="0.01"
        required
      />
      <button type="submit">Add to Portfolio</button>
    </form>
  );
}

function App() {
  const [stocks, setStocks] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [activeKey, setActiveKey] = useState(null);
  const [error, setError] = useState(null);

  const handleNewStock = (newStockData) => {
    axios.post('https://mcsbt-integration-sara.ew.r.appspot.com/add_stock', newStockData)
      .then(response => {
        fetchStocks(); // Call fetchStocks to reload data after adding a new stock
      })
      .catch(error => {
        console.error('Error adding stock: ', error);
        setError(error);
      });
  };

  const removeStock = (ticker) => {
    axios.delete(`https://mcsbt-integration-sara.ew.r.appspot.com/delete_stock/${ticker}`)
      .then(() => {
        fetchStocks(); // Refresh the stock list after successful deletion
      })
      .catch(error => {
        console.error('Error removing stock:', error);
      });
  };

  const fetchStocks = () => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        setStocks(response.data.stocks);
        setTotalValue(response.data.total_portfolio_value);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error);
      });
  };

  // useEffect hook to fetch stock data on component mount
  useEffect(() => {
    fetchStocks();
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

// Render the main app structure
return (
  <div className="App">
    <AddStockForm onNewStock={handleNewStock} />
    <StockSummary totalValue={totalValue} />
    <PortfolioBreakdown stocks={stocks} removeStock={removeStock} />
    {/* Map over the stocks array to create an Accordion component for each stock's 2-month history */}
      <Accordion defaultActiveKey="0" activeKey={activeKey}>
      {stocks.map((stock, index) => (
      <StockDetail key={index} stock={stock} index={index} setActiveKey={setActiveKey} activeKey={activeKey} />
      ))}
    </Accordion>
  </div>
);
}

// Export the App component for use in other files
export default App;