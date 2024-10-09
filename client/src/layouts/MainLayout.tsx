// src/layouts/MainLayout.tsx

import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/logout',
      label: <Link to="/logout">Logout</Link>,
    },
    {
      key: '/profile',
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: '/onboarding',
      label: <Link to="/onboarding">Onboarding</Link>,
    },
    {
      key: '/personalInfo',
      label: <Link to="/personalInfo">Personal Info</Link>,
    },
    // Add more menu items as needed
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header>
        <div className="logo" style={{ float: 'left', color: '#fff', fontSize: '20px' }}>
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
        <div style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 158px)' }}>
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
