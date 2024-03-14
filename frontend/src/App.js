import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import Login from './components/Login';
import ModalStocks from './components/ModalStocks';

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchUrl = 'https://mcsbt-capstone-sara.ew.r.appspot.com/';

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${fetchUrl}/portfolio/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [userId, fetchUrl]); 

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${fetchUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Failed to login');
      const jsonData = await response.json();
      if (jsonData.message === "Login successful") {
        setLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', jsonData.user_id);
        setUserId(jsonData.user_id);
        fetchData();
      } else {
        console.error('Login failed:', jsonData.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    setUserId('');
    setData([]);
  };

  const postStock = async (stockData) => {
    try {
      const response = await fetch(`https://mcsbt-capstone-sara.ew.r.appspot.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...stockData, // Spread the stock data into the request body
          userId: userId, 
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to post stock data');
      }
      const jsonData = await response.json();
      if (jsonData.success) {
        // If the stock was added or updated successfully, you might want to:
        // 1. Close the modal
        setShowModal(false);
        // 2. Fetch the updated portfolio data
        fetchData();
      } else {
        // Handle any errors returned by the server
        console.error('Failed to post stock data:', jsonData.message);
      }
    } catch (error) {
      console.error('Error posting stock data:', error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchData();
    }
  }, [loggedIn, userId, fetchData]); 

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={loggedIn ? <Navigate replace to="/portfolio" /> : <Login onLogin={handleLogin} />} />
        <Route path="/portfolio" element={loggedIn ? <Portfolio data={data} /> : <Navigate replace to="/" />} />
        {/* Additional routes can be added here */}
      </Routes>
      {loggedIn && (
        <>
          <button onClick={() => setShowModal(true)}>Manage Stocks</button>
          <button onClick={handleLogout}>Logout</button>
          {showModal && <ModalStocks postStock={postStock} setShowModal={setShowModal} />}
        </>
      )}
    </div>
  );
}

export default App;
