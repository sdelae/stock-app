import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion, AccordionButton, AccordionCollapse, Card, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function App() {
  const [stocks, setStocks] = useState([]);
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    axios.get('https://mcsbt-integration-sara.ew.r.appspot.com')
      .then(response => {
        setStocks(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const toggleActiveKey = (key) => {
    // This toggles the accordion item. If the item was already open, it will close it.
    setActiveKey(activeKey === key ? null : key);
  };

  return (
    <Accordion activeKey={activeKey}>
      {stocks.map((stock, index) => (
        <Card key={index}>
          <Card.Header>
            <AccordionButton onClick={() => toggleActiveKey(`${index}`)}>
              {stock.ticker} - Profit/Loss: {stock.profit_loss}
            </AccordionButton>
          </Card.Header>
          <AccordionCollapse eventKey={`${index}`}>
            <Card.Body>
              <Table striped bordered hover size="sm" responsive>
                <thead>
                  <tr>
                    <th>Week</th>
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
                      <td>{weekIndex + 1}</td>
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
          </AccordionCollapse>
        </Card>
      ))}
    </Accordion>
  );
}

export default App;
