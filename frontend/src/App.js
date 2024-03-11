import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import StockSummary from './StockSummary';
import PortfolioBreakdown from './PortfolioBreakdown';
import StockDetail from './StockDetail';

function App() {
  const [stocks, setStocks] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [activeKey, setActiveKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        setStocks(response.data.stocks);
        setTotalValue(response.data.total_portfolio_value);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
        setError(error);
      });
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <StockSummary totalValue={totalValue} />
      <Accordion activeKey={activeKey}>
        <PortfolioBreakdown stocks={stocks} setActiveKey={setActiveKey} activeKey={activeKey} />
        {stocks.map((stock, index) => (
          <StockDetail key={index} stock={stock} index={index} setActiveKey={setActiveKey} activeKey={activeKey} />
        ))}
      </Accordion>
    </div>
  );
}

export default App;