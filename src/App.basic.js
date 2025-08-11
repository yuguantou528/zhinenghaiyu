import React from 'react';

function BasicApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1890ff', textAlign: 'center' }}>
        海域智能安全系统
      </h1>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>系统状态</h2>
        <p>✅ React应用正常运行</p>
        <p>✅ 当前时间: {new Date().toLocaleString()}</p>
        <p>✅ 部署成功</p>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => alert('按钮点击正常！')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            测试按钮
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicApp;
