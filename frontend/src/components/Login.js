import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

function Login({ setLoggedIn, setShowSignUp }) {
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Instantiate useNavigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Replace with your actual backend API endpoint for login
      const response = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, password }),
      });
      const loginResponse = await response.json();

      // Check your backend response format to use the correct property names
      if (loginResponse.message === "Login successful") {
        setLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', loginResponse.userId); // Adjust as per your backend response
        navigate('/portfolio'); // Redirect to portfolio page
      } else {
        alert('Login failed: ' + (loginResponse.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={user_name}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <button type="button" onClick={() => setShowSignUp(true)}>
          Don't have an account? Sign Up
        </button>
      </form>
    </div>
  );
}

export default Login;
