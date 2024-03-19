import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user_mail, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Here you would replace with your API endpoint for registration
    const fetchUrl = 'http://127.0.0.1:5000/register';

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, user_mail, password }),
      });

      if (response.ok) {
        await response.json(); // you can call .json() to process the response if needed, but don't assign it to a variable
        alert('Registration successful');
        navigate('/login'); // Navigate to login page after registration
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
          <label>Email:</label>
          <input
            type="user_mail"
            value={user_mail}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
