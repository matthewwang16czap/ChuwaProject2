// src/components/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // User is not authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return children;
};

export default PrivateRoute;
