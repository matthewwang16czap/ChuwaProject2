// src/pages/RegisterPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import PrototypeForm from '../forms/PrototypeForm';

interface JwtPayload {
  user: {
    email: string;
  };
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      email: email || '',
    },
  });

  // Update default values when email changes
  useEffect(() => {
    methods.reset({
      email: email || '',
    });
  }, [email, methods]);

  // Extract token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');

    if (tokenParam) {
      setToken(tokenParam);
      try {
        // Decode the token to extract the email
        const decoded = jwtDecode<JwtPayload>(tokenParam);
        const userEmail = decoded?.user?.email;
        if (userEmail) {
          setEmail(userEmail);
        } else {
          setError('Invalid token: email not found.');
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Invalid token.');
      }
    } else {
      setError('Invalid or missing token.');
    }
  }, [location.search]);

  const onSubmit = async (data: any) => {
    setMessage(null);
    setError(null);

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/registration/register', {
        email: email,
        username: data.username,
        password: data.password,
        token: token,
      });

      setMessage('Registration successful! Redirecting to login page...');
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.message || 'Error during registration.');
        } else {
          setError('Network error. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Define form fields
  const fields = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'input',
      disabled: true,
      validation: { required: 'Email is required' },
    },
    {
      name: 'username',
      label: 'Username',
      type: 'input',
      validation: { required: 'Username is required' },
    },
    {
        name: 'password',
        label: 'Password',
        type: 'input', // Change type to 'input'
        inputType: 'password', // Add inputType
        validation: { required: 'Password is required' },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'input', // Change type to 'input'
        inputType: 'password', // Add inputType
        validation: { required: 'Confirm your password' },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Employee Registration</h2>
      {email && <p className="text-center mb-4">Hello, {email}</p>}
      {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      {token && email ? (
        <PrototypeForm
          fields={fields}
          onSubmit={onSubmit}
          methods={methods}
          submitButtonLabel={loading ? 'Registering...' : 'Register'}
        />
      ) : (
        <div className="text-center text-red-600">Invalid or missing token.</div>
      )}
    </div>
  );
};

export default RegisterPage;
