// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import PrototypeForm from '../forms/PrototypeForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const methods = useForm();

  const onSubmit = async (data: any) => {
    setError(''); // Reset error message

    try {
      const response = await axiosInstance.post('/api/user/login', {
        username: data.username,
        password: data.password,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/'); // Redirect to home or dashboard
      } else {
        setError('Login failed. No token returned.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError('An error occurred. Please try again later.');
        }
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  // Define form fields
  const fields = [
    {
      name: 'username',
      label: 'Username',
      type: 'input',
      validation: { required: 'Username is required' },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'input',
      inputType: 'password',
      validation: { required: 'Password is required' },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && (
        <div className="mb-4 text-red-600 text-center">
          {error}
        </div>
      )}
      <PrototypeForm
        fields={fields}
        onSubmit={onSubmit}
        methods={methods}
        submitButtonLabel="Login"
      />
    </div>
  );
};

export default LoginPage;
