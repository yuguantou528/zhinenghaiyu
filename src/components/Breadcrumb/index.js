import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './index.module.css';

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 路由映射配置
  const routeMap = {
    '/dashboard': { title: '仪表板', icon: <HomeOutlined /> },
    '/cctv': { title: 'CCTV 智能监控' },
    '/cctv/monitor': { title: '实时监控', parent: '/cctv' },
    '/cctv/tracking': { title: '自动跟踪配置', parent: '/cctv' },
    '/cctv/records': { title: '录像管理', parent: '/cctv' },
    '/alert': { title: '智能预警参数设置' },
    '/alert/collision': { title: '碰撞风险预警设置', parent: '/alert' },
    '/alert/deviation': { title: '船舶偏航预警设置', parent: '/alert' },
    '/alert/fence': { title: '进出围栏告警设置', parent: '/alert' },
    '/alert/special-target': { title: '特殊目标预警配置', parent: '/alert' },
    '/alert/vhf-broadcast': { title: 'VHF自动播发设置', parent: '/alert' },
    '/alert/cctv-linkage': { title: 'CCTV联动规则', parent: '/alert' },
    '/alert/notification': { title: '告警通知设置', parent: '/alert' },
    '/fence': { title: '电子围栏管理' },
    '/fence/draw': { title: '围栏绘制与配置', parent: '/fence' },
    '/fence/list': { title: '围栏列表管理', parent: '/fence' },
    '/fence/monitor': { title: '围栏监控状态', parent: '/fence' },
    '/fence/history': { title: '围栏事件历史', parent: '/fence' },
    '/ledger': { title: '工作台账管理' },
    '/ledger/cctv-linkage': { title: 'CCTV联动台账', parent: '/ledger' },
    '/ledger/fence-access': { title: '进出围栏台账', parent: '/ledger' },
    '/ledger/vhf-broadcast': { title: 'VHF播报台账', parent: '/ledger' },
    '/ledger/realtime-alert': { title: '实时预警台账', parent: '/ledger' },
    '/rescue': { title: '救援管理' },
    '/rescue/resources': { title: '救援资源管理', parent: '/rescue' },
    '/rescue/plans': { title: '救援方案管理', parent: '/rescue' },
    '/system': { title: '系统管理' },
    '/system/users': { title: '用户管理', parent: '/system' },
    '/system/roles': { title: '角色管理', parent: '/system' },
    '/system/permissions': { title: '权限管理', parent: '/system' }
  };

  // 生成面包屑路径
  const generateBreadcrumbItems = () => {
    const currentPath = location.pathname;
    const items = [];

    // 如果是首页，只显示首页
    if (currentPath === '/dashboard') {
      return [
        {
          title: (
            <span className={styles.breadcrumbItem}>
              <HomeOutlined />
              <span>仪表板</span>
            </span>
          )
        }
      ];
    }

    // 添加首页链接
    items.push({
      title: (
        <span 
          className={`${styles.breadcrumbItem} ${styles.clickable}`}
          onClick={() => navigate('/dashboard')}
        >
          <HomeOutlined />
          <span>首页</span>
        </span>
      )
    });

    // 获取当前路由信息
    const currentRoute = routeMap[currentPath];
    if (!currentRoute) return items;

    // 如果有父级路由，先添加父级
    if (currentRoute.parent) {
      const parentRoute = routeMap[currentRoute.parent];
      if (parentRoute) {
        items.push({
          title: (
            <span className={styles.breadcrumbItem}>
              {parentRoute.title}
            </span>
          )
        });
      }
    }

    // 添加当前页面
    items.push({
      title: (
        <span className={styles.breadcrumbItem}>
          {currentRoute.icon}
          <span>{currentRoute.title}</span>
        </span>
      )
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <div className={styles.breadcrumbContainer}>
      <AntBreadcrumb
        items={breadcrumbItems}
        separator=">"
        className={styles.breadcrumb}
      />
    </div>
  );
};

export default Breadcrumb;
