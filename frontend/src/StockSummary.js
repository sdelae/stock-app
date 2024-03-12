import React from 'react';

// The StockSummary component accepts a totalValue prop and displays the formatted total value of the portfolio
function StockSummary({ totalValue }) {
  // The totalValue is checked to be a number; if so, it is formatted to two decimal places, otherwise, display 'Loading...'
  const formattedTotalValue = typeof totalValue === 'number' ? totalValue.toFixed(2) : 'Loading...';

  // Returns an h1 header with the total portfolio value
  // If totalValue is not a number, the text 'Loading...' will be displayed instead
  return (
    <h1>Total Portfolio Value: ${formattedTotalValue}</h1>
  );
}

// Export the StockSummary component for use in other parts of the application
export default StockSummary;
