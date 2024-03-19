import React, { useEffect, useState } from 'react';

function DisplayPortfolio({ handleDetailsClick, setShowModal }) {
  const [portfolioData, setPortfolioData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const userId = localStorage.getItem('userId');

  // Function to handle logout
  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userId');
    // Redirect to login or home page after logout
    window.location.href = '/';
  };

  // Function to search for a stock symbol
  const handleSearch = async (event) => {
    const symbol = event.target.value;
    if (symbol) {
      const response = await fetch(`http://127.0.0.1:5000/search/${symbol}`);
      const data = await response.json();
      setSearchResults(data.bestMatches);
    }
  };

  // Fetch portfolio data from the backend
  useEffect(() => {
    async function fetchPortfolio() {
      if (userId) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/portfolio/${userId}`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setPortfolioData(data);
        } catch (error) {
          console.error('Error fetching portfolio data:', error);
        }
      }
    }
    fetchPortfolio();
  }, [userId]);

  return (
    <div>
      <h2>My Portfolio</h2>
      <button onClick={handleLogout}>Logout</button>
      <input type="text" placeholder="Search Symbol" onChange={handleSearch} />
      {searchResults && searchResults.length > 0 && (
        <div>
          {searchResults.map((result, index) => (
            <div key={index}>
              Symbol: {result['1. symbol']}
              <button onClick={() => handleDetailsClick(result['1. symbol'])}>View Details</button>
            </div>
          ))}
        </div>
      )}
      {portfolioData.length > 0 ? (
        <ul>
          {portfolioData.map((item, index) => (
            <li key={index}>
              Symbol: {item.symbol}, Quantity: {item.quantity}
              <button onClick={() => handleDetailsClick(item.symbol)}>View Details</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Your portfolio is empty.</p>
      )}
      <button onClick={() => setShowModal(true)}>Add/Update Stocks</button>
    </div>
  );
}

export default DisplayPortfolio;