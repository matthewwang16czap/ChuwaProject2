import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { sendInvitation, register, resetStatus } from './registrationSlice';

const UserRegistration: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  // Get state from the registration slice
  const { invitationStatus, registrationStatus, error } = useSelector((state: RootState) => state.registration);

  // Local state for form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Handlers for sending an invitation and registering a user
  const handleSendInvitation = () => {
    if (email) {
      dispatch(sendInvitation({ email }));
    } else {
      alert('Please provide an email address.');
    }
  };

  const handleRegister = () => {
    if (email && username && password && token) {
      dispatch(register({ email, username, password, token }));
    } else {
      alert('Please fill in all fields.');
    }
  };

  const handleResetStatus = () => {
    dispatch(resetStatus());
  };

  return (
    <div>
      <h2>User Registration</h2>

      {/* Invitation Section */}
      <div>
        <h3>Send Invitation</h3>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSendInvitation}>Send Invitation</button>
        {invitationStatus === 'loading' && <p>Sending invitation...</p>}
        {invitationStatus === 'succeeded' && <p>Invitation sent successfully!</p>}
        {invitationStatus === 'failed' && error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Registration Section */}
      <div>
        <h3>Register User</h3>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
        {registrationStatus === 'loading' && <p>Registering user...</p>}
        {registrationStatus === 'succeeded' && <p>Registration successful!</p>}
        {registrationStatus === 'failed' && error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Reset Status */}
      <div>
        <button onClick={handleResetStatus}>Reset Status</button>
      </div>
    </div>
  );
};

export default UserRegistration;
