import React, { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio.js'; 
import Login from './components/Login.js'; 
import ModalStocks from './components/ModalStocks.js'; 

function App() {
  // State to manage the authentication and data
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async (userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/portfolio/${userId}`);
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchLogin = async (credentials) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
  
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
  
      const jsonData = await response.json();
      if (jsonData.success) {
        setLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', jsonData.userId);
      } else {
        console.error('Login failed:', jsonData.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };  

  const postStock = async (stockData) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/portfolio/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // Assuming you need to send userId along with the stock data
          ...stockData,
        }),
      });
      const jsonData = await response.json();
      if (jsonData.success) {
        console.log('Stock updated successfully');
        // Optionally, fetch the updated portfolio data
        fetchData(userId);
      } else {
        // Handle failure
        console.error('Failed to update the stock:', jsonData.message);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };  

  // Fetch data when user logs in
  useEffect(() => {
    if (loggedIn) {
      fetchData(userId);
    }
  }, [loggedIn, userId]);

  // Effect to check if user is already logged in when app loads
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    if (isLogged && storedUserId) {
      setLoggedIn(true);
      setUserId(storedUserId);
    }
  }, []);

  return (
    <div className="App">
      {loggedIn ? (
        <>
          <Portfolio data={data} />
          {showModal && (
          <ModalStocks postStock={postStock} setShowModal={setShowModal} />
          )}
        </>
      ) : (
        <Login fetchLogin={fetchLogin} setLoggedIn={setLoggedIn} />
      )}
    </div>
  );
}

export default App;
