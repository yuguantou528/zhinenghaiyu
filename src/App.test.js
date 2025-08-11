import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import DashboardOptimized from './pages/Dashboard/DashboardOptimized';

const { Title } = Typography;

const TestLogin = () => {
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Title level={3}>系统登录</Title>
        <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
          登录系统
        </button>
      </Card>
    </div>
  );
};

// 路由守卫组件
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// 登录重定向组件
const LoginRedirect = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
};

function TestApp() {
  return (
    <Routes>
      {/* 根路径重定向到仪表板 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 登录页面 */}
      <Route 
        path="/login" 
        element={
          <LoginRedirect>
            <TestLogin />
          </LoginRedirect>
        } 
      />
      
      {/* 仪表板页面 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardOptimized />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default TestApp;
