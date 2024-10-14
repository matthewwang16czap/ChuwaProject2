// src/components/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store'; // Adjust the import path as needed

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[]; // Array of roles allowed to access the route
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  // Access user from Redux store
  const user = useSelector((state: RootState) => state.user.user);

  if (!user) {
    // User is not authenticated
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;

  if (roles.length > 0 && !roles.includes(userRole)) {
    // User does not have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role
  return children;
};

export default PrivateRoute;
