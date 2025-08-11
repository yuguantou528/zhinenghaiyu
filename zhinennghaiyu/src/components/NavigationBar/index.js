import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  SettingFilled,
  PlayCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  DownOutlined,
  AlertOutlined,
  ExclamationCircleOutlined,
  RadarChartOutlined,
  EyeOutlined,
  SoundOutlined,
  LinkOutlined,
  BellOutlined,
  AimOutlined,
  FileTextOutlined,
  CameraOutlined,
  BorderOutlined,
  AudioOutlined,
  WarningOutlined,
  MedicineBoxOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const NavigationBar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const menuItemRefs = useRef({});

  // 菜单配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
      path: '/dashboard'
    },
    {
      key: 'cctv',
      icon: <VideoCameraOutlined />,
      label: 'CCTV 智能监控',
      children: [
        {
          key: 'cctv-monitor',
          icon: <DesktopOutlined />,
          label: '实时监控',
          path: '/cctv/monitor'
        },
        {
          key: 'cctv-records',
          icon: <PlayCircleOutlined />,
          label: '录像管理',
          path: '/cctv/records'
        }
      ]
    },
    {
      key: 'alert-settings',
      icon: <AlertOutlined />,
      label: '智能预警参数设置',
      children: [
        {
          key: 'collision-alert',
          icon: <ExclamationCircleOutlined />,
          label: '碰撞风险预警设置',
          path: '/alert/collision'
        },
        {
          key: 'deviation-alert',
          icon: <RadarChartOutlined />,
          label: '船舶偏航预警设置',
          path: '/alert/deviation'
        },
        {
          key: 'fence-alert',
          icon: <AimOutlined />,
          label: '进出围栏告警设置',
          path: '/alert/fence'
        },
        {
          key: 'special-target-alert',
          icon: <EyeOutlined />,
          label: '特殊目标预警配置',
          path: '/alert/special-target'
        },
        {
          key: 'vhf-broadcast',
          icon: <SoundOutlined />,
          label: 'VHF自动播发设置',
          path: '/alert/vhf-broadcast'
        },
        {
          key: 'cctv-linkage',
          icon: <LinkOutlined />,
          label: 'CCTV联动规则',
          path: '/alert/cctv-linkage'
        },
        {
          key: 'notification-settings',
          icon: <BellOutlined />,
          label: '告警通知设置',
          path: '/alert/notification'
        }
      ]
    },
    // 电子围栏管理功能暂时注释
    // {
    //   key: 'fence-management',
    //   icon: <BorderOutlined />,
    //   label: '电子围栏管理',
    //   children: [
    //     {
    //       key: 'fence-draw',
    //       icon: <AimOutlined />,
    //       label: '围栏绘制与配置',
    //       path: '/fence/draw'
    //     },
    //     {
    //       key: 'fence-list',
    //       icon: <BorderOutlined />,
    //       label: '围栏列表管理',
    //       path: '/fence/list'
    //     },
    //     {
    //       key: 'fence-monitor',
    //       icon: <EyeOutlined />,
    //       label: '围栏监控状态',
    //       path: '/fence/monitor'
    //     },
    //     {
    //       key: 'fence-history',
    //       icon: <FileTextOutlined />,
    //       label: '围栏事件历史',
    //       path: '/fence/history'
    //     }
    //   ]
    // },
    {
      key: 'work-ledger',
      icon: <FileTextOutlined />,
      label: '工作台账管理',
      children: [
        {
          key: 'cctv-linkage-ledger',
          icon: <CameraOutlined />,
          label: 'CCTV联动台账',
          path: '/ledger/cctv-linkage'
        },
        {
          key: 'fence-access-ledger',
          icon: <BorderOutlined />,
          label: '进出围栏台账',
          path: '/ledger/fence-access'
        },
        {
          key: 'vhf-broadcast-ledger',
          icon: <AudioOutlined />,
          label: 'VHF播报台账',
          path: '/ledger/vhf-broadcast'
        },
        {
          key: 'realtime-alert-ledger',
          icon: <WarningOutlined />,
          label: '实时预警台账',
          path: '/ledger/realtime-alert'
        }
      ]
    },
    {
      key: 'rescue-management',
      icon: <MedicineBoxOutlined />,
      label: '救援管理',
      children: [
        {
          key: 'rescue-resources',
          icon: <TeamOutlined />,
          label: '救援资源管理',
          path: '/rescue/resources'
        },
        {
          key: 'rescue-plans',
          icon: <FileSearchOutlined />,
          label: '救援方案管理',
          path: '/rescue/plans'
        }
      ]
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: 'user-list',
          icon: <UserOutlined />,
          label: '用户管理',
          path: '/system/users'
        },
        {
          key: 'role-management',
          icon: <TeamOutlined />,
          label: '角色管理',
          path: '/system/roles'
        },
        {
          key: 'permission-management',
          icon: <SafetyOutlined />,
          label: '权限管理',
          path: '/system/permissions'
        }
      ]
    }
  ];

  // 根据当前路径设置活跃菜单
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 查找匹配的菜单项
    const findActiveKey = (items) => {
      for (const item of items) {
        if (item.path === currentPath) {
          return item.key;
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.path === currentPath) {
              return child.key;
            }
          }
        }
      }
      return 'dashboard'; // 默认选中仪表板
    };

    const activeKey = findActiveKey(menuItems);
    setActiveKey(activeKey);

    // 如果是子菜单项，展开父菜单
    for (const item of menuItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.key === activeKey);
        if (hasActiveChild && !collapsed) {
          setExpandedKeys([item.key]);
        }
      }
    }
  }, [location.pathname, collapsed]);

  // 处理菜单点击
  const handleMenuClick = (item) => {
    if (item.path) {
      setActiveKey(item.key);
      navigate(item.path);
      
      // 点击一级菜单时关闭所有展开菜单
      const isTopLevelMenu = menuItems.some(menuItem => menuItem.key === item.key);
      if (isTopLevelMenu) {
        setExpandedKeys([]);
      }
    } else if (item.children) {
      // 手风琴模式：展开当前菜单，关闭其他菜单
      setExpandedKeys(expandedKeys.includes(item.key) ? [] : [item.key]);
    }
  };

  // 处理鼠标悬停（收缩状态下）
  const handleMouseEnter = (item, event) => {
    if (!collapsed || !item.children) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setSubmenuPosition({
      top: rect.top,
      left: rect.right + 4
    });
    setHoveredSubmenu(item);
  };

  const handleMouseLeave = () => {
    if (!collapsed) return;
    setHoveredSubmenu(null);
  };

  // 渲染Portal弹出菜单
  const renderPortalSubmenu = () => {
    if (!collapsed || !hoveredSubmenu) return null;

    return createPortal(
      <div 
        className={styles.portalSubmenu}
        style={{ 
          position: 'fixed', 
          top: submenuPosition.top, 
          left: submenuPosition.left,
          zIndex: 1002
        }}
        onMouseEnter={() => setHoveredSubmenu(hoveredSubmenu)}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.portalSubmenuContent}>
          <div className={styles.portalSubmenuTitle}>
            {hoveredSubmenu.icon}
            <span>{hoveredSubmenu.label}</span>
          </div>
          {hoveredSubmenu.children.map(child => (
            <div
              key={child.key}
              className={`${styles.portalSubmenuItem} ${activeKey === child.key ? styles.active : ''}`}
              onClick={() => handleMenuClick(child)}
            >
              {child.icon}
              <span>{child.label}</span>
            </div>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  // 渲染菜单项
  const renderMenuItem = (item) => {
    const isActive = activeKey === item.key;
    const isExpanded = expandedKeys.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.key} className={styles.menuItemWrapper}>
        <div
          ref={el => menuItemRefs.current[item.key] = el}
          className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
          onClick={() => handleMenuClick(item)}
          onMouseEnter={(e) => handleMouseEnter(item, e)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.menuItemContent}>
            <span className={styles.menuIcon}>{item.icon}</span>
            {!collapsed && (
              <>
                <span className={styles.menuLabel}>{item.label}</span>
                {hasChildren && (
                  <span className={styles.menuArrow}>
                    {isExpanded ? <DownOutlined /> : <RightOutlined />}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 子菜单 */}
        {hasChildren && !collapsed && isExpanded && (
          <div className={styles.submenu}>
            {item.children.map(child => (
              <div
                key={child.key}
                className={`${styles.submenuItem} ${activeKey === child.key ? styles.active : ''}`}
                onClick={() => handleMenuClick(child)}
              >
                <span className={styles.submenuIcon}>{child.icon}</span>
                <span className={styles.submenuLabel}>{child.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </div>
        
        {/* 收缩按钮 */}
        <div className={styles.collapseButton} onClick={onCollapse}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      {/* Portal弹出菜单 */}
      {renderPortalSubmenu()}
    </>
  );
};

export default NavigationBar;
