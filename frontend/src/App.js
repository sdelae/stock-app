import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [activeKey, setActiveKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        const updatedStocks = response.data.stocks.map(stock => ({
          ...stock,
          percentage_of_total: ((stock.total_stock_value || 0) / (response.data.total_portfolio_value || 1)) * 100,
        }));
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

  const formattedTotalValue = typeof totalValue === 'number' ? totalValue.toFixed(2) : 'Loading...';

  return (
    <div>
      <h1>Total Portfolio Value: ${formattedTotalValue}</h1>
      <Accordion activeKey={activeKey}>
        <Accordion.Item eventKey="portfolioBreakdown">
          <Accordion.Header onClick={() => setActiveKey(activeKey !== "portfolioBreakdown" ? "portfolioBreakdown" : null)}>
            Portfolio Breakdown
          </Accordion.Header>
          <Accordion.Body>
            {stocks.map((stock, index) => {
              const quantity = stock.quantity ? stock.quantity : 'Loading...';
              const percentageOfTotal = stock.percentage_of_total ? stock.percentage_of_total.toFixed(2) : 'Loading...';
              const weeklyChange = stock.weekly_change ? stock.weekly_change.toFixed(2) : 'Loading...';
              return (
                <div key={index} className="stock-breakdown">
                  <div>Ticker: {stock.ticker}</div>
                  <div>Quantity: {quantity}</div>
                  <div>Percentage of Total Portfolio: {percentageOfTotal}%</div>
                  <div>Weekly Change: {weeklyChange}%</div>
                </div>
              );
            })}
          </Accordion.Body>
        </Accordion.Item>
        {stocks.map((stock, index) => {
          const eventKey = String(index + 1);
          return (
            <Accordion.Item eventKey={eventKey} key={index}>
              <Accordion.Header onClick={() => setActiveKey(activeKey !== eventKey ? eventKey : null)}>
                2 Month History: {stock.ticker}
              </Accordion.Header>
              <Accordion.Body>
                <Table striped bordered hover size="sm" responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Open</th>
                      <th>High</th>
                      <th>Low</th>
                      <th>Close</th>
                      <th>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.past_data && stock.past_data.map((weekData, weekIndex) => (
                      <tr key={weekIndex}>
                        <td>{weekData.date}</td>
                        <td>{weekData.open}</td>
                        <td>{weekData.high}</td>
                        <td>{weekData.low}</td>
                        <td>{weekData.close}</td>
                        <td>{weekData.volume}</td>
                        </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}

export default App;
