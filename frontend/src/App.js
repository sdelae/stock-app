import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // State to store the list of stocks and total portfolio value
  const [stocks, setStocks] = useState([]);
  const [totalValue, setTotalValue] = useState(0); 
  const [activeKey, setActiveKey] = useState(null); // State to manage which accordion item is open
  const [error, setError] = useState(null); // State to store any error from the API request

  useEffect(() => {
    // Fetch data from the backend on component mount
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        // Update state with data from backend
        setStocks(response.data.stocks); // Update stocks with detailed data
        setTotalValue(response.data.total_portfolio_value); // Update total portfolio value
      })
      .catch(error => {
        // Handle any errors from the fetch operation
        console.error('Error fetching data: ', error);
        setError(error); // Store the error
      });
  }, []); // Effect runs only once on mount

  // Early return in case of an error
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {/* Display the total value of the portfolio */}
      <h1>Total Portfolio Value: ${totalValue.toFixed(2)}</h1>
      <Accordion activeKey={activeKey}>
        {stocks.map((stock, index) => {
          const eventKey = String(index); // Unique key for each accordion item
          return (
            <Accordion.Item eventKey={eventKey} key={index}>
              <Accordion.Header onClick={() => setActiveKey(activeKey !== eventKey ? eventKey : null)}>
                {/* Display ticker, profit/loss, and percentage of total value */}
                {`${stock.ticker} - Profit/Loss: ${stock.profit_loss.toFixed(2)} (${stock.percentage_of_total.toFixed(2)}%)`}
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
                    {/* Map over each week's data for the stock and display it */}
                    {stock.past_data.map((weekData, weekIndex) => (
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
