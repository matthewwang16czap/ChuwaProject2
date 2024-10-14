// src/pages/RegisterPage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/registration/registrationSlice'; // Adjust the path as needed
import { RootState } from '../app/store'; // Adjust the path as needed
import PrototypeForm from '../forms/PrototypeForm';

interface JwtPayload {
  user: {
    email: string;
  };
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationStatus, error } = useSelector((state: RootState) => state.registration);

  const [token, setToken] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);

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
          methods.setError('email', { type: 'manual', message: 'Invalid token: email not found.' });
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        methods.setError('email', { type: 'manual', message: 'Invalid token.' });
      }
    } else {
      methods.setError('email', { type: 'manual', message: 'Invalid or missing token.' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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

  const loading = registrationStatus === 'loading';

  const onSubmit = (data: any) => {
    if (data.password !== data.confirmPassword) {
      methods.setError('confirmPassword', { type: 'manual', message: 'Passwords do not match.' });
      return;
    }

    dispatch(
      register({
        email: email!,
        username: data.username,
        password: data.password,
        token: token!,
      })
    );
  };

  useEffect(() => {
    if (registrationStatus === 'succeeded') {
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [registrationStatus, navigate]);

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
      type: 'input',
      inputType: 'password',
      validation: { required: 'Password is required' },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'input',
      inputType: 'password',
      validation: { required: 'Confirm your password' },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Employee Registration</h2>
      {email && <p className="text-center mb-4">Hello, {email}</p>}
      {registrationStatus === 'succeeded' && (
        <div className="mb-4 text-green-600 text-center">
          Registration successful! Redirecting to login page...
        </div>
      )}
      {registrationStatus === 'failed' && error && (
        <div className="mb-4 text-red-600 text-center">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}
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
