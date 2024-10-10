// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import Logout from './components/Logout';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Logout Route */}
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/personalInfo" element={<PersonalInfoPage />} />
                  {/* Add more routes as needed */}
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
