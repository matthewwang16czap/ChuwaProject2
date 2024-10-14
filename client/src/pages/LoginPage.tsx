// src/pages/LoginPage.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PrototypeForm from '../forms/PrototypeForm';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/user/userSlice'; // Adjust the path as needed
import { RootState } from '../app/store'; // Adjust the path as needed

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loginStatus, error } = useSelector((state: RootState) => state.user);

  const methods = useForm();

  const onSubmit = (data: any) => {
    dispatch(login(data));
  };

  useEffect(() => {
    if (loginStatus === 'succeeded') {
      navigate('/'); // Redirect to home or dashboard
    }
  }, [loginStatus, navigate]);

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
        submitButtonLabel={loginStatus === 'loading' ? 'Logging in...' : 'Login'}
      />
    </div>
  );
};

export default LoginPage;
