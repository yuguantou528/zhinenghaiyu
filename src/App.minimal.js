import React, { useState } from 'react';

function MinimalApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1890ff' }}>
            海域智能安全系统
          </h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            请登录系统
          </p>
          <button 
            onClick={handleLogin}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            登录系统
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <h1 style={{ margin: 0, color: '#1890ff' }}>
            海域智能安全系统
          </h1>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              fontSize: '14px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            退出登录
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>系统状态</h3>
          <p>✅ 系统正常运行</p>
          <p>✅ 当前时间: {new Date().toLocaleString()}</p>
          <p>✅ 用户已登录</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>实时监控</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>船舶位置监控</p>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>CCTV监控</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>视频监控系统</p>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#fff2e8',
            border: '1px solid #ffbb96',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#fa8c16' }}>预警设置</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>智能预警配置</p>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#f9f0ff',
            border: '1px solid #d3adf7',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#722ed1' }}>工作台账</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>操作记录管理</p>
          </div>
        </div>

        <div style={{ 
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f0f2f5',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>系统信息</h4>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>版本: v1.0.0</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>部署状态: 正常</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>最后更新: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default MinimalApp;
