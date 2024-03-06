import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [error, setError] = useState(null); // Add a new state for error

  // Use useEffect hook to fetch data when the component mounts
  useEffect(() => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        // If the request is successful, update the stocks state
        setStocks(response.data);
      })
      .catch(error => {
        // If an error occurs, log it to the console and update the error state
        console.error(error);
        setError(error); // Set the error state if an error occurs
      });
  }, []); // Empty dependency array means this effect runs once on mount

  // If there's an error, render an error message
  if (error) {
    return <div>Error: {error.message}</div>; // Render an error message if an error occurs
  }

  return (
    // Use the Accordion component from react-bootstrap
    <Accordion activeKey={activeKey}>
      {/* Map over the stocks array and create an Accordion.Item for each stock */}
      {stocks.map((stock, index) => {
        const eventKey = String(index);
        return (
          // Create an Accordion.Item with the eventKey and key set to the index
          <Accordion.Item eventKey={eventKey} key={index}>
            {/* Create an Accordion.Header that updates the activeKey state when clicked */}
            <Accordion.Header onClick={() => setActiveKey(activeKey !== eventKey ? eventKey : null)}>
              {/* Display the stock ticker and profit/loss rounded to 2 decimal places */}
              {stock.ticker} - Profit/Loss: {Number(stock.profit_loss).toFixed(2)}
            </Accordion.Header>
            {/* Create an Accordion.Body that contains a Table */}
            <Accordion.Body>
              {/* Use the Table component from react-bootstrap */}
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
                  {/* Map over the past_data array and create a table row for each week */}
                  {stock.past_data.map((weekData, weekIndex) => (
                    <tr key={weekIndex}>
                      {/* Display the date, open, high, low, close, and volume */}
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
  );
}

export default App;