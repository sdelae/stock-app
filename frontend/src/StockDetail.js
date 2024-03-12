import React from 'react';
import { Accordion, Table } from 'react-bootstrap';

// The StockDetail component is responsible for displaying detailed historical data for a single stock.
function StockDetail({ stock, index, setActiveKey, activeKey }) {
  // Convert the current index to a string to use as the Accordion.Item eventKey
  const eventKey = String(index);

  return (
    // Each Accordion.Item represents the detailed view for a single stock's historical data
    <Accordion.Item eventKey={eventKey}>
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
          {/* Table body lists out each week's data in rows */}
          <tbody>
            {/* Map over each entry in the stock's past_data to generate a table row */}
            {stock.past_data.map((weekData, weekIndex) => (
              // Each row has a unique key for React to keep track of the list items
              <tr key={weekIndex}>
                // Each cell displays the corresponding data point for the week
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
}

// Export the StockDetail component for use in other parts of the application
export default StockDetail;
