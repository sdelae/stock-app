// PortfolioBreakdown.js
import React from 'react';
import { Table } from 'react-bootstrap';

function PortfolioBreakdown({ stocks, removeStock }) {
  return (
    <div>
      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Quantity</th>
            <th>Percentage of Total Portfolio</th>
            <th>Weekly Change</th>
            <th>Profit/Loss</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, index) => (
            <tr key={index}>
              <td>{stock.ticker}</td>
              <td>{stock.quantity}</td>
              <td>{`${stock.percentage_of_total.toFixed(2)}%`}</td>
              <td className={stock.weekly_change >= 0 ? 'positive-change' : 'negative-change'}>
                {`${stock.weekly_change.toFixed(2)}%`}
              </td>
              <td className={stock.profit_loss >= 0 ? 'positive-change' : 'negative-change'}>
                {`$${stock.profit_loss.toFixed(2)}`}
              </td>
              <td>
                <button onClick={() => removeStock(stock.ticker)} className="btn btn-danger btn-sm">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default PortfolioBreakdown;
