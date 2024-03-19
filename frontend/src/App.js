import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import Login from './components/Login';
import Register from './components/Register';
import ModalStocks from './components/ModalStocks';

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const fetchUrl = 'http://127.0.0.1:5000';

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
      const response = await fetch(`${fetchUrl}/login`, {
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
        navigate('/portfolio');
      } else {
        alert('Login failed: ' + (jsonData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    setUserId('');
    setData([]);
    navigate('/');
  };

  const postStock = async (stockData) => {
    try {
      const response = await fetch(`${fetchUrl}/portfolio/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...stockData, // Spread the stock data into the request body
          userId: userId, 
        }),
      });
      if (!response.ok) throw new Error('Failed to post stock data');
      const jsonData = await response.json();
      if (jsonData.success) {
        setShowModal(false);
        fetchData();
      } else {
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
        <Route path="/" element={
          loggedIn ? <Navigate replace to="/portfolio" /> : (
            <div>
              <Login onLogin={handleLogin} />
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          )
        } />
        <Route path="/portfolio" element={loggedIn ? <Portfolio data={data} /> : <Navigate replace to="/" />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login onLogin={setLoggedIn} />} />
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
