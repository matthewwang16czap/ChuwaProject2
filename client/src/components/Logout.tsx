// src/components/Logout.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice'; // Adjust the path as needed
import { Button, Result } from 'antd';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleLoginRedirect = () => {
    navigate('/login');
    window.location.reload();
  };

  return (
    <Result
      status="success"
      title="Logged out successfully"
      extra={
        <Button type="primary" onClick={handleLoginRedirect}>
          Go to Login
        </Button>
      }
    />
  );
};

export default Logout;
