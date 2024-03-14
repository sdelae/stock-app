import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://mcsbt-capstone-sara.ew.r.appspot.com/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, password }),
      });

      const loginResponse = await response.json();

      if (response.ok && loginResponse.user_id) {
        onLogin(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', loginResponse.user_id);
        navigate('/portfolio');
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
      </form>
    </div>
  );
}

export default Login;
