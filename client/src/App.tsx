// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/DefaultPage';
import OnboardingPage from './pages/OnboardingApplicationPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import Logout from './components/Logout';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import SendInvitationPage from './pages/HiringManagementPage';
import RegisterPage from './pages/RegisterPage';
import ChangePassword from './pages/ChangePassword';
import ProfilePage from './pages/ProfilePage'
import PrivateRoute from './components/PrivateRoute';
import { Provider } from 'react-redux';
import store from './app/store';
import EmployeeProfilesPage from './pages/EmployeeProfilesPage';

function App() {
  return (
    <Provider store={store}>

    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Logout Route */}
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        {/* Routes accessible by both Employee and HR */}
        <Route
          path="/"
          element={
            <PrivateRoute roles={['Employee', 'HR']}>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute roles={['Employee', 'HR']}>
              <MainLayout>
                <ChangePassword />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute roles={['Employee', 'HR']}>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />  

        {/* Employee-Only Routes */}
        <Route
          path="/onboarding"
          element={
            <PrivateRoute roles={['Employee']}>
              <MainLayout>
                <OnboardingPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/personalInfo"
          element={
            <PrivateRoute roles={['Employee']}>
              <MainLayout>
                <PersonalInfoPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* HR-Only Routes */}
        <Route
          path="/hr/dashboard"
          element={
            <PrivateRoute roles={['HR']}>
              <MainLayout>
                {/* Replace with your HR-specific page/component */}
                <div>HR Dashboard</div>
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/send-invitation"
          element={
            <PrivateRoute roles={['HR']}>
              <MainLayout>
                <SendInvitationPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/employeeList"
          element={
            <PrivateRoute>
              <MainLayout>
                <EmployeeProfilesPage />
              </MainLayout>
            </PrivateRoute>
          }
        />


        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </Provider>

  );
}

export default App;
