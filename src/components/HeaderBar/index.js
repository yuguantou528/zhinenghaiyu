import React from 'react';
import { Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';

const HeaderBar = () => {
  const navigate = useNavigate();

  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    message.success('退出登录成功！');
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => {
        message.info('个人信息功能待开发');
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        {/* 左侧系统标题 */}
        <div className={styles.headerLeft}>
          <h1 className={styles.systemTitle}>管理系统原型</h1>
        </div>

        {/* 右侧用户信息 */}
        <div className={styles.headerRight}>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className={styles.userInfo}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                src={userInfo.avatar}
                className={styles.userAvatar}
              />
              <span className={styles.userName}>
                {userInfo.name || '管理员'}
              </span>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
