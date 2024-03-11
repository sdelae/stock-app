// StockSummary.js
import React from 'react';

function StockSummary({ totalValue }) {
  const formattedTotalValue = typeof totalValue === 'number' ? totalValue.toFixed(2) : 'Loading...';

  return (
    <h1>Total Portfolio Value: ${formattedTotalValue}</h1>
  );
}

export default StockSummary;
