import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion, AccordionBody, AccordionButton, Card, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function App() {
  const [stocks, setStocks] = useState([]);

  // Use the useEffect hook to run code after the component mounts
  useEffect(() => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com/')
      .then(response => {
        // Map over the response data (an array of stocks)
        // For each stock, sort the past_data array by date (from newest to oldest)
        const sortedStocks = response.data.map(stock => ({
          ...stock,
          past_data: stock.past_data.sort((a, b) => new Date(b.date) - new Date(a.date)),
        }));
        setStocks(sortedStocks);
      })
      .catch(error => {
        // Log any errors to the console
        console.log(error);
      });
  }, []); // The empty array means this useEffect will run once after the component mounts, and not on subsequent re-renders

  // Render the component
  return (
    // Accordion component to create a collapsible list
    <Accordion defaultActiveKey="0">
      {stocks.map((stock, index) => (
        // For each stock, create a Card component
        <Card key={index}>
          <Card.Header>
            {/* AccordionButton component to create a button that toggles the visibility of the stocks past data */}
            <AccordionButton as={Card.Header} eventKey={`${index}`}>
              {/* Stock's ticker and profit/loss */}
              {stock.ticker} - Profit/Loss: {stock.profit_loss}
            </AccordionButton>
          </Card.Header>
          <AccordionBody eventKey={`${index}`}>
            <Card.Body>
              {/* Use the Table component to display the stock's past data */}
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
                  {stock.past_data.map((weekData, weekIndex) => (
                    // For each week of past data, create a table row
                    <tr key={weekIndex}>
                      {/* Display the date, open, high, low, close, and volume for the week */}
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
            </Card.Body>
          </AccordionBody>
        </Card>
      ))}
    </Accordion>
  );
                  }

  export default App;