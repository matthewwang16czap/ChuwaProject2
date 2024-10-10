// src/components/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[]; // Array of roles allowed to access the route
}

interface JwtPayload {
  user: {
    userId: string | null | undefined;
    role: string;
    email: string;
  };
  // Removed the 'exp' field since it's not present in the payload
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // User is not authenticated
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the token to get user information
    const decoded = jwtDecode<JwtPayload>(token);
    console.log(decoded);
    const userRole = decoded.user.role;

    if (roles.length > 0 && !roles.includes(userRole)) {
      // User does not have the required role
      return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and has the required role
    return children;
  } catch (error) {
    // Invalid token
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
