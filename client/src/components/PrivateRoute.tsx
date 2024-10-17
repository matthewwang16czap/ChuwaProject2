import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { checkAuth } from '../features/user/userSlice'; 

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[]; // Array of roles allowed to access the route
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(checkAuth());
    }
    setAuthChecked(true);  // Mark auth check as completed
  }, [user, dispatch]);

  // Wait until authentication has been checked
  if (!authChecked) {
    return null; // or render a placeholder like a spinner
  }

  // If the user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;

  // If the user does not have the required role, redirect to unauthorized page
  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role
  return children;
};

export default PrivateRoute;
