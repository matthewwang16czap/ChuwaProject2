// src/pages/ChangePassword.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import PrototypeForm from '../forms/PrototypeForm';

const ChangePassword: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const methods = useForm();

  const onSubmit = async (data: any) => {
    setMessage(null);
    setError(null);
    setLoading(true);

    if (data.newPassword !== data.confirmNewPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/user/changepassword', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setMessage('Password updated successfully.');
      methods.reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.message || 'Error changing password.');
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
      name: 'oldPassword',
      label: 'Old Password',
      type: 'input',
      inputType: 'password',
      validation: { required: 'Old password is required' },
    },
    {
      name: 'newPassword',
      label: 'New Password',
      type: 'input',
      inputType: 'password',
      validation: { required: 'New password is required' },
    },
    {
      name: 'confirmNewPassword',
      label: 'Confirm New Password',
      type: 'input',
      inputType: 'password',
      validation: { required: 'Please confirm your new password' },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
      {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      <PrototypeForm
        fields={fields}
        onSubmit={onSubmit}
        methods={methods}
        submitButtonLabel={loading ? 'Changing Password...' : 'Change Password'}
      />
    </div>
  );
};

export default ChangePassword;
