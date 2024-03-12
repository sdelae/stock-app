import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import StockSummary from './StockSummary';
import PortfolioBreakdown from './PortfolioBreakdown';
import StockDetail from './StockDetail';

// Define a form component for adding new stock entries
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
    // The form element with an onSubmit event handler
    <form onSubmit={handleSubmit}>
      // Input for the stock ticker, automatically converting text to uppercase
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        type="text"
        placeholder="Ticker"
        required
      />
      // Input for the quantity of stocks to add
      <input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        type="number"
        placeholder="Quantity"
        required
      />
      // Input for the purchase price of the stock
      <input
        value={purchasePrice}
        onChange={(e) => setPurchasePrice(e.target.value)}
        type="number"
        placeholder="Purchase Price"
        step="0.01"
        required
      />
      // Button to submit the form
      <button type="submit">Add to Portfolio</button>
    </form>
  );
}

// Define the main app component
function App() {
  // State hooks for various pieces of data
  const [stocks, setStocks] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [activeKey, setActiveKey] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle adding a new stock
  const handleNewStock = (newStockData) => {
    axios.post('https://mcsbt-integration-sara.ew.r.appspot.com/add_stock', newStockData)
      .then(response => {
        console.log(response.data);
        // Call fetchStocks to reload data after adding a new stock
        fetchStocks();
      })
      .catch(error => {
        console.error('Error adding stock: ', error);
        setError(error);
      });
  };

  // Function to fetch stock data from the server
  const fetchStocks = () => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        setStocks(response.data.stocks);
        setTotalValue(response.data.total_portfolio_value);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
        setError(error);
      });
  };

  // useEffect hook to fetch stock data on component mount
  useEffect(() => {
    fetchStocks();
  }, []);

  // Conditional rendering for error states
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Render the main app structure
  return (
    <div className="App">
      // Form component for adding new stock entries
      <AddStockForm onNewStock={handleNewStock} />
      // Component to display the total value of the stock portfolio
      <StockSummary totalValue={totalValue} />
      // Accordion component for displaying stocks in a collapsible format
      <Accordion defaultActiveKey="0" activeKey={activeKey}>
        // Component to display a breakdown of the portfolio
        <PortfolioBreakdown stocks={stocks} setActiveKey={setActiveKey} activeKey={activeKey} />
        // Map over the stocks array to create a StockDetail component for each stock
        {stocks.map((stock, index) => (
          <StockDetail key={index} stock={stock} index={index} setActiveKey={setActiveKey} activeKey={activeKey} />
        ))}
      </Accordion>
    </div>
  );
}

// Export the App component for use in other files
export default App;