import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store'; // Import RootState and AppDispatch
import { login, checkAuth, logout } from './userSlice'; // Use `login` action from userSlice

const UserProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch for dispatch
  const { isAuthenticated, role, employeeId, applicationId, error } = useSelector((state: RootState) => state.user);

  // State for login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if the user is authenticated when the component loads
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogin = () => {
    // Dispatch login action with user input
    if (username && password) {
      dispatch(login({ username, password }));
    } else {
      alert('Please enter both username and password.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Welcome, {role === 'HR' ? 'HR User' : `Employee ${employeeId}`}</h2>
          <p>Application ID: {applicationId}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Please Log In</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
