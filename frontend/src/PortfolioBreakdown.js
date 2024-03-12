import React from 'react';
import { Accordion, Table } from 'react-bootstrap';

// The PortfolioBreakdown component takes in stocks, setActiveKey, and activeKey as props
function PortfolioBreakdown({ stocks, setActiveKey, activeKey }) {
  return (
    // Accordion.Item is used to create a collapsible element in the Accordion
    <Accordion.Item eventKey="portfolioBreakdown">
      {/* Accordion.Header is clickable to show or hide the Accordion.Body */}
      <Accordion.Header onClick={() => setActiveKey(activeKey !== "portfolioBreakdown" ? "portfolioBreakdown" : null)}>
        Portfolio Breakdown
      </Accordion.Header>
      {/* Accordion.Body contains the content that shows/hides on click */}
      <Accordion.Body>
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Ticker</th> // Column for the stock ticker symbol
              <th>Quantity</th> // Column for the quantity of stocks owned
              <th>Percentage of Total Portfolio</th> // Column for the stock's percentage of the total portfolio
              <th>Weekly Change</th> // Column for the stock's weekly performance change
              <th>Profit/Loss</th> // Column for the profit or loss (comment indicates it's a new addition)
            </tr>
          </thead>
          {/* // Table body contains rows of stock data */}
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={index}> // Unique key for each row for React's reconciliation
                <td>{stock.ticker}</td> // Displays the stock ticker
                <td>{stock.quantity || 'Loading...'}</td> // Shows quantity or loading state
                <td>{stock.percentage_of_total ? `${stock.percentage_of_total.toFixed(2)}%` : 'Loading...'}</td>
                {/* Conditionally sets the class for positive or negative weekly change */}
                <td className={stock.weekly_change >= 0 ? 'positive-change' : 'negative-change'}>
                  {stock.weekly_change ? `${stock.weekly_change.toFixed(2)}%` : 'Loading...'}
                </td>
                {/* Conditionally sets the class for positive or negative profit/loss and formats it */}
                <td className={stock.profit_loss >= 0 ? 'positive-change' : 'negative-change'}>
                  {stock.profit_loss ? `$${stock.profit_loss.toFixed(2)}` : 'Loading...'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Accordion.Body>
    </Accordion.Item>
  );
}

// Export the component for use in other parts of the application
export default PortfolioBreakdown;
