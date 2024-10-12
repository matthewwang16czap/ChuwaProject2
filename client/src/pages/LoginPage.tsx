// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // State variables for form fields and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Reset error message

    try {
      const response = await axiosInstance.post('/api/user/login', {
        username,
        password,
      });

      // Assuming the server returns { token: 'your_jwt_token' }
      const { token } = response.data;

      if (token) {
        // Store the token and redirect
        localStorage.setItem('token', token);
        navigate('/'); // Redirect to home or dashboard
      } else {
        setError('Login failed. No token returned.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle Axios errors
        if (err.response && err.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError('An error occurred. Please try again later.');
        }
      } else {
        // Handle other errors
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && (
        <div className="mb-4 text-red-600 text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
