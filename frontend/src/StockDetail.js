import React from 'react';
import { Accordion, Table } from 'react-bootstrap';

function StockDetail({ stock, index, setActiveKey, activeKey }) {
  const eventKey = String(index);

  return (
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
          <tbody>
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
}

export default StockDetail;
