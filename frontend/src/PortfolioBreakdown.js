// PortfolioBreakdown.js
import React from 'react';
import { Accordion, Table } from 'react-bootstrap';

function PortfolioBreakdown({ stocks, setActiveKey, activeKey }) {
  return (
    <Accordion.Item eventKey="portfolioBreakdown">
      <Accordion.Header onClick={() => setActiveKey(activeKey !== "portfolioBreakdown" ? "portfolioBreakdown" : null)}>
        Portfolio Breakdown
      </Accordion.Header>
      <Accordion.Body>
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Quantity</th>
              <th>Percentage of Total Portfolio</th>
              <th>Weekly Change</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.ticker}</td>
                <td>{stock.quantity || 'Loading...'}</td>
                <td>{stock.percentage_of_total ? `${stock.percentage_of_total.toFixed(2)}%` : 'Loading...'}</td>
                <td className={stock.weekly_change >= 0 ? 'positive-change' : 'negative-change'}>
                  {stock.weekly_change ? `${stock.weekly_change.toFixed(2)}%` : 'Loading...'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default PortfolioBreakdown;
