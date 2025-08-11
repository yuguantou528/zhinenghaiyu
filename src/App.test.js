import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title } = Typography;

// 简单的测试组件
const TestDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>海域智能安全系统</Title>
        <p>系统正常运行中...</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </Card>
    </div>
  );
};

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
            <TestDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default TestApp;
