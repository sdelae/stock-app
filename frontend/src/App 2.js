// Importing necessary hooks from React
import React, { useEffect, useState } from 'react';

// App component
function App() {
  // Declaration for portfolios
  const [portfolios, setPortfolios] = useState(null);

  // useEffect hook to fetch data on component mount
  useEffect(() => {
    // Fetch the data from the backend
    fetch('http://127.0.0.1:5000/')
      .then(response => response.json())
      .then(data => {
        // Set the portfolios data once fetched
        setPortfolios(data.portfolios);
      })
      // Catch and log any errors
      .catch(error => console.error('Error:', error));
  }, []); // Empty dependency array ensures this runs once on mount

  // Render method
  return (
    <div>
      {/* Check if portfolios data is available */}
      {portfolios ? 
        // Map over the items in the first portfolio and display them
        portfolios[0].items.map((item, index) => (
        <div key={index}>
          {item.ticker}: Quantity - {item.quantity}, Purchase Price - {item.purchase_price}
        </div>
      )) : 
        // If portfolios data is not available, display "Loading..."
        "Loading..."}
    </div>
  );
}

// Export the App component
export default App;