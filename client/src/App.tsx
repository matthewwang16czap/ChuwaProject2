// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/DefaultPage';
import OnboardingApplicationPage from './pages/OnboardingApplicationPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import Logout from './components/Logout';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import HiringManagementPage from './pages/HR/HiringManagementPage';
import RegisterPage from './pages/RegisterPage';
import ChangePassword from './pages/ChangePassword';
import ProfilePage from './pages/ProfilePage'
import PrivateRoute from './components/PrivateRoute';
import { Provider } from 'react-redux';
import store from './app/store';
import EmployeeProfilesPage from './pages/HR/EmployeeProfilesPage';
import EmployeeProfilePage from './pages/HR/EmployeeProfilePage';
import ReviewOnboardingApplication from './pages/HR/ReviewOnboardingApplication';
import DocumentViewer from './pages/DocumentViewer';

import { useParams } from 'react-router-dom';
import VISAStatusManagementPage from './pages/VISAStatusManagementPage';
import VISAStatusReviewPage from './pages/HR/VISAStatusReviewPage';

// UseParams directly inside the component you need
const EmployeeProfileWithParams = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  return <EmployeeProfilePage employeeId={employeeId || ''} />;
};

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
        <Route
          path="/hr/documents/:userId/:filename"
          element={
            <PrivateRoute roles={['Employee', 'HR']}>
              <MainLayout>
                <DocumentViewer />
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
                <OnboardingApplicationPage />
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
        <Route
          path="/visa"
          element={
            <PrivateRoute roles={['Employee']}>
              <MainLayout>
                <VISAStatusManagementPage />
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
                <ReviewOnboardingApplication/>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/send-invitation"
          element={
            <PrivateRoute roles={['HR']}>
              <MainLayout>
                <HiringManagementPage />
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
        <Route
          path="/employee-profile/:employeeId"
          element={
            <PrivateRoute>
              <MainLayout>
                <EmployeeProfileWithParams/>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/visaReview"
          element={
            <PrivateRoute roles={['HR']}>
              <MainLayout>
                <VISAStatusReviewPage/>
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
