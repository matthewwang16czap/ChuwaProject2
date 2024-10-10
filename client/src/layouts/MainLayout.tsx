// src/layouts/MainLayout.tsx

import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface JwtPayload {
  user: {
    userId: string | null | undefined;
    role: string;
    email: string;
  };
  // Add other fields from your JWT payload as needed
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  let role = '';

  if (token) {
    try {
      // Decode the token to extract user role
      const decoded = jwtDecode<JwtPayload>(token);
      role = decoded.user.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      // Handle token decoding errors if necessary
    }
  }

  // Define menu items based on the user's role
  const menuItems = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/profile',
      label: <Link to="/profile">Profile</Link>,
    },
    ...(role === 'Employee'
      ? [
          {
            key: '/onboarding',
            label: <Link to="/onboarding">Onboarding</Link>,
          },
          {
            key: '/personalInfo',
            label: <Link to="/personalInfo">Personal Info</Link>,
          },
          // Add more Employee-specific menu items here
        ]
      : []),
    ...(role === 'HR'
      ? [
          {
            key: '/hr/dashboard',
            label: <Link to="/hr/dashboard">HR Dashboard</Link>,
          },
          {
            key: '/employeeList',
            label: <Link to="/employeeList">Employee List</Link>,
          },
          {
            key: '/onboarding',
            label: <Link to="/onboarding">Onboarding</Link>,
          },
          {
            key: '/personalInfo',
            label: <Link to="/personalInfo">Personal Info</Link>,
          }
          // Add more HR-specific menu items here
        ]
      : []),
    {
      key: '/logout',
      label: <Link to="/logout">Logout</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header>
        <div
          className="logo"
          style={{ float: 'left', color: '#fff', fontSize: '20px' }}
        >
          <Link to="/" style={{ color: '#fff' }}>
            Employee Portal
          </Link>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ lineHeight: '64px' }}
        />
      </Header>

      {/* Content */}
      <Content style={{ padding: '0 50px', marginTop: '64px' }}>
        <div
          style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 158px)' }}
        >
          {children}
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center' }}>
        Employee Management System ©{new Date().getFullYear()} Created by Your Team
      </Footer>
    </Layout>
  );
};

export default MainLayout;
