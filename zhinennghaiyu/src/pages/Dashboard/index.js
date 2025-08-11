import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card, Row, Col, Table, Button, Space, Tag, message,
  Select, Input, Form, Switch, Slider, DatePicker,
  Radio, Checkbox, Divider, Progress, Badge, Tooltip,
  Modal, Upload, Spin, InputNumber, Alert, Typography,
  Dropdown, Tabs, Descriptions
} from 'antd';
const { TextArea, Search } = Input;
const { Option } = Select;
const { Text } = Typography;
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  ControlOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CameraOutlined,
  DownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
  SaveOutlined,
  UpOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  PlaySquareOutlined,
  SettingOutlined,
  UploadOutlined,
  SoundOutlined,
  BellOutlined,
  MessageOutlined,
  MailOutlined,
  RadarChartOutlined,
  MoreOutlined,
  AlertOutlined,
  BorderOutlined,
  AimOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  SortAscendingOutlined,
  WarningOutlined,
  CompassOutlined,
  PhoneOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  BarChartOutlined,
  MonitorOutlined,
  ToolOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  DownOutlined
} from '@ant-design/icons';
import HeaderBar from '../../components/HeaderBar';
import NavigationBar from '../../components/NavigationBar';
import Breadcrumb from '../../components/Breadcrumb';
import styles from './index.module.css';
import moment from 'moment';

const Dashboard = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // CCTV 相关状态
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDevices, setRecordingDevices] = useState(new Set());
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [deviceStatusFilter, setDeviceStatusFilter] = useState('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const [multiViewMode, setMultiViewMode] = useState(false);
  const [selectedMultiDevices, setSelectedMultiDevices] = useState([]);
  const [quickActionLoading, setQuickActionLoading] = useState(false);
  const [trackingConfig, setTrackingConfig] = useState({
    targetTypes: ['commercial', 'fishing', 'military'],
    priorityRules: {
      military: 1,
      militaryOther: 2,
      commercial: 3,
      fishing: 4
    },
    autoTracking: true,
    trackingRadius: 1000,
    trackingDuration: 300,
    confidenceThreshold: 0.8
  });

  // 优先级规则列表状态
  const [priorityList, setPriorityList] = useState([
    { id: 'military', title: '军舰', desc: '最高优先级，立即跟踪', status: 'error' },
    { id: 'militaryOther', title: '其他军用船舶', desc: '高优先级', status: 'warning' },
    { id: 'commercial', title: '商船', desc: '中等优先级', status: 'processing' },
    { id: 'fishing', title: '渔船', desc: '普通优先级', status: 'default' }
  ]);
  const [recordsFilter, setRecordsFilter] = useState({
    timeRange: null,
    deviceId: null,
    targetType: null,
    recordType: 'all'
  });

  // 表单实例 - 在组件顶层声明
  const [trackingForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 录像管理相关状态
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [playbackVisible, setPlaybackVisible] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // 智能预警参数设置相关状态
  const [collisionAlertConfig, setCollisionAlertConfig] = useState({
    cpaThreshold: 0.5,
    tcpaThreshold: 10,
    cpaLevel: 'high',
    tcpaLevel: 'high',
    cpaEnabled: true,
    tcpaEnabled: true,
    alertSound: true,
    autoRecord: false
  });

  const [deviationAlertConfig, setDeviationAlertConfig] = useState({
    distanceThreshold: 1.0,
    timeThreshold: 5,
    enabled: true,
    highlightTrack: true,
    autoAlert: true,
    routes: []
  });

  const [fenceAlertConfig, setFenceAlertConfig] = useState({
    fences: [],
    defaultType: 'forbidden',
    alertDelay: 0,
    enabled: true
  });

  const [specialTargets, setSpecialTargets] = useState([
    { 
      id: '1',
      mmsi: '123456789', 
      type: 'military', 
      remark: '重点监测区域',
      createTime: '2024-01-15 10:30:00',
      status: 'enabled',
      operator: 'admin'
    },
    { 
      id: '2',
      mmsi: '987654321', 
      type: 'dangerous', 
      remark: '高危化学品运输船',
      createTime: '2024-01-10 14:20:00',
      status: 'enabled',
      operator: 'admin'
    }
  ]);

  const [vhfBroadcastConfig, setVhfBroadcastConfig] = useState({
    alertTemplate: '船舶 {船名}，您已进入碰撞风险区域，请减速避让',
    portTemplate: '欢迎进入 XX 港，当前通航密度高，请保持 VHF16 频道守听',
    collisionTrigger: true,
    deviationLevel: 'level2',
    portBroadcast: true,
    autoRepeat: false,
    repeatInterval: 30,
    // 各类告警的配置
    collision: {
      enabled: true,
      template: '船舶 {船名}，您已进入碰撞风险区域，请减速避让',
      triggerCondition: 'immediate',
      repeatEnabled: false,
      repeatInterval: 30
    },
    deviation: {
      enabled: true,
      template: '船舶 {船名}，您已偏离预定航线，请及时调整航向',
      triggerCondition: 'level2',
      repeatEnabled: false,
      repeatInterval: 60
    },
    fence: {
      enabled: true,
      template: '船舶 {船名}，您已进入管制区域，请立即离开',
      triggerCondition: 'immediate',
      repeatEnabled: true,
      repeatInterval: 30
    },
    port: {
      enabled: true,
      template: '欢迎进入 XX 港，当前通航密度高，请保持 VHF16 频道守听',
      triggerCondition: 'immediate',
      repeatEnabled: false,
      repeatInterval: 0
    },
    specialTarget: {
      enabled: true,
      template: '发现特殊监控目标，请保持警戒',
      triggerCondition: 'immediate',
      repeatEnabled: true,
      repeatInterval: 120
    }
  });

  const [cctvLinkageConfig, setCctvLinkageConfig] = useState({
    collision: ['track', 'capture'],
    deviation: ['track'],
    fence: ['track', 'capture', 'record'],
    specialTarget: ['track', 'capture', 'record']
  });

  const [notificationConfig, setNotificationConfig] = useState({
    popup: true,
    sound: true,
    sms: false,
    email: false,
    highLevel: ['popup', 'sound', 'sms'],
    mediumLevel: ['popup', 'sound'],
    lowLevel: ['popup']
  });

  // 表单实例
  const [collisionForm] = Form.useForm();
  const [deviationForm] = Form.useForm();
  const [fenceForm] = Form.useForm();
  const [specialTargetForm] = Form.useForm();
  const [vhfForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [createForm] = Form.useForm();

  // 工作台账管理相关状态
  const [cctvLinkageLedger, setCctvLinkageLedger] = useState([]);
  const [fenceAccessLedger, setFenceAccessLedger] = useState([]);
  const [vhfBroadcastLedger, setVhfBroadcastLedger] = useState([]);
  const [realtimeAlertLedger, setRealtimeAlertLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerSearchText, setLedgerSearchText] = useState('');
  const [selectedLedgerRecord, setSelectedLedgerRecord] = useState(null);
  const [ledgerDetailVisible, setLedgerDetailVisible] = useState(false);
  
  // VHF播报台账扩展状态
  const [vhfDetailModal, setVhfDetailModal] = useState({ visible: false, record: null });
  const [audioPlayer, setAudioPlayer] = useState({ visible: false, src: '', title: '', isPlaying: false });

  // 船舶偏航预警相关状态
  const [shipTypeFilter, setShipTypeFilter] = useState('all');
  const [shipSearchText, setShipSearchText] = useState('');
  const [routeSearchText, setRouteSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('ships');

  // 告警通知配置状态
  const [alertConfig, setAlertConfig] = useState({
    collisionRisk: {
      name: '碰撞风险预警',
      description: '船舶间距离过近或可能发生碰撞时的预警',
      notifications: {
        popup: true,
        sound: true,
        sms: false,
        email: false,
        vhf: true,
        other: false
      }
    },
    shipDeviation: {
      name: '船舶偏航预警',
      description: '船舶偏离预设航线时的预警',
      notifications: {
        popup: true,
        sound: true,
        sms: false,
        email: false,
        vhf: true,
        other: false
      }
    },
    fenceIntrusion: {
      name: '围栏闯入告警',
      description: '船舶进入禁航区或离开通航区时的告警',
      notifications: {
        popup: true,
        sound: true,
        sms: true,
        email: false,
        vhf: true,
        other: false
      }
    },
    targetTrigger: {
      name: '预警库目标触发',
      description: '预警库中的重点监控目标出现时的告警',
      notifications: {
        popup: true,
        sound: true,
        sms: true,
        email: true,
        vhf: false,
        other: true
      }
    },
    deviceOffline: {
      name: '设备离线告警',
      description: 'AIS、雷达、CCTV等设备离线时的告警',
      notifications: {
        popup: true,
        sound: false,
        sms: true,
        email: true,
        vhf: false,
        other: false
      }
    },
    abnormalBehavior: {
      name: '异常行为告警',
      description: '船舶出现异常航行行为时的告警',
      notifications: {
        popup: true,
        sound: true,
        sms: false,
        email: false,
        vhf: true,
        other: false
      }
    }
  });

  // 围栏管理相关状态
  const [drawingMode, setDrawingMode] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(true);

  // VHF播发相关状态
  const [expandedAlerts, setExpandedAlerts] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);

  // 特殊目标相关状态
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);

  // 进出围栏台账相关状态
  const [fenceTimeRange, setFenceTimeRange] = useState(null);
  const [chartTimeDimension, setChartTimeDimension] = useState('day'); // day, week, month
  const [fenceChartTimeDimension, setFenceChartTimeDimension] = useState('day'); // 围栏统计时间维度

  // 操作日志相关状态
  const [operationLogs, setOperationLogs] = useState([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      operator: '张三',
      action: '保存配置',
      details: 'CPA阈值: 0.8 → 0.5海里; TCPA阈值: 15 → 10分钟',
      result: '成功',
      ip: '192.168.1.101'
    },
    {
      id: '2',
      timestamp: '2024-01-15 13:45:12',
      operator: '李四',
      action: '重置配置',
      details: '重置为默认值: CPA阈值: 1.0 → 0.5海里; TCPA阈值: 20 → 10分钟; CPA预警: 关闭 → 开启; TCPA预警: 关闭 → 开启',
      result: '成功',
      ip: '192.168.1.102'
    },
    {
      id: '3',
      timestamp: '2024-01-15 11:20:08',
      operator: '王五',
      action: '保存配置',
      details: 'TCPA预警: 开启 → 关闭',
      result: '成功',
      ip: '192.168.1.103'
    }
  ]);

  // CCTV台账媒体文件相关状态
  const [imagePreview, setImagePreview] = useState({ visible: false, src: '', title: '' });
  const [videoPlayer, setVideoPlayer] = useState({ visible: false, src: '', title: '' });

  // 进出围栏台账详情相关状态
  const [fenceDetailModal, setFenceDetailModal] = useState({ visible: false, record: null });

  // 共享数据状态 - 用于同步进出围栏台账和实时预警台账
  const [sharedFenceData, setSharedFenceData] = useState(new Map());

  // 实时预警台账处理相关状态
  const [alertProcessModal, setAlertProcessModal] = useState({ visible: false, record: null });
  const [alertProcessForm] = Form.useForm();

  // 紧急联系相关状态
  const [emergencyContactModal, setEmergencyContactModal] = useState({ visible: false, record: null });
  const [emergencyContactForm] = Form.useForm();
  const [contactLoading, setContactLoading] = useState(false);

  // 航线指导相关状态
  const [routeGuidanceModal, setRouteGuidanceModal] = useState({ visible: false, record: null });
  const [routeGuidanceForm] = Form.useForm();
  const [guidanceLoading, setGuidanceLoading] = useState(false);

  // 持续监控相关状态
  const [continuousMonitorModal, setContinuousMonitorModal] = useState({ visible: false, record: null });
  const [monitoringForm] = Form.useForm();
  const [monitorLoading, setMonitorLoading] = useState(false);



  // 模拟船舶数据
  const shipList = [
    {
      id: '1',
      mmsi: '412345678',
      name: '海运之星',
      type: 'commercial',
      status: 'sailing',
      routeId: 'route1',
      currentPosition: { lat: 31.2304, lng: 121.4737 },
      speed: 12.5,
      course: 85,
      destination: '宁波港',
      eta: '2024-01-20 14:30'
    },
    {
      id: '2',
      mmsi: '412345679',
      name: '渔业丰收',
      type: 'fishing',
      status: 'anchored',
      routeId: 'route2',
      currentPosition: { lat: 31.1304, lng: 121.3737 },
      speed: 0,
      course: 0,
      destination: '东海渔场',
      eta: '2024-01-20 16:00'
    },
    {
      id: '3',
      mmsi: '412345680',
      name: '海防巡逻艇',
      type: 'military',
      status: 'patrolling',
      routeId: 'route3',
      currentPosition: { lat: 31.0304, lng: 121.2737 },
      speed: 18.2,
      course: 120,
      destination: '巡逻区域',
      eta: '2024-01-20 18:45'
    }
  ];

  // 模拟航线数据
  const routeList = [
    {
      id: 'route1',
      name: '上海-宁波货运航线',
      type: 'commercial',
      startPoint: '上海港',
      endPoint: '宁波港',
      distance: '156.8',
      shipCount: 1,
      points: [
        { lat: 31.2304, lng: 121.4737, name: '上海港' },
        { lat: 30.8703, lng: 121.5370, name: '中转点1' },
        { lat: 29.8683, lng: 121.5440, name: '宁波港' }
      ],
      status: 'active',
      createTime: '2024-01-10'
    },
    {
      id: 'route2',
      name: '近海渔场航线',
      type: 'fishing',
      startPoint: '渔港码头',
      endPoint: '东海渔场',
      distance: '89.2',
      shipCount: 1,
      points: [
        { lat: 31.1304, lng: 121.3737, name: '渔港码头' },
        { lat: 31.2304, lng: 121.6737, name: '东海渔场' }
      ],
      status: 'active',
      createTime: '2024-01-12'
    },
    {
      id: 'route3',
      name: '巡逻航线A',
      type: 'military',
      startPoint: '军港基地',
      endPoint: '巡逻区域',
      distance: '234.5',
      shipCount: 1,
      points: [
        { lat: 31.0304, lng: 121.2737, name: '军港基地' },
        { lat: 31.5304, lng: 121.8737, name: '巡逻点1' },
        { lat: 31.8304, lng: 122.1737, name: '巡逻区域' }
      ],
      status: 'active',
      createTime: '2024-01-08'
    }
  ];

  // 根据路由显示不同内容
  const renderContent = () => {
    const currentPath = location.pathname;

    switch (currentPath) {
      case '/dashboard':
        return renderDashboardContent();
      case '/cctv/monitor':
        return renderCCTVMonitor();
      case '/cctv/records':
        return renderCCTVRecords();
      case '/alert/collision':
        return renderCollisionAlert();
      case '/alert/deviation':
        return renderDeviationAlert();
      case '/alert/fence':
        return renderFenceAlert();
      case '/alert/special-target':
        return renderSpecialTargetAlert();
      case '/alert/vhf-broadcast':
        return renderVHFBroadcast();
      case '/alert/cctv-linkage':
        return renderCCTVLinkage();
      case '/alert/notification':
        return renderNotificationSettings();
      // 电子围栏管理功能暂时注释
      // case '/fence/draw':
      //   return renderFenceDraw();
      // case '/fence/list':
      //   return renderFenceList();
      // case '/fence/monitor':
      //   return renderFenceMonitor();
      // case '/fence/history':
      //   return renderFenceHistory();
      case '/ledger/cctv-linkage':
        return renderCCTVLinkageLedger();
      case '/ledger/fence-access':
        return renderFenceAccessLedger();
      case '/ledger/vhf-broadcast':
        return renderVHFBroadcastLedger();
      case '/ledger/realtime-alert':
        return renderRealtimeAlertLedger();
      case '/rescue/resources':
        return renderRescueResources();
      case '/rescue/plans':
        return renderRescuePlans();
      case '/system/users':
        return renderUserManagement();
      case '/system/roles':
        return renderRoleManagement();
      case '/system/permissions':
        return renderPermissionManagement();
      default:
        return renderDashboardContent();
    }
  };

  // 仪表板内容
  const renderDashboardContent = () => {
    const statsData = [
      { title: '总用户数', value: '1,234', icon: <UserOutlined />, color: '#1890ff' },
      { title: '活跃用户', value: '856', icon: <UserOutlined />, color: '#52c41a' },
      { title: '角色数量', value: '12', icon: <TeamOutlined />, color: '#fa8c16' },
      { title: '权限数量', value: '48', icon: <SafetyOutlined />, color: '#eb2f96' }
    ];

    return (
      <div className={styles.dashboardContent}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className={styles.statsRow}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statTitle}>{stat.title}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 图表区域占位 */}
        <Row gutter={[16, 16]} className={styles.chartsRow}>
          <Col xs={24} lg={12}>
            <Card title="用户增长趋势" className={styles.chartCard}>
              <div className={styles.chartPlaceholder}>
                <p>图表区域占位</p>
                <p>可集成 ECharts 图表组件</p>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="系统访问统计" className={styles.chartCard}>
              <div className={styles.chartPlaceholder}>
                <p>图表区域占位</p>
                <p>可集成 ECharts 图表组件</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // CCTV 实时监控内容 - 重构版本
  const renderCCTVMonitor = () => {
    // 扩展的设备数据
    const deviceList = [
      {
        id: 'CAM001',
        name: '港口入口监控',
        location: '东港区入口',
        status: 'online',
        region: 'east',
        type: 'fixed',
        resolution: '4K',
        angle: '120°',
        nightVision: true,
        lastUpdate: '2024-01-20 14:30:25'
      },
      {
        id: 'CAM002',
        name: '码头作业区监控',
        location: '中央码头A区',
        status: 'online',
        region: 'center',
        type: 'ptz',
        resolution: '1080P',
        angle: '360°',
        nightVision: true,
        lastUpdate: '2024-01-20 14:30:20'
      },
      {
        id: 'CAM003',
        name: '船舶停泊区监控',
        location: '西港区停泊点',
        status: 'offline',
        region: 'west',
        type: 'fixed',
        resolution: '1080P',
        angle: '90°',
        nightVision: false,
        lastUpdate: '2024-01-20 14:25:10'
      },
      {
        id: 'CAM004',
        name: '航道监控点A',
        location: '主航道北段',
        status: 'online',
        region: 'channel',
        type: 'ptz',
        resolution: '4K',
        angle: '360°',
        nightVision: true,
        lastUpdate: '2024-01-20 14:30:22'
      },
      {
        id: 'CAM005',
        name: '航道监控点B',
        location: '副航道南段',
        status: 'maintenance',
        region: 'channel',
        type: 'fixed',
        resolution: '1080P',
        angle: '180°',
        nightVision: true,
        lastUpdate: '2024-01-20 14:20:15'
      },
      {
        id: 'CAM006',
        name: '安全检查区监控',
        location: '东港区检查站',
        status: 'online',
        region: 'east',
        type: 'ptz',
        resolution: '4K',
        angle: '360°',
        nightVision: true,
        lastUpdate: '2024-01-20 14:30:18'
      }
    ];

    // 多维度筛选逻辑
    const filteredDevices = deviceList.filter(device => {
      const regionMatch = deviceFilter === 'all' || device.region === deviceFilter;
      const statusMatch = !deviceStatusFilter || deviceStatusFilter === 'all' || device.status === deviceStatusFilter;
      const typeMatch = !deviceTypeFilter || deviceTypeFilter === 'all' || device.type === deviceTypeFilter;
      return regionMatch && statusMatch && typeMatch;
    });

    // 增强的云台控制功能
    const handlePTZControl = (direction, speed = 'normal') => {
      if (!selectedDevice) {
        message.warning('请先选择监控设备');
        return;
      }
      if (selectedDevice.status !== 'online') {
        message.warning('设备离线，无法执行云台控制');
        return;
      }
      message.success(`云台${direction}操作执行成功（速度：${speed}）`);
    };

    // 增强的截图功能
    const handleScreenshot = async (deviceId = null) => {
      const targetDevice = deviceId ? deviceList.find(d => d.id === deviceId) : selectedDevice;
      if (!targetDevice) {
        message.warning('请先选择监控设备');
        return;
      }
      if (targetDevice.status !== 'online') {
        message.warning('设备离线，无法截图');
        return;
      }

      setQuickActionLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const timestamp = new Date().toLocaleString();
        message.success(`截图成功！设备：${targetDevice.name}，时间：${timestamp}`);
      } finally {
        setQuickActionLoading(false);
      }
    };

    // 增强的录像功能
    const handleRecording = async (deviceId = null) => {
      const targetDevice = deviceId ? deviceList.find(d => d.id === deviceId) : selectedDevice;
      if (!targetDevice) {
        message.warning('请先选择监控设备');
        return;
      }
      if (targetDevice.status !== 'online') {
        message.warning('设备离线，无法录像');
        return;
      }

      setQuickActionLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newRecordingDevices = new Set(recordingDevices);
        if (recordingDevices.has(targetDevice.id)) {
          newRecordingDevices.delete(targetDevice.id);
          message.success(`设备 ${targetDevice.name} 停止录像`);
        } else {
          newRecordingDevices.add(targetDevice.id);
          message.success(`设备 ${targetDevice.name} 开始录像`);
        }
        setRecordingDevices(newRecordingDevices);
      } finally {
        setQuickActionLoading(false);
      }
    };

    // 批量操作功能
    const handleBatchScreenshot = async () => {
      const onlineDevices = deviceList.filter(d => d.status === 'online');
      if (onlineDevices.length === 0) {
        message.warning('没有在线设备可以截图');
        return;
      }

      setQuickActionLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        message.success(`批量截图成功！共处理 ${onlineDevices.length} 个设备`);
      } finally {
        setQuickActionLoading(false);
      }
    };

    const handleBatchRecording = async (action) => {
      const onlineDevices = deviceList.filter(d => d.status === 'online');
      if (onlineDevices.length === 0) {
        message.warning('没有在线设备可以录像');
        return;
      }

      setQuickActionLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newRecordingDevices = new Set();
        if (action === 'start') {
          onlineDevices.forEach(device => newRecordingDevices.add(device.id));
          message.success(`批量开始录像！共处理 ${onlineDevices.length} 个设备`);
        } else {
          message.success(`批量停止录像！共处理 ${recordingDevices.size} 个设备`);
        }
        setRecordingDevices(newRecordingDevices);
      } finally {
        setQuickActionLoading(false);
      }
    };

    // 多画面模式切换
    const handleMultiViewToggle = () => {
      setMultiViewMode(!multiViewMode);
      if (!multiViewMode) {
        // 进入多画面模式，选择前4个在线设备
        const onlineDevices = deviceList.filter(d => d.status === 'online').slice(0, 4);
        setSelectedMultiDevices(onlineDevices);
      } else {
        setSelectedMultiDevices([]);
      }
    };

    const isCurrentDeviceRecording = selectedDevice && recordingDevices.has(selectedDevice.id);

    return (
      <div className={styles.tableContent}>
        {/* 增强的头部控制区域 */}
        <div className={styles.tableHeader}>
          <div>
            <h3>🎥 CCTV 实时监控</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              在线设备: {deviceList.filter(d => d.status === 'online').length} / {deviceList.length} |
              录像中: {recordingDevices.size}
            </p>
          </div>
          <Space wrap>
            {/* 多维度筛选器 */}
            <Select
              value={deviceFilter}
              onChange={setDeviceFilter}
              style={{ width: 140 }}
              placeholder="选择区域"
              suffixIcon={<EnvironmentOutlined />}
            >
              <Option value="all">🌐 全部区域</Option>
              <Option value="east">🏢 东港区</Option>
              <Option value="center">🏗️ 中央码头</Option>
              <Option value="west">🏭 西港区</Option>
              <Option value="channel">🛤️ 航道</Option>
            </Select>

            <Select
              value={deviceStatusFilter}
              onChange={setDeviceStatusFilter}
              style={{ width: 140 }}
              placeholder="设备状态"
              suffixIcon={<CheckCircleOutlined />}
            >
              <Option value="all">📊 全部状态</Option>
              <Option value="online">🟢 在线</Option>
              <Option value="offline">🔴 离线</Option>
              <Option value="maintenance">🟡 维护中</Option>
            </Select>

            <Select
              value={deviceTypeFilter}
              onChange={setDeviceTypeFilter}
              style={{ width: 140 }}
              placeholder="设备类型"
              suffixIcon={<VideoCameraOutlined />}
            >
              <Option value="all">📹 全部类型</Option>
              <Option value="fixed">📷 固定摄像头</Option>
              <Option value="ptz">🎯 云台摄像头</Option>
            </Select>

            {/* 视图模式切换 */}
            <Button.Group>
              <Button
                type={!multiViewMode ? "primary" : "default"}
                icon={<DesktopOutlined />}
                onClick={() => !multiViewMode || handleMultiViewToggle()}
              >
                单画面
              </Button>
              <Button
                type={multiViewMode ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={handleMultiViewToggle}
              >
                多画面
              </Button>
            </Button.Group>

            {/* 快捷操作 */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'batch-screenshot',
                    label: '批量截图',
                    icon: <CameraOutlined />,
                    onClick: handleBatchScreenshot
                  },
                  {
                    key: 'batch-start-record',
                    label: '批量开始录像',
                    icon: <PlayCircleOutlined />,
                    onClick: () => handleBatchRecording('start')
                  },
                  {
                    key: 'batch-stop-record',
                    label: '批量停止录像',
                    icon: <StopOutlined />,
                    onClick: () => handleBatchRecording('stop')
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Button type="primary" icon={<ThunderboltOutlined />} loading={quickActionLoading}>
                快捷操作
              </Button>
            </Dropdown>

            <Button icon={<PlusOutlined />}>添加监控点</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 140px)', minHeight: '900px' }}>
          {/* 监控画面区域 */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <VideoCameraOutlined />
                  {multiViewMode ?
                    `多画面监控 (${selectedMultiDevices.length}/4)` :
                    (selectedDevice ? `${selectedDevice.name} - 实时画面` : '请选择监控设备')
                  }
                </Space>
              }
              extra={
                <Space>
                  {selectedDevice && !multiViewMode && (
                    <>
                      <Badge
                        status={selectedDevice.status === 'online' ? 'success' :
                               selectedDevice.status === 'offline' ? 'error' : 'warning'}
                        text={selectedDevice.status === 'online' ? '在线' :
                             selectedDevice.status === 'offline' ? '离线' : '维护中'}
                      />
                      <Tag color={selectedDevice.type === 'ptz' ? 'blue' : 'green'}>
                        {selectedDevice.type === 'ptz' ? '云台' : '固定'}
                      </Tag>
                      <Tag color="purple">{selectedDevice.resolution}</Tag>
                    </>
                  )}
                  {multiViewMode && (
                    <Tag color="orange">多画面模式</Tag>
                  )}
                </Space>
              }
              className={styles.chartCard}
              bodyStyle={{
                padding: '12px',
                height: 'calc(100vh - 120px)', /* 适当减少高度，保持合适的空间利用率 */
                minHeight: '900px', /* 调整最小高度，避免过高 */
                maxHeight: '1200px', /* 调整最大高度，保持合理范围 */
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className={styles.monitorDisplay}>
                {multiViewMode ? (
                  // 多画面显示
                  <div className={styles.multiViewContainer}>
                    <Row gutter={[8, 8]} style={{ height: '100%' }}>
                      {[0, 1, 2, 3].map(index => {
                        const device = selectedMultiDevices[index];
                        return (
                          <Col span={12} key={index} style={{ height: '50%' }}>
                            <div className={styles.multiViewItem}>
                              {device ? (
                                <div className={styles.videoContainer}>
                                  <div className={styles.videoPlaceholder} style={{ height: '100%' }}>
                                    <VideoCameraOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                                    <p style={{ margin: '8px 0 4px', fontSize: '14px' }}>{device.name}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{device.location}</p>
                                    {recordingDevices.has(device.id) && (
                                      <Badge status="processing" text="录像中" style={{ fontSize: '12px' }} />
                                    )}
                                    <div className={styles.multiViewActions}>
                                      <Button
                                        size="small"
                                        icon={<CameraOutlined />}
                                        onClick={() => handleScreenshot(device.id)}
                                        disabled={device.status !== 'online'}
                                      />
                                      <Button
                                        size="small"
                                        type={recordingDevices.has(device.id) ? "danger" : "default"}
                                        icon={recordingDevices.has(device.id) ? <StopOutlined /> : <PlayCircleOutlined />}
                                        onClick={() => handleRecording(device.id)}
                                        disabled={device.status !== 'online'}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className={styles.emptyViewSlot}>
                                  <PlusOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
                                  <p>空闲画面</p>
                                </div>
                              )}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                ) : (
                  // 单画面显示
                  selectedDevice ? (
                    <div className={styles.videoContainer}>
                      <div className={styles.videoPlaceholder}>
                        <VideoCameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                        <div style={{ marginTop: '16px' }}>
                          <h4 style={{ margin: '0 0 8px', color: '#1890ff' }}>{selectedDevice.name}</h4>
                          <p style={{ margin: '0 0 4px', color: '#666' }}>📍 {selectedDevice.location}</p>
                          <p style={{ margin: '0 0 4px', color: '#666' }}>📐 视角: {selectedDevice.angle}</p>
                          <p style={{ margin: '0 0 8px', color: '#666' }}>🕐 更新: {selectedDevice.lastUpdate}</p>
                          <Space>
                            {selectedDevice.nightVision && <Tag color="purple">夜视</Tag>}
                            <Tag color="blue">{selectedDevice.resolution}</Tag>
                            {isCurrentDeviceRecording && (
                              <Badge status="processing" text="录像中..." />
                            )}
                          </Space>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.chartPlaceholder}>
                      <DesktopOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                      <p>请从右侧设备列表选择监控设备</p>
                      <p style={{ color: '#999', fontSize: '14px' }}>或切换到多画面模式查看多个设备</p>
                    </div>
                  )
                )}
              </div>

              {/* 增强的云台控制面板 */}
              {selectedDevice && !multiViewMode && (
                <div className={styles.ptzControls}>
                  <Divider style={{ margin: '8px 0' }}>
                    <Space>
                      🎮 云台控制
                      {selectedDevice.type !== 'ptz' && (
                        <Tag color="orange" size="small">固定摄像头</Tag>
                      )}
                    </Space>
                  </Divider>

                  {selectedDevice.type === 'ptz' ? (
                    <Row gutter={[8, 8]}>
                      <Col span={14}>
                        <div className={styles.directionControls}>
                          <div className={styles.controlRow}>
                            <Button
                              size="small"
                              icon={<UpOutlined />}
                              onClick={() => handlePTZControl('上')}
                              disabled={selectedDevice.status !== 'online'}
                              style={{ borderRadius: '6px 6px 0 0' }}
                            />
                          </div>
                          <div className={styles.controlRow}>
                            <Button
                              size="small"
                              icon={<LeftOutlined />}
                              onClick={() => handlePTZControl('左')}
                              disabled={selectedDevice.status !== 'online'}
                              style={{ borderRadius: '0' }}
                            />
                            <Button
                              size="small"
                              icon={<ControlOutlined />}
                              onClick={() => handlePTZControl('复位')}
                              disabled={selectedDevice.status !== 'online'}
                              type="primary"
                              style={{ borderRadius: '0' }}
                            />
                            <Button
                              size="small"
                              icon={<RightOutlined />}
                              onClick={() => handlePTZControl('右')}
                              disabled={selectedDevice.status !== 'online'}
                              style={{ borderRadius: '0' }}
                            />
                          </div>
                          <div className={styles.controlRow}>
                            <Button
                              size="small"
                              icon={<DownOutlined />}
                              onClick={() => handlePTZControl('下')}
                              disabled={selectedDevice.status !== 'online'}
                              style={{ borderRadius: '0 0 6px 6px' }}
                            />
                          </div>
                        </div>

                        {/* 速度控制 */}
                        <div style={{ marginTop: '8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#666' }}>控制速度：</span>
                          <Button.Group size="small">
                            <Button onClick={() => handlePTZControl('设置速度', '慢')}>慢</Button>
                            <Button type="primary" onClick={() => handlePTZControl('设置速度', '中')}>中</Button>
                            <Button onClick={() => handlePTZControl('设置速度', '快')}>快</Button>
                          </Button.Group>
                        </div>
                      </Col>

                      <Col span={10}>
                        <div className={styles.zoomControls}>
                          <Button
                            size="small"
                            icon={<ZoomInOutlined />}
                            onClick={() => handlePTZControl('放大')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                            style={{ marginBottom: '4px' }}
                          >
                            🔍 放大
                          </Button>
                          <Button
                            size="small"
                            icon={<ZoomOutOutlined />}
                            onClick={() => handlePTZControl('缩小')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                            style={{ marginBottom: '4px' }}
                          >
                            🔍 缩小
                          </Button>
                          <Button
                            size="small"
                            icon={<FullscreenOutlined />}
                            onClick={() => handlePTZControl('全屏')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                            style={{ marginBottom: '4px' }}
                          >
                            📺 全屏
                          </Button>
                          <Button
                            size="small"
                            icon={<SyncOutlined />}
                            onClick={() => handlePTZControl('自动巡航')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                          >
                            🔄 巡航
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
                      <ControlOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <p>当前设备为固定摄像头，不支持云台控制</p>
                    </div>
                  )}

                  {/* 增强的即时操作按钮 */}
                  <Divider style={{ margin: '8px 0' }}>⚡ 即时操作</Divider>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CameraOutlined />}
                        onClick={handleScreenshot}
                        disabled={selectedDevice.status !== 'online'}
                        loading={quickActionLoading}
                        block
                      >
                        📸 截图
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type={isCurrentDeviceRecording ? "danger" : "default"}
                        size="small"
                        icon={isCurrentDeviceRecording ? <StopOutlined /> : <PlayCircleOutlined />}
                        onClick={handleRecording}
                        disabled={selectedDevice.status !== 'online'}
                        loading={quickActionLoading}
                        block
                      >
                        {isCurrentDeviceRecording ? '⏹️ 停止录像' : '▶️ 开始录像'}
                      </Button>
                    </Col>
                  </Row>

                  {/* 预设位置 */}
                  {selectedDevice.type === 'ptz' && (
                    <>
                      <Divider style={{ margin: '8px 0' }}>📍 预设位置</Divider>
                      <Row gutter={[4, 4]}>
                        {['位置1', '位置2', '位置3', '位置4'].map((pos, index) => (
                          <Col span={6} key={index}>
                            <Button
                              size="small"
                              onClick={() => handlePTZControl(`转到${pos}`)}
                              disabled={selectedDevice.status !== 'online'}
                              block
                            >
                              {pos}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}
                </div>
              )}
            </Card>
          </Col>

          {/* 增强的设备列表 */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <DesktopOutlined />
                  设备列表
                  <Badge
                    count={filteredDevices.filter(d => d.status === 'online').length}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <Badge
                    count={filteredDevices.filter(d => d.status === 'offline').length}
                    style={{ backgroundColor: '#ff4d4f' }}
                  />
                </Space>
              }
              extra={
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    size="small"
                    onClick={() => message.success('设备列表已刷新')}
                  >
                    刷新
                  </Button>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'sort-name',
                          label: '按名称排序',
                          icon: <SortAscendingOutlined />
                        },
                        {
                          key: 'sort-status',
                          label: '按状态排序',
                          icon: <CheckCircleOutlined />
                        },
                        {
                          key: 'sort-region',
                          label: '按区域排序',
                          icon: <EnvironmentOutlined />
                        }
                      ]
                    }}
                    placement="bottomRight"
                  >
                    <Button size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                </Space>
              }
              className={styles.chartCard}
              bodyStyle={{
                padding: '8px',
                height: 'calc(100vh - 120px)', /* 适当减少高度，保持合适的空间利用率 */
                minHeight: '900px', /* 调整最小高度，显示更多设备信息 */
                maxHeight: '1200px', /* 调整最大高度，保持合理范围 */
                overflow: 'hidden', /* 改为hidden，让内部组件处理滚动 */
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* 设备统计概览 */}
              <div style={{ marginBottom: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                        {filteredDevices.filter(d => d.status === 'online').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>在线</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                        {filteredDevices.filter(d => d.status === 'offline').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>离线</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                        {recordingDevices.size}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>录像中</div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className={styles.deviceList}>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map(device => (
                    <div
                      key={device.id}
                      className={`${styles.deviceItem} ${selectedDevice?.id === device.id ? styles.selected : ''}`}
                      onClick={() => setSelectedDevice(device)}
                      style={{
                        marginBottom: '8px',
                        padding: '12px',
                        border: selectedDevice?.id === device.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: selectedDevice?.id === device.id ? '#f0f8ff' : '#fff'
                      }}
                    >
                      <div className={styles.deviceInfo}>
                        <div className={styles.deviceHeader} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={styles.deviceName} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                              {device.type === 'ptz' ? '🎯' : '📷'} {device.name}
                            </span>
                            <Badge
                              status={
                                device.status === 'online' ? 'success' :
                                device.status === 'offline' ? 'error' : 'warning'
                              }
                              text={
                                device.status === 'online' ? '在线' :
                                device.status === 'offline' ? '离线' : '维护中'
                              }
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                          📍 {device.location}
                        </div>

                        <div style={{ marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                          🆔 {device.id} | 📺 {device.resolution}
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <Space size={4}>
                            <Tag size="small" color={device.type === 'ptz' ? 'blue' : 'green'}>
                              {device.type === 'ptz' ? '云台' : '固定'}
                            </Tag>
                            {device.nightVision && (
                              <Tag size="small" color="purple">夜视</Tag>
                            )}
                            {recordingDevices.has(device.id) && (
                              <Tag size="small" color="red">录像中</Tag>
                            )}
                          </Space>
                        </div>

                        {/* 设备快捷操作 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#999' }}>
                            🕐 {device.lastUpdate}
                          </span>
                          <Space size={4}>
                            <Button
                              size="small"
                              icon={<CameraOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScreenshot(device.id);
                              }}
                              disabled={device.status !== 'online'}
                              style={{ fontSize: '11px', padding: '0 4px' }}
                            />
                            <Button
                              size="small"
                              type={recordingDevices.has(device.id) ? "danger" : "default"}
                              icon={recordingDevices.has(device.id) ? <StopOutlined /> : <PlayCircleOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecording(device.id);
                              }}
                              disabled={device.status !== 'online'}
                              style={{ fontSize: '11px', padding: '0 4px' }}
                            />
                          </Space>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                    <SearchOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <p>没有找到符合条件的设备</p>
                    <p style={{ fontSize: '12px' }}>请调整筛选条件</p>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 保存跟踪配置
  const handleSaveConfig = async (values) => {
    setTrackingLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrackingConfig({
        ...trackingConfig,
        ...values
      });
      message.success('自动跟踪配置保存成功！');
    } catch (error) {
      message.error('保存配置失败，请重试！');
    } finally {
      setTrackingLoading(false);
    }
  };

  // 重置跟踪配置
  const handleResetConfig = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置所有配置到默认值吗？',
      onOk: () => {
        const defaultConfig = {
          targetTypes: ['commercial', 'fishing', 'military'],
          priorityRules: {
            military: 1,
            militaryOther: 2,
            commercial: 3,
            fishing: 4
          },
          autoTracking: true,
          trackingRadius: 1000,
          trackingDuration: 300,
          confidenceThreshold: 0.8
        };
        setTrackingConfig(defaultConfig);
        trackingForm.setFieldsValue(defaultConfig);
        // 重置优先级列表
        setPriorityList([
          { id: 'military', title: '军舰', desc: '最高优先级，立即跟踪', status: 'error' },
          { id: 'militaryOther', title: '其他军用船舶', desc: '高优先级', status: 'warning' },
          { id: 'commercial', title: '商船', desc: '中等优先级', status: 'processing' },
          { id: 'fishing', title: '渔船', desc: '普通优先级', status: 'default' }
        ]);
        message.success('配置已重置为默认值');
      }
    });
  };

  // 处理优先级拖拽排序
  const handlePriorityMove = (dragIndex, hoverIndex) => {
    const newPriorityList = [...priorityList];
    const dragItem = newPriorityList[dragIndex];
    newPriorityList.splice(dragIndex, 1);
    newPriorityList.splice(hoverIndex, 0, dragItem);
    setPriorityList(newPriorityList);
    
    // 更新配置中的优先级规则
    const updatedPriorityRules = {};
    newPriorityList.forEach((item, index) => {
      updatedPriorityRules[item.id] = index + 1;
    });
    setTrackingConfig(prev => ({
      ...prev,
      priorityRules: updatedPriorityRules
    }));
  };

  // 向上移动优先级
  const movePriorityUp = (index) => {
    if (index > 0) {
      handlePriorityMove(index, index - 1);
      message.success('优先级调整成功');
    }
  };

  // 向下移动优先级
  const movePriorityDown = (index) => {
    if (index < priorityList.length - 1) {
      handlePriorityMove(index, index + 1);
      message.success('优先级调整成功');
    }
  };



  // 搜索功能
  const handleSearch = (values) => {
    console.log('搜索条件:', values);
    message.success('搜索完成');
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    message.success('搜索条件已重置');
  };

  // 播放录像
  const handlePlayback = (record) => {
    if (record.fileType !== 'video') {
      message.warning('该文件不是视频文件，无法播放');
      return;
    }
    setSelectedRecord(record);
    setPlaybackVisible(true);
  };

  // 下载文件
  const handleDownload = (record) => {
    message.success(`开始下载文件: ${record.fileName}`);
    // 这里可以实现实际的下载逻辑
  };

  // 删除记录
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除录像文件 "${record.fileName}" 吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: () => {
        message.success('录像文件删除成功');
      }
    });
  };

  // 查看事件详情
  const handleViewEvent = (record) => {
    Modal.info({
      title: '事件台账详情',
      width: 600,
      content: (
        <div>
          <p><strong>事件ID:</strong> {record.eventId}</p>
          <p><strong>目标信息:</strong> {record.targetInfo}</p>
          <p><strong>监控设备:</strong> {record.deviceName}</p>
          <p><strong>记录时间:</strong> {record.startTime} - {record.endTime}</p>
          <p><strong>记录类型:</strong> {record.recordType === 'auto' ? '自动录像' : '手动录像'}</p>
          <p><strong>文件状态:</strong> {record.status === 'completed' ? '已完成' : '处理中'}</p>
        </div>
      )
    });
  };

  // CCTV 录像管理内容
  const renderCCTVRecords = () => {

    // 模拟录像数据
    const recordsData = [
      {
        id: 'REC001',
        deviceId: 'CAM001',
        deviceName: '港口入口监控',
        fileName: '20241230_140530_CAM001.mp4',
        fileType: 'video',
        targetType: 'military',
        targetInfo: '军舰-052D型驱逐舰',
        recordType: 'auto',
        startTime: '2024-12-30 14:05:30',
        endTime: '2024-12-30 14:15:45',
        duration: '10分15秒',
        fileSize: '245MB',
        status: 'completed',
        eventId: 'EVT001'
      },
      {
        id: 'REC002',
        deviceId: 'CAM002',
        deviceName: '码头作业区监控',
        fileName: '20241230_135220_CAM002.jpg',
        fileType: 'image',
        targetType: 'commercial',
        targetInfo: '商船-集装箱船',
        recordType: 'manual',
        startTime: '2024-12-30 13:52:20',
        endTime: '2024-12-30 13:52:20',
        duration: '截图',
        fileSize: '2.3MB',
        status: 'completed',
        eventId: 'EVT002'
      },
      {
        id: 'REC003',
        deviceId: 'CAM004',
        deviceName: '航道监控点A',
        fileName: '20241230_120000_CAM004.mp4',
        fileType: 'video',
        targetType: 'fishing',
        targetInfo: '渔船-拖网渔船',
        recordType: 'auto',
        startTime: '2024-12-30 12:00:00',
        endTime: '2024-12-30 12:08:30',
        duration: '8分30秒',
        fileSize: '180MB',
        status: 'completed',
        eventId: 'EVT003'
      },
      {
        id: 'REC004',
        deviceId: 'CAM001',
        deviceName: '港口入口监控',
        fileName: '20241230_110000_CAM001.mp4',
        fileType: 'video',
        targetType: 'unknown',
        targetInfo: '无名目标',
        recordType: 'auto',
        startTime: '2024-12-30 11:00:00',
        endTime: '2024-12-30 11:05:15',
        duration: '5分15秒',
        fileSize: '125MB',
        status: 'processing',
        eventId: 'EVT004'
      }
    ];



    const columns = [
      {
        title: '文件名',
        dataIndex: 'fileName',
        key: 'fileName',
        width: 200,
        render: (text, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.fileType === 'video' ? <PlaySquareOutlined /> : <FileImageOutlined />}
              {' '}{record.fileSize}
            </div>
          </div>
        )
      },
      {
        title: '监控设备',
        dataIndex: 'deviceName',
        key: 'deviceName',
        width: 150,
        render: (text, record) => (
          <div>
            <div>{text}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.deviceId}</div>
          </div>
        )
      },
      {
        title: '目标信息',
        dataIndex: 'targetInfo',
        key: 'targetInfo',
        width: 150,
        render: (text, record) => (
          <div>
            <Tag color={
              record.targetType === 'military' ? 'red' :
              record.targetType === 'commercial' ? 'blue' :
              record.targetType === 'fishing' ? 'green' : 'default'
            }>
              {record.targetType === 'military' ? '军舰' :
               record.targetType === 'commercial' ? '商船' :
               record.targetType === 'fishing' ? '渔船' : '未知'}
            </Tag>
            <div style={{ fontSize: 12, marginTop: 4 }}>{text}</div>
          </div>
        )
      },
      {
        title: '记录时间',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 180,
        render: (text, record) => (
          <div>
            <div>{text}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              时长: {record.duration}
            </div>
          </div>
        )
      },
      {
        title: '记录类型',
        dataIndex: 'recordType',
        key: 'recordType',
        width: 100,
        render: (type) => (
          <Tag color={type === 'auto' ? 'blue' : 'orange'}>
            {type === 'auto' ? '自动' : '手动'}
          </Tag>
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <Badge
            status={status === 'completed' ? 'success' : 'processing'}
            text={status === 'completed' ? '已完成' : '处理中'}
          />
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        render: (_, record) => (
          <Space size="small" wrap>
            {record.fileType === 'video' && (
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handlePlayback(record)}
                disabled={record.status !== 'completed'}
              >
                播放
              </Button>
            )}
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              disabled={record.status !== 'completed'}
            >
              下载
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewEvent(record)}
            >
              事件
            </Button>
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              className="deleteButton"
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Space>
        )
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>录像管理</h3>
          <Button type="primary" icon={<PlusOutlined />}>手动录像</Button>
        </div>

        {/* 搜索筛选区域 */}
        <Card className={styles.searchCard}>
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name="timeRange" label="时间范围">
              <DatePicker.RangePicker
                showTime
                placeholder={['开始时间', '结束时间']}
              />
            </Form.Item>

            <Form.Item name="deviceId" label="监控设备">
              <Select placeholder="选择设备" style={{ width: 150 }} allowClear>
                <Option value="CAM001">港口入口监控</Option>
                <Option value="CAM002">码头作业区监控</Option>
                <Option value="CAM003">船舶停泊区监控</Option>
                <Option value="CAM004">航道监控点A</Option>
                <Option value="CAM005">航道监控点B</Option>
              </Select>
            </Form.Item>

            <Form.Item name="targetType" label="目标类型">
              <Select placeholder="选择类型" style={{ width: 140 }} allowClear>
                <Option value="military">军舰</Option>
                <Option value="commercial">商船</Option>
                <Option value="fishing">渔船</Option>
                <Option value="unknown">未知</Option>
              </Select>
            </Form.Item>

            <Form.Item name="recordType" label="记录类型">
              <Select placeholder="记录类型" style={{ width: 140 }} allowClear>
                <Option value="auto">自动录像</Option>
                <Option value="manual">手动录像</Option>
              </Select>
            </Form.Item>

            <Form.Item name="fileType" label="文件类型">
              <Select placeholder="文件类型" style={{ width: 140 }} allowClear>
                <Option value="video">视频</Option>
                <Option value="image">截图</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 录像列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={recordsData}
            rowKey="id"
            pagination={{
              total: recordsData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 录像播放模态框 */}
        <Modal
          title={`录像播放 - ${selectedRecord?.fileName}`}
          open={playbackVisible}
          onCancel={() => setPlaybackVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setPlaybackVisible(false)}>
              关闭
            </Button>,
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(selectedRecord)}
            >
              下载
            </Button>
          ]}
        >
          {selectedRecord && (
            <div className={styles.playbackContainer}>
              <div className={styles.videoPlayer}>
                <div className={styles.videoPlaceholder}>
                  <PlayCircleOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                  <p>录像播放器</p>
                  <p>{selectedRecord.fileName}</p>
                  <p>时长: {selectedRecord.duration}</p>
                </div>
              </div>
              <div className={styles.playbackControls}>
                <Space>
                  <Button icon={<PlayCircleOutlined />}>播放</Button>
                  <Button icon={<PauseCircleOutlined />}>暂停</Button>
                  <Button icon={<StopOutlined />}>停止</Button>
                  <Button icon={<FullscreenOutlined />}>全屏</Button>
                </Space>
              </div>
              <div className={styles.recordInfo}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <strong>设备:</strong> {selectedRecord.deviceName}
                  </Col>
                  <Col span={12}>
                    <strong>目标:</strong> {selectedRecord.targetInfo}
                  </Col>
                  <Col span={12}>
                    <strong>开始时间:</strong> {selectedRecord.startTime}
                  </Col>
                  <Col span={12}>
                    <strong>结束时间:</strong> {selectedRecord.endTime}
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  // 用户管理内容
  const renderUserManagement = () => {
    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '正常' : '禁用'}
          </Tag>
        )
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
            <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
            <Button type="link" size="small" icon={<DeleteOutlined />} className="deleteButton">删除</Button>
          </Space>
        ),
      },
    ];

    const data = [
      { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', status: 'active' },
      { id: 2, username: 'user1', name: '用户1', email: 'user1@example.com', status: 'active' },
      { id: 3, username: 'user2', name: '用户2', email: 'user2@example.com', status: 'inactive' },
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>用户管理</h3>
          <Button type="primary" icon={<PlusOutlined />}>新增用户</Button>
        </div>
        <Card>
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    );
  };

  // 角色管理内容
  const renderRoleManagement = () => {
    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>角色管理</h3>
          <Button type="primary" icon={<PlusOutlined />}>新增角色</Button>
        </div>
        <Card>
          <div className={styles.placeholder}>
            <p>角色管理功能待开发</p>
          </div>
        </Card>
      </div>
    );
  };

  // 权限管理内容
  const renderPermissionManagement = () => {
    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>权限管理</h3>
          <Button type="primary" icon={<PlusOutlined />}>新增权限</Button>
        </div>
        <Card>
          <div className={styles.placeholder}>
            <p>权限管理功能待开发</p>
          </div>
        </Card>
      </div>
    );
  };

  // ============= 智能预警参数设置处理函数 =============
  
  // 添加操作日志
  const addOperationLog = (action, details, result = '成功') => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-CN'),
      operator: '当前用户', // 实际应用中应该从用户状态获取
      action,
      details,
      result,
      ip: '192.168.1.100' // 实际应用中应该从系统获取
    };
    setOperationLogs(prev => [newLog, ...prev]);
  };

  // 保存碰撞预警配置
  const handleSaveCollisionConfig = async (values) => {
    try {
      const newConfig = { ...collisionAlertConfig, ...values };
      setCollisionAlertConfig(newConfig);

      // 记录操作日志
      const changes = [];
      if (values.cpaThreshold !== collisionAlertConfig.cpaThreshold) {
        changes.push(`CPA阈值: ${collisionAlertConfig.cpaThreshold} → ${values.cpaThreshold}海里`);
      }
      if (values.tcpaThreshold !== collisionAlertConfig.tcpaThreshold) {
        changes.push(`TCPA阈值: ${collisionAlertConfig.tcpaThreshold} → ${values.tcpaThreshold}分钟`);
      }
      if (values.cpaEnabled !== collisionAlertConfig.cpaEnabled) {
        changes.push(`CPA预警: ${collisionAlertConfig.cpaEnabled ? '开启' : '关闭'} → ${values.cpaEnabled ? '开启' : '关闭'}`);
      }
      if (values.tcpaEnabled !== collisionAlertConfig.tcpaEnabled) {
        changes.push(`TCPA预警: ${collisionAlertConfig.tcpaEnabled ? '开启' : '关闭'} → ${values.tcpaEnabled ? '开启' : '关闭'}`);
      }

      addOperationLog(
        '保存配置',
        changes.length > 0 ? changes.join('; ') : '配置无变更',
        '成功'
      );

      message.success('碰撞风险预警配置保存成功！');
      console.log('碰撞预警配置:', newConfig);
    } catch (error) {
      addOperationLog('保存配置', '保存碰撞预警配置', '失败');
      message.error('保存配置失败，请重试！');
    }
  };

  // 重置碰撞预警配置
  const handleResetCollisionConfig = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置碰撞预警配置到默认值吗？',
      onOk: () => {
        const defaultConfig = {
          cpaThreshold: 0.5,
          tcpaThreshold: 10,
          cpaLevel: 'high',
          tcpaLevel: 'high',
          cpaEnabled: true,
          tcpaEnabled: true,
          alertSound: true,
          autoRecord: false
        };

        // 记录重置前的配置
        const oldConfig = collisionAlertConfig;
        const resetDetails = [
          `CPA阈值: ${oldConfig.cpaThreshold} → 0.5海里`,
          `TCPA阈值: ${oldConfig.tcpaThreshold} → 10分钟`,
          `CPA预警: ${oldConfig.cpaEnabled ? '开启' : '关闭'} → 开启`,
          `TCPA预警: ${oldConfig.tcpaEnabled ? '开启' : '关闭'} → 开启`
        ];

        setCollisionAlertConfig(defaultConfig);
        collisionForm.setFieldsValue(defaultConfig);

        // 记录操作日志
        addOperationLog(
          '重置配置',
          `重置为默认值: ${resetDetails.join('; ')}`,
          '成功'
        );

        message.success('配置已重置为默认值');
      }
    });
  };

  // 保存偏航预警配置
  const handleSaveDeviationConfig = async (values) => {
    try {
      const newConfig = { ...deviationAlertConfig, ...values };
      setDeviationAlertConfig(newConfig);
      message.success('船舶偏航预警配置保存成功！');
      console.log('偏航预警配置:', newConfig);
    } catch (error) {
      message.error('保存配置失败，请重试！');
    }
  };

  // 导入航线数据
  const handleImportRoute = () => {
    message.success('航线数据导入成功！已导入3条预设航线');
    setDeviationAlertConfig(prev => ({
      ...prev,
      routes: [
        { id: '1', name: '主航道A线', points: 12, status: 'active' },
        { id: '2', name: 'LNG专用航线', points: 8, status: 'active' },
        { id: '3', name: '货船常规航线', points: 15, status: 'inactive' }
      ]
    }));
  };

  // 添加特殊目标
  const handleAddSpecialTarget = (values) => {
    const newTarget = {
      id: Date.now().toString(),
      mmsi: values.mmsi,
      type: values.type,
      remark: values.remark || '',
      createTime: new Date().toLocaleString(),
      status: 'enabled',
      operator: 'admin'
    };
    setSpecialTargets(prev => [newTarget, ...prev]);
    specialTargetForm.resetFields();
    message.success('特殊目标添加成功！');
  };

  // 删除特殊目标
  const handleDeleteSpecialTarget = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该特殊目标吗？',
      onOk: () => {
        setSpecialTargets(prev => prev.filter(item => item.id !== id));
        message.success('删除成功！');
      }
    });
  };

  // 切换特殊目标状态
  const handleToggleSpecialTarget = (id) => {
    setSpecialTargets(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'enabled' ? 'disabled' : 'enabled' }
        : item
    ));
    message.success('状态更新成功！');
  };

  // 批量导入特殊目标
  const handleBatchImportTargets = () => {
    message.success('批量导入功能开发中，请使用手动添加！');
  };

  // 保存VHF播发配置
  const handleSaveVHFConfig = async (values) => {
    try {
      const newConfig = { ...vhfBroadcastConfig, ...values };
      setVhfBroadcastConfig(newConfig);
      message.success('VHF自动播发配置保存成功！');
      console.log('VHF配置:', newConfig);
    } catch (error) {
      message.error('保存配置失败，请重试！');
    }
  };

  // 测试VHF播发
  const handleTestVHF = () => {
    message.info('正在测试VHF播发...');
    setTimeout(() => {
      message.success('VHF播发测试成功：' + vhfBroadcastConfig.alertTemplate);
    }, 1000);
  };

  // 保存CCTV联动配置
  const handleSaveCCTVLinkage = (type, actions) => {
    setCctvLinkageConfig(prev => ({
      ...prev,
      [type]: actions
    }));
    message.success('CCTV联动规则更新成功！');
  };

  // 保存通知配置
  const handleSaveNotificationConfig = async (values) => {
    try {
      const newConfig = { ...notificationConfig, ...values };
      setNotificationConfig(newConfig);
      message.success('告警通知配置保存成功！');
      console.log('通知配置:', newConfig);
    } catch (error) {
      message.error('保存配置失败，请重试！');
    }
  };

  // 测试通知功能
  const handleTestNotification = (type) => {
    switch(type) {
      case 'popup':
        Modal.info({
          title: '测试弹窗通知',
          content: '这是一个测试的告警弹窗通知',
        });
        break;
      case 'sound':
        message.success('音频告警测试（实际环境中会播放告警音）');
        break;
      case 'sms':
        message.success('短信通知测试发送成功');
        break;
      case 'email':
        message.success('邮件通知测试发送成功');
        break;
      default:
        message.info('测试通知功能');
    }
  };

  // 碰撞风险预警设置
  const renderCollisionAlert = () => {
    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>碰撞风险预警设置</h3>
          <Space>
            <Button onClick={handleResetCollisionConfig}>
              重置配置
            </Button>
            <Button type="primary" icon={<SettingOutlined />} onClick={() => collisionForm.submit()}>
              保存配置
            </Button>
          </Space>
        </div>

        <Form
          form={collisionForm}
          layout="vertical"
          initialValues={collisionAlertConfig}
          onFinish={handleSaveCollisionConfig}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="CPA预警参数" className={styles.configCard}>
                <Form.Item 
                  name="cpaThreshold"
                  label="最近会遇距离阈值 (海里)" 
                  tooltip="当两船最近会遇距离小于此值时触发预警"
                  rules={[{ required: true, message: '请输入CPA阈值' }]}
                >
                  <InputNumber
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="0.5"
                    addonAfter="海里"
                  />
                </Form.Item>
                <Form.Item name="cpaEnabled" label="CPA预警状态" valuePropName="checked">
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="TCPA预警参数" className={styles.configCard}>
                <Form.Item 
                  name="tcpaThreshold"
                  label="最近会遇时间阈值 (分钟)" 
                  tooltip="当两船预计会遇时间小于此值时触发预警"
                  rules={[{ required: true, message: '请输入TCPA阈值' }]}
                >
                  <InputNumber
                    min={1}
                    max={60}
                    step={1}
                    style={{ width: '100%' }}
                    placeholder="10"
                    addonAfter="分钟"
                  />
                </Form.Item>
                <Form.Item name="tcpaEnabled" label="TCPA预警状态" valuePropName="checked">
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>

        {/* 操作日志模块 */}
        <Card style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>📋 操作日志</h4>
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => message.info('刷新日志')}
              >
                刷新
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => message.info('导出日志')}
              >
                导出
              </Button>
              <Button
                size="small"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: '确认清空',
                    content: '确定要清空所有操作日志吗？此操作不可恢复。',
                    onOk: () => {
                      setOperationLogs([]);
                      message.success('操作日志已清空');
                    }
                  });
                }}
              >
                清空日志
              </Button>
            </Space>
          </div>

          <Table
            columns={[
              {
                title: '操作时间',
                dataIndex: 'timestamp',
                key: 'timestamp',
                width: 160,
                sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
                defaultSortOrder: 'descend'
              },
              {
                title: '操作人员',
                dataIndex: 'operator',
                key: 'operator',
                width: 120
              },
              {
                title: '操作类型',
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (action) => (
                  <Tag color={action === '保存配置' ? 'blue' : action === '重置配置' ? 'orange' : 'default'}>
                    {action}
                  </Tag>
                )
              },
              {
                title: '操作详情',
                dataIndex: 'details',
                key: 'details',
                ellipsis: {
                  showTitle: false,
                },
                render: (details) => (
                  <Tooltip placement="topLeft" title={details}>
                    {details}
                  </Tooltip>
                )
              },
              {
                title: '操作结果',
                dataIndex: 'result',
                key: 'result',
                width: 80,
                render: (result) => (
                  <Tag color={result === '成功' ? 'success' : 'error'}>
                    {result}
                  </Tag>
                )
              },
              {
                title: 'IP地址',
                dataIndex: 'ip',
                key: 'ip',
                width: 120
              }
            ]}
            dataSource={operationLogs}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }}
            size="small"
            locale={{
              emptyText: (
                <div style={{ padding: '20px 0', color: '#999' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>📝</div>
                  <div>暂无操作日志</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    进行配置保存或重置操作后，日志将显示在这里
                  </div>
                </div>
              )
            }}
          />
        </Card>
      </div>
    );
  };

  // 船舶偏航预警设置
  const renderDeviationAlert = () => {
    // 筛选船舶数据
    const filteredShips = shipList.filter(ship => {
      const matchType = shipTypeFilter === 'all' || ship.type === shipTypeFilter;
      const matchSearch = ship.name.toLowerCase().includes(shipSearchText.toLowerCase()) ||
                         ship.mmsi.includes(shipSearchText);
      return matchType && matchSearch;
    });

    // 筛选航线数据
    const filteredRoutes = routeList.filter(route => {
      return route.name.toLowerCase().includes(routeSearchText.toLowerCase());
    });

    // 获取船舶类型标签
    const getShipTypeTag = (type) => {
      const typeMap = {
        commercial: { color: 'blue', text: '商船' },
        fishing: { color: 'green', text: '渔船' },
        military: { color: 'red', text: '军舰' }
      };
      return typeMap[type] || { color: 'default', text: '未知' };
    };

    // 获取船舶状态标签
    const getShipStatusTag = (status) => {
      const statusMap = {
        sailing: { color: 'processing', text: '航行中' },
        anchored: { color: 'warning', text: '锚泊' },
        docked: { color: 'default', text: '靠泊' }
      };
      return statusMap[status] || { color: 'default', text: '未知' };
    };

    // 获取航线类型标签
    const getRouteTypeTag = (type) => {
      const typeMap = {
        commercial: { color: 'blue', text: '商业航线' },
        fishing: { color: 'green', text: '渔业航线' },
        military: { color: 'red', text: '军用航线' }
      };
      return typeMap[type] || { color: 'default', text: '通用航线' };
    };
    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>船舶偏航预警设置</h3>
        </div>

        {/* 偏航预警参数设置 */}

        <Form
          form={deviationForm}
          layout="vertical"
          initialValues={deviationAlertConfig}
          onFinish={handleSaveDeviationConfig}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card
                title="偏航阈值设置"
                className={styles.configCard}
                extra={
                  <Button type="primary" icon={<SettingOutlined />} onClick={() => deviationForm.submit()}>
                    保存配置
                  </Button>
                }
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12} lg={8}>
                    <Form.Item
                      name="distanceThreshold"
                      label="偏航距离阈值 (海里)"
                      tooltip="船舶偏离预设航线的距离超过此值时触发预警"
                      rules={[{ required: true, message: '请输入偏航距离阈值' }]}
                    >
                      <InputNumber
                        min={0.1}
                        max={10.0}
                        step={0.1}
                        style={{ width: '100%' }}
                        addonAfter="海里"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Form.Item
                      name="timeThreshold"
                      label="偏航时间阈值 (分钟)"
                      tooltip="持续偏航时间超过此值时触发预警"
                      rules={[{ required: true, message: '请输入偏航时间阈值' }]}
                    >
                      <InputNumber
                        min={1}
                        max={30}
                        step={1}
                        style={{ width: '100%' }}
                        addonAfter="分钟"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} lg={4}>
                    <Form.Item name="highlightTrack" label="高亮显示偏航轨迹" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} lg={4}>
                    <Form.Item name="autoAlert" label="自动告警" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24}>
              <Card
                title="船舶与航线管理"
                className={styles.configCard}
                extra={
                  <Button icon={<UploadOutlined />} onClick={handleImportRoute}>
                    导入航线
                  </Button>
                }
              >
                <Radio.Group
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="ships">船舶列表</Radio.Button>
                  <Radio.Button value="routes">航线数据</Radio.Button>
                </Radio.Group>

                {activeTab === 'ships' && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Row gutter={8}>
                        <Col flex="auto">
                          <Search
                            placeholder="搜索船舶名称、MMSI"
                            allowClear
                            value={shipSearchText}
                            onChange={(e) => setShipSearchText(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </Col>
                        <Col>
                          <Select
                            placeholder="船舶类型"
                            style={{ width: 140 }}
                            value={shipTypeFilter}
                            onChange={setShipTypeFilter}
                          >
                            <Option value="all">全部类型</Option>
                            <Option value="commercial">商船</Option>
                            <Option value="fishing">渔船</Option>
                            <Option value="military">军舰</Option>
                          </Select>
                        </Col>
                        <Col>
                          <Button type="primary" icon={<PlusOutlined />}>
                            添加船舶
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    <Table
                      dataSource={filteredShips}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5, showSizeChanger: false }}
                      columns={[
                        {
                          title: 'MMSI',
                          dataIndex: 'mmsi',
                          width: 100,
                        },
                        {
                          title: '船舶名称',
                          dataIndex: 'name',
                          width: 120,
                        },
                        {
                          title: '类型',
                          dataIndex: 'type',
                          width: 80,
                          render: (type) => {
                            const tag = getShipTypeTag(type);
                            return <Tag color={tag.color}>{tag.text}</Tag>;
                          }
                        },
                        {
                          title: '状态',
                          dataIndex: 'status',
                          width: 80,
                          render: (status) => {
                            const tag = getShipStatusTag(status);
                            return <Badge status={tag.color} text={tag.text} />;
                          }
                        },
                        {
                          title: '关联航线',
                          dataIndex: 'routeName',
                          width: 120,
                          render: (routeName, record) => (
                            <Tooltip title={`点击查看航线详情`}>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                  setActiveTab('routes');
                                  setRouteSearchText(routeName);
                                }}
                              >
                                {routeName}
                              </Button>
                            </Tooltip>
                          )
                        },
                        {
                          title: '操作',
                          width: 100,
                          render: (_, record) => (
                            <Space size="small">
                              <Button type="link" size="small" icon={<EditOutlined />}>
                                编辑
                              </Button>
                              <Button type="link" size="small" icon={<DeleteOutlined />} danger>
                                删除
                              </Button>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </div>
                )}

                {activeTab === 'routes' && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Row gutter={8}>
                        <Col flex="auto">
                          <Search
                            placeholder="搜索航线名称"
                            allowClear
                            value={routeSearchText}
                            onChange={(e) => setRouteSearchText(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </Col>
                        <Col>
                          <Button type="primary" icon={<PlusOutlined />}>
                            新建航线
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    <Table
                      dataSource={filteredRoutes}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5, showSizeChanger: false }}
                      expandable={{
                        expandedRowRender: (record) => (
                          <div style={{ padding: '8px 0' }}>
                            <h4>航线路径点：</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {record.points.map((point, index) => (
                                <Tag key={index} color="blue">
                                  {point.name} ({point.lat.toFixed(4)}, {point.lng.toFixed(4)})
                                </Tag>
                              ))}
                            </div>
                          </div>
                        ),
                        rowExpandable: (record) => record.points && record.points.length > 0,
                      }}
                      columns={[
                        {
                          title: '航线名称',
                          dataIndex: 'name',
                          width: 140,
                        },
                        {
                          title: '类型',
                          dataIndex: 'type',
                          width: 100,
                          render: (type) => {
                            const tag = getRouteTypeTag(type);
                            return <Tag color={tag.color}>{tag.text}</Tag>;
                          }
                        },
                        {
                          title: '起点',
                          dataIndex: 'startPoint',
                          width: 100,
                        },
                        {
                          title: '终点',
                          dataIndex: 'endPoint',
                          width: 100,
                        },
                        {
                          title: '距离',
                          dataIndex: 'distance',
                          width: 80,
                          render: (distance) => `${distance} 海里`
                        },
                        {
                          title: '关联船舶',
                          dataIndex: 'shipCount',
                          width: 80,
                          render: (count, record) => (
                            <Tooltip title="点击查看使用此航线的船舶">
                              <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                  setActiveTab('ships');
                                  setShipSearchText('');
                                  // 这里可以添加按航线筛选船舶的逻辑
                                }}
                              >
                                {count} 艘
                              </Button>
                            </Tooltip>
                          )
                        },
                        {
                          title: '操作',
                          width: 120,
                          render: (_, record) => (
                            <Space size="small">
                              <Button type="link" size="small" icon={<EyeOutlined />}>
                                预览
                              </Button>
                              <Button type="link" size="small" icon={<EditOutlined />}>
                                编辑
                              </Button>
                              <Button type="link" size="small" icon={<DeleteOutlined />} danger>
                                删除
                              </Button>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>


        </Form>
      </div>
    );
  };

  // 进出围栏告警设置 - 重构版本
  const renderFenceAlert = () => {
    // 模拟围栏数据
    const fenceList = [
      {
        id: '1',
        name: '禁航区A',
        type: 'forbidden',
        status: 'active',
        createTime: '2024-01-10 14:30',
        shape: 'polygon',
        area: '2.5平方公里',
        effectTime: '全天',
        alertLevel: 'high',
        description: '港口核心区域禁航'
      },
      {
        id: '2',
        name: '通航区B',
        type: 'navigation',
        status: 'active',
        createTime: '2024-01-12 09:15',
        shape: 'circle',
        area: '5.2平方公里',
        effectTime: '06:00-22:00',
        alertLevel: 'medium',
        description: '主要通航航道'
      },
      {
        id: '3',
        name: '临时限制区',
        type: 'restricted',
        status: 'inactive',
        createTime: '2024-01-15 16:45',
        shape: 'rectangle',
        area: '1.8平方公里',
        effectTime: '自定义时段',
        alertLevel: 'low',
        description: '临时监控区域'
      }
    ];

    // 绘制工具状态已在组件顶层声明

    const handleCreateFence = () => {
      setShowCreateModal(true);
      createForm.resetFields();
    };

    const handleEditFence = (fence) => {
      setShowCreateModal(true);
      createForm.setFieldsValue({
        name: fence.name,
        type: fence.type,
        effectTime: fence.effectTime,
        alertLevel: fence.alertLevel,
        description: fence.description
      });
      message.info(`编辑围栏: ${fence.name}`);
    };

    const handleDeleteFence = (fence) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除围栏"${fence.name}"吗？此操作不可撤销。`,
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: () => {
          message.success('围栏删除成功');
        }
      });
    };

    const handleToggleFence = (fence) => {
      message.success(`围栏"${fence.name}"状态已切换为${fence.status === 'active' ? '禁用' : '启用'}`);
    };

    const handleDrawingModeChange = (mode) => {
      setDrawingMode(mode);
      message.info(`已切换到${mode === 'polygon' ? '多边形' : mode === 'circle' ? '圆形' : '矩形'}绘制模式`);
    };

    const handleSaveFence = (values) => {
      console.log('保存围栏配置:', values);
      
      // 构建围栏数据
      const fenceData = {
        ...values,
        id: `fence_${Date.now()}`,
        createTime: new Date().toLocaleString(),
        status: values.enabled ? 'active' : 'inactive',
        coordinates: drawingMode ? 'mock_coordinates' : null
      };

      // 如果告警未开启，移除告警相关配置
      if (!values.alertEnabled) {
        delete fenceData.effectTime;
        delete fenceData.alertDelay;
      }

      console.log('最终围栏数据:', fenceData);
      
      message.success('围栏配置保存成功');
      setShowCreateModal(false);
      createForm.resetFields();
      setDrawingMode(null);
      setAlertEnabled(true);
    };

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>🚧 进出围栏告警设置</h3>
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => message.info('预览所有围栏')}>
              预览围栏
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => message.success('围栏列表已刷新')}>
              刷新列表
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => message.success('围栏数据导出成功')}>
              导出数据
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateFence}>
              新增围栏
            </Button>
          </Space>
        </div>

        <Alert
          message="围栏告警功能说明"
          description="通过在电子地图上绘制围栏区域，系统可自动监测船舶进出围栏并触发告警。支持多边形、圆形、矩形三种围栏形状，可设置不同的告警级别和生效时间。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* 查询筛选条件 */}
        <Card
          title={
            <Space>
              <SearchOutlined />
              查询筛选条件
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item label="围栏类型" style={{ marginBottom: 0 }}>
                <Select style={{ width: '100%' }} placeholder="全部类型" allowClear>
                  <Option value="forbidden">🚫 禁航区</Option>
                  <Option value="navigation">⚓ 通航区</Option>
                  <Option value="restricted">⚠️ 限制区</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="围栏状态" style={{ marginBottom: 0 }}>
                <Select style={{ width: '100%' }} placeholder="全部状态" allowClear>
                  <Option value="active">🟢 启用</Option>
                  <Option value="inactive">🔴 禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item label="创建时间" style={{ marginBottom: 0 }}>
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label="围栏名称" style={{ marginBottom: 0 }}>
                <Search
                  placeholder="搜索围栏名称"
                  style={{ width: '100%' }}
                  allowClear
                  onSearch={(value) => message.info(`搜索: ${value}`)}
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button icon={<SearchOutlined />} type="primary">
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 围栏统计概览 */}
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card size="small" className={styles.statCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
                  {fenceList.length}
                </div>
                <div style={{ fontSize: 16, color: '#666', fontWeight: '500' }}>围栏总数</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  系统中所有围栏数量
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className={styles.statCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a', marginBottom: 8 }}>
                  {fenceList.filter(f => f.status === 'active').length}
                </div>
                <div style={{ fontSize: 16, color: '#666', fontWeight: '500' }}>启用围栏</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  当前正在生效的围栏
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className={styles.statCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14', marginBottom: 8 }}>
                  {fenceList.filter(f => f.status === 'inactive').length}
                </div>
                <div style={{ fontSize: 16, color: '#666', fontWeight: '500' }}>禁用围栏</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  暂时停用的围栏
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 围栏管理列表 - 全宽布局 */}
        <Card
          title={
            <Space>
              <AppstoreOutlined />
              围栏管理列表
              <Badge count={fenceList.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          className={styles.configCard}
        >
          <Row gutter={[16, 16]}>
            {fenceList.map(fence => (
              <Col xs={24} sm={12} lg={8} xl={6} key={fence.id}>
                <div
                  style={{
                    padding: 16,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fff',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
                    e.currentTarget.style.borderColor = '#1890ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* 围栏头部信息 */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 'bold', fontSize: 16, color: '#262626' }}>
                        {fence.type === 'forbidden' && '🚫 '}
                        {fence.type === 'navigation' && '⚓ '}
                        {fence.type === 'restricted' && '⚠️ '}
                        {fence.name}
                      </span>
                      <Tag color={fence.status === 'active' ? 'green' : 'orange'}>
                        {fence.status === 'active' ? '启用' : '禁用'}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      形状：{fence.shape === 'polygon' ? '多边形' : fence.shape === 'circle' ? '圆形' : '矩形'}
                    </div>
                  </div>

                  {/* 围栏详细信息 */}
                  <div style={{ flex: 1, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#666', lineHeight: '20px' }}>
                      <div style={{ marginBottom: 4 }}>📍 面积：{fence.area}</div>
                      <div style={{ marginBottom: 4 }}>🕐 生效：{fence.effectTime}</div>
                      <div style={{
                        fontSize: 12,
                        color: '#999',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        📝 {fence.description}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮和时间 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#bbb' }}>
                        {fence.createTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => message.info(`查看围栏: ${fence.name}`)}
                        style={{ flex: 1 }}
                      >
                        查看
                      </Button>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditFence(fence)}
                        style={{ flex: 1 }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        type={fence.status === 'active' ? 'default' : 'primary'}
                        icon={fence.status === 'active' ? <StopOutlined /> : <PlayCircleOutlined />}
                        onClick={() => handleToggleFence(fence)}
                        style={{ flex: 1 }}
                      >
                        {fence.status === 'active' ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteFence(fence)}
                      />
                    </div>
                  </div>
                </div>
              </Col>
            ))}

            {fenceList.length === 0 && (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                  <BorderOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
                  <h3 style={{ color: '#999', marginBottom: 8 }}>暂无围栏数据</h3>
                  <p style={{ fontSize: 14, marginBottom: 16 }}>点击"新增围栏"开始创建您的第一个围栏</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateFence}>
                    新增围栏
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* 新增/编辑围栏模态框 - 重构版本 */}
        <Modal
          title="🏷️ 新增围栏 - 地图绘制与配置"
          open={showCreateModal}
          onCancel={() => {
            setShowCreateModal(false);
            createForm.resetFields();
            setDrawingMode(null);
            setAlertEnabled(true);
          }}
          footer={null}
          width={1200}
          destroyOnClose
          className={styles.createFenceModal}
          style={{
            top: 10
          }}
          bodyStyle={{
            padding: '24px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}
          maskClosable={false}
          centered={false}
          zIndex={1500}
        >
          <Alert
            message="围栏创建流程"
            description="第一步：选择绘制工具在地图上绘制围栏区域；第二步：填写围栏的基本信息和告警配置；第三步：保存围栏完成创建。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={24}>
            {/* 左侧：地图绘制区域 */}
            <Col span={14}>
              <Card
                title={
                  <Space>
                    <BorderOutlined />
                    地图围栏绘制区域
                    {drawingMode && (
                      <Tag color="blue">
                        当前模式：{drawingMode === 'polygon' ? '多边形' : drawingMode === 'circle' ? '圆形' : '矩形'}
                      </Tag>
                    )}
                  </Space>
                }
                size="small"
                extra={
                  <Space>
                    <Button
                      size="small"
                      type={drawingMode === 'polygon' ? 'primary' : 'default'}
                      icon={<AimOutlined />}
                      onClick={() => handleDrawingModeChange('polygon')}
                    >
                      多边形
                    </Button>
                    <Button
                      size="small"
                      type={drawingMode === 'circle' ? 'primary' : 'default'}
                      icon={<RadarChartOutlined />}
                      onClick={() => handleDrawingModeChange('circle')}
                    >
                      圆形
                    </Button>
                    <Button
                      size="small"
                      type={drawingMode === 'rectangle' ? 'primary' : 'default'}
                      icon={<BorderOutlined />}
                      onClick={() => handleDrawingModeChange('rectangle')}
                    >
                      矩形
                    </Button>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setDrawingMode(null);
                        message.info('已清除绘制模式');
                      }}
                    >
                      清除
                    </Button>
                  </Space>
                }
              >
                <div style={{
                  height: 450,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: drawingMode ? '2px solid #52c41a' : '2px dashed rgba(255,255,255,0.3)',
                  borderRadius: 8,
                  color: '#fff',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <BorderOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.8 }} />
                    <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                      电子地图围栏绘制
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>
                      {drawingMode ?
                        `当前模式：${drawingMode === 'polygon' ? '多边形绘制' : drawingMode === 'circle' ? '圆形绘制' : '矩形绘制'}` :
                        '请选择上方绘制工具开始绘制围栏'
                      }
                    </div>
                  </div>

                  {/* 绘制说明 */}
                  <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    background: 'rgba(0,0,0,0.4)',
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 12
                  }}>
                    <div style={{ marginBottom: 6, fontWeight: 'bold' }}>
                      🎯 绘制操作说明：
                    </div>
                    <div style={{ lineHeight: '18px' }}>
                      <div>🔸 多边形：点击地图添加顶点，双击完成绘制</div>
                      <div>🔸 圆形：点击确定圆心，拖拽设置半径大小</div>
                      <div>🔸 矩形：点击对角线两点完成矩形绘制</div>
                      <div>🔸 编辑：绘制完成后可拖拽顶点调整形状</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* 右侧：围栏配置表单 */}
            <Col span={10}>
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    围栏配置信息
                  </Space>
                }
                size="small"
              >
                <Form
                  form={createForm}
                  layout="vertical"
                  onFinish={handleSaveFence}
                  initialValues={{
                    type: 'forbidden',
                    effectTime: 'always',
                    alertLevel: 'medium',
                    alertDelay: 5,
                    enabled: true,
                    alertEnabled: true
                  }}
                >
                  {/* 基本信息区域 */}
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="围栏名称"
                        rules={[{ required: true, message: '请输入围栏名称' }]}
                      >
                        <Input placeholder="如：禁航区A" prefix="🏷️" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label="围栏类型"
                        rules={[{ required: true, message: '请选择围栏类型' }]}
                      >
                        <Select>
                          <Option value="forbidden">🚫 禁航区</Option>
                          <Option value="navigation">⚓ 通航区</Option>
                          <Option value="restricted">⚠️ 限制区</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* 配置信息区域 */}
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="alertEnabled"
                        label="围栏告警"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch
                          checkedChildren="开启"
                          unCheckedChildren="关闭"
                          onChange={(checked) => setAlertEnabled(checked)}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.alertEnabled !== currentValues.alertEnabled} noStyle>
                      {({ getFieldValue }) => {
                        return getFieldValue('alertEnabled') ? (
                          <>
                            <Col span={8}>
                              <Form.Item
                                name="effectTime"
                                label="生效时间"
                                rules={[
                                  { required: true, message: '请选择生效时间' }
                                ]}
                              >
                                <Select>
                                  <Option value="always">🕐 全天</Option>
                                  <Option value="06:00-22:00">🌅 白天</Option>
                                  <Option value="22:00-06:00">🌙 夜间</Option>
                                  <Option value="custom">⚙️ 自定义</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name="alertDelay"
                                label="告警延迟"
                                tooltip="船舶进入围栏后延迟多少秒触发告警"
                              >
                                <InputNumber
                                  min={0}
                                  max={60}
                                  step={1}
                                  style={{ width: '100%' }}
                                  addonAfter="秒"
                                  placeholder="0"
                                />
                              </Form.Item>
                            </Col>
                          </>
                        ) : null;
                      }}
                    </Form.Item>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="enabled"
                        label="启用状态"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="启用"
                          unCheckedChildren="禁用"
                          style={{ marginTop: 4 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="description"
                    label="围栏描述"
                  >
                    <TextArea
                      rows={4}
                      placeholder="请输入围栏的详细描述信息..."
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>

                  <Divider />

                  {/* 配置预览 */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 12, color: '#666' }}>📋 配置预览</h4>
                    <div style={{
                      background: '#f9f9f9',
                      padding: 12,
                      borderRadius: 6,
                      fontSize: 12,
                      lineHeight: '20px'
                    }}>
                      <div>🏷️ 围栏名称：{createForm.getFieldValue('name') || '未设置'}</div>
                      <div>🚫 围栏类型：{(() => {
                        const type = createForm.getFieldValue('type');
                        return type === 'forbidden' ? '禁航区' : type === 'navigation' ? '通航区' : '限制区';
                      })()}</div>
                      <div>🚨 围栏告警：{createForm.getFieldValue('alertEnabled') ? '开启' : '关闭'}</div>
                      {createForm.getFieldValue('alertEnabled') && (
                        <>
                          <div>🕐 生效时间：{(() => {
                            const effectTime = createForm.getFieldValue('effectTime');
                            return effectTime === 'always' ? '全天生效' :
                                   effectTime === '06:00-22:00' ? '白天生效' :
                                   effectTime === '22:00-06:00' ? '夜间生效' : '自定义时段';
                          })()}</div>
                          <div>⏱️ 告警延迟：{createForm.getFieldValue('alertDelay') || 0} 秒</div>
                        </>
                      )}
                      <div>🔄 启用状态：{createForm.getFieldValue('enabled') ? '启用' : '禁用'}</div>
                    </div>
                  </div>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Button onClick={() => {
                        setShowCreateModal(false);
                        createForm.resetFields();
                        setDrawingMode(null);
                        setAlertEnabled(true);
                      }}>
                        取消
                      </Button>
                      <Space>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            createForm.resetFields();
                            setAlertEnabled(true);
                            message.info('表单已重置');
                          }}
                        >
                          重置
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<PlusOutlined />}
                          disabled={!drawingMode}
                        >
                          保存围栏
                        </Button>
                      </Space>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  };

  // 特殊目标预警配置
  const renderSpecialTargetAlert = () => {
    const columns = [
      { 
        title: 'MMSI', 
        dataIndex: 'mmsi', 
        key: 'mmsi',
        render: (text) => <code style={{ background: '#f0f0f0', padding: '2px 4px' }}>{text}</code>
      },
      { 
        title: '船舶类型', 
        dataIndex: 'type', 
        key: 'type',
        render: (type) => (
          <Tag color={type === 'military' ? 'red' : 'orange'}>
            {type === 'military' ? '🚢 军用' : '⚠️ 高危'}
          </Tag>
        )
      },
      { 
        title: '备注信息', 
        dataIndex: 'remark', 
        key: 'remark',
        ellipsis: true
      },
      { 
        title: '录入时间', 
        dataIndex: 'createTime', 
        key: 'createTime',
        width: 150
      },
      { 
        title: '操作员', 
        dataIndex: 'operator', 
        key: 'operator',
        width: 100
      },
      { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        width: 80,
        render: (status, record) => (
          <Switch
            checked={status === 'enabled'}
            size="small"
            onChange={() => handleToggleSpecialTarget(record.id)}
          />
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Space size="small">
            <Button type="link" size="small" icon={<EditOutlined />}>
              编辑
            </Button>
            <Button 
              type="link" 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSpecialTarget(record.id)}
            >
              删除
            </Button>
          </Space>
        )
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>特殊目标预警配置</h3>
          <Space>
            <Button icon={<SearchOutlined />}>
              高级搜索
            </Button>
            <Button icon={<UploadOutlined />} onClick={handleBatchImportTargets}>
              批量导入
            </Button>
            <Button icon={<DownloadOutlined />}>
              导出数据
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="特殊目标列表" className={styles.configCard}>
              {/* 统计数据移到列表顶部 */}
              <div className={styles.quickStats} style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <div className={styles.miniStatItem}>
                      <div className={styles.miniStatValue}>
                        {specialTargets.filter(t => t.type === 'military').length}
                      </div>
                      <div className={styles.miniStatLabel}>军用船舶</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className={styles.miniStatItem}>
                      <div className={styles.miniStatValue}>
                        {specialTargets.filter(t => t.type === 'dangerous').length}
                      </div>
                      <div className={styles.miniStatLabel}>高危船舶</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowAddTargetModal(true)}
                    >
                      添加特殊目标
                    </Button>
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Row gutter={8}>
                  <Col flex="auto">
                    <Search
                      placeholder="搜索MMSI"
                      allowClear
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col>
                    <Select
                      placeholder="类型筛选"
                      style={{ width: 140 }}
                      allowClear
                    >
                      <Option value="military">军用</Option>
                      <Option value="dangerous">高危</Option>
                    </Select>
                  </Col>
                  <Col>
                    <Select
                      placeholder="状态筛选"
                      style={{ width: 100 }}
                      allowClear
                    >
                      <Option value="enabled">启用</Option>
                      <Option value="disabled">禁用</Option>
                    </Select>
                  </Col>
                </Row>
              </div>

              <Table
                columns={columns}
                dataSource={specialTargets}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                }}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* 添加特殊目标模态框 */}
        <Modal
          title="添加特殊目标"
          open={showAddTargetModal}
          onCancel={() => {
            setShowAddTargetModal(false);
            specialTargetForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={specialTargetForm}
            layout="vertical"
            onFinish={(values) => {
              handleAddSpecialTarget(values);
              setShowAddTargetModal(false);
            }}
          >
            <Form.Item
              name="mmsi"
              label="船舶MMSI"
              rules={[
                { required: true, message: '请输入MMSI' },
                { pattern: /^\d{9}$/, message: 'MMSI必须是9位数字' }
              ]}
            >
              <Input
                placeholder="输入9位MMSI码"
                maxLength={9}
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="目标类型"
              rules={[{ required: true, message: '请选择目标类型' }]}
            >
              <Select placeholder="选择类型">
                <Option value="military">🚢 军用船舶</Option>
                <Option value="dangerous">⚠️ 高危船舶</Option>
              </Select>
            </Form.Item>

            <Form.Item name="remark" label="备注信息">
              <TextArea
                rows={3}
                placeholder="输入备注信息（可选）"
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setShowAddTargetModal(false);
                  specialTargetForm.resetFields();
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  添加到预警库
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 批量操作模态框 */}
        <Modal
          title="批量导入特殊目标"
          visible={false}
          onCancel={() => {}}
          footer={[
            <Button key="cancel">取消</Button>,
            <Button key="download" icon={<DownloadOutlined />}>
              下载模板
            </Button>,
            <Button key="submit" type="primary" icon={<UploadOutlined />}>
              确认导入
            </Button>
          ]}
        >
          <div className={styles.uploadArea}>
            <Upload.Dragger
              name="file"
              multiple={false}
              accept=".xlsx,.xls,.csv"
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 Excel (.xlsx, .xls) 和 CSV 格式
              </p>
            </Upload.Dragger>
          </div>
        </Modal>
      </div>
    );
  };

  // VHF自动播发设置 - 优化版
  const renderVHFBroadcast = () => {
    // 展开状态管理 - 已移至组件顶层

    const alertTypes = [
      {
        key: 'collision',
        title: '碰撞风险预警',
        icon: '⚠️',
        color: '#ff4d4f',
        description: '船舶间距离过近触发碰撞风险时的播报设置'
      },
      {
        key: 'deviation',
        title: '船舶偏航预警',
        icon: '📍',
        color: '#fa8c16',
        description: '船舶偏离预设航线时的播报设置'
      },
      {
        key: 'fence',
        title: '进出围栏预警',
        icon: '🚧',
        color: '#722ed1',
        description: '船舶进入禁航区或离开指定区域时的播报设置'
      },
      {
        key: 'port',
        title: '进出港通告',
        icon: '🏭',
        color: '#1890ff',
        description: '船舶进出港口时的自动播报设置'
      },
      {
        key: 'specialTarget',
        title: '特殊目标预警',
        icon: '🎯',
        color: '#52c41a',
        description: '特殊监控目标（如军舰）出现时的播报设置'
      }
    ];

    // 切换单个告警类型的展开状态
    const toggleExpanded = (key) => {
      setExpandedAlerts(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    // 一键展开/收起所有
    const toggleAllExpanded = () => {
      const newState = !allExpanded;
      setAllExpanded(newState);
      const newExpandedState = {};
      alertTypes.forEach(type => {
        newExpandedState[type.key] = newState;
      });
      setExpandedAlerts(newExpandedState);
    };

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <div>
            <h3>📻 VHF自动播发设置</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              配置不同告警事件的VHF自动播报规则和模板
            </p>
          </div>
          <Space>
            <Button
              icon={allExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={toggleAllExpanded}
            >
              {allExpanded ? '收起全部' : '展开全部'}
            </Button>
            <Button icon={<SoundOutlined />} onClick={handleTestVHF}>
              测试播报
            </Button>
            <Button type="primary" icon={<SettingOutlined />} onClick={() => vhfForm.submit()}>
              保存全部配置
            </Button>
          </Space>
        </div>

        <Form
          form={vhfForm}
          layout="vertical"
          initialValues={vhfBroadcastConfig}
          onFinish={handleSaveVHFConfig}
        >
          {/* 全局VHF播发配置 */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card
                title="🔧 全局VHF播发配置"
                className={styles.configCard}
                extra={
                  <Form.Item name="globalEnable" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch
                      checkedChildren="启用VHF播报"
                      unCheckedChildren="禁用VHF播报"
                      size="default"
                    />
                  </Form.Item>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="defaultChannel" label="默认频道">
                      <Select style={{ width: '100%' }}>
                        <Option value="16">VHF 16频道</Option>
                        <Option value="67">VHF 67频道</Option>
                        <Option value="68">VHF 68频道</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="maxRetries" label="最大重试次数">
                      <InputNumber
                        min={0}
                        max={10}
                        style={{ width: '100%' }}
                        addonAfter="次"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="broadcastVolume" label="播报音量">
                      <InputNumber
                        min={1}
                        max={10}
                        style={{ width: '100%' }}
                        addonAfter="级"
                        placeholder="8"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="defaultDelay" label="默认延迟播报">
                      <InputNumber
                        min={0}
                        max={60}
                        style={{ width: '100%' }}
                        addonAfter="秒"
                        placeholder="0"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="defaultRepeatInterval" label="默认重播间隔">
                      <InputNumber
                        min={10}
                        max={300}
                        step={10}
                        style={{ width: '100%' }}
                        addonAfter="秒"
                        placeholder="30"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="defaultMaxRepeats" label="默认最大重播">
                      <InputNumber
                        min={1}
                        max={10}
                        style={{ width: '100%' }}
                        addonAfter="次"
                        placeholder="3"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* 告警类型播报配置列表 */}
          <Row gutter={[24, 16]}>
            <Col xs={24}>
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: 0, color: '#1890ff' }}>📋 告警类型播报配置</h4>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
                  点击展开配置各类告警事件的VHF播报规则
                </p>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 12]}>
            {alertTypes.map((alertType, index) => {
              const isExpanded = expandedAlerts[alertType.key];
              const isEnabled = vhfBroadcastConfig[alertType.key]?.enabled;

              return (
                <Col xs={24} key={alertType.key}>
                  <Card
                    className={styles.configCard}
                    style={{
                      marginBottom: index === alertTypes.length - 1 ? 0 : 12,
                      border: isExpanded ? `2px solid ${alertType.color}` : '1px solid #f0f0f0'
                    }}
                  >
                    {/* 收起状态的标题栏 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: isExpanded ? '0 0 16px 0' : '8px 0'
                      }}
                      onClick={() => toggleExpanded(alertType.key)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{alertType.icon}</span>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: alertType.color
                          }}>
                            {alertType.title}
                          </div>
                          {!isExpanded && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {alertType.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* 启用状态显示 */}
                        <Form.Item
                          name={[alertType.key, 'enabled']}
                          valuePropName="checked"
                          style={{ margin: 0 }}
                        >
                          <Switch
                            size="small"
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            onClick={(checked, e) => e.stopPropagation()}
                          />
                        </Form.Item>

                        {/* 展开/收起按钮 */}
                        <Button
                          type="text"
                          size="small"
                          icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                          style={{ color: alertType.color }}
                        >
                          {isExpanded ? '收起' : '展开'}
                        </Button>
                      </div>
                    </div>

                    {/* 展开状态的详细配置 */}
                    {isExpanded && (
                      <div>
                        <div style={{
                          color: '#666',
                          marginBottom: 16,
                          padding: '8px 12px',
                          backgroundColor: '#fafafa',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}>
                          📝 {alertType.description}
                        </div>

                        {/* 播报模板配置 */}
                        <Row gutter={[24, 16]} style={{ marginBottom: 16 }}>
                          <Col xs={24}>
                            <Form.Item
                              name={[alertType.key, 'template']}
                              label="播报模板"
                              tooltip="可使用变量：{船名} {MMSI} {时间} {位置} {速度} {航向}"
                              rules={[{ required: true, message: '请输入播报模板' }]}
                            >
                              <TextArea
                                rows={3}
                                placeholder={`输入${alertType.title}的播报模板...`}
                                showCount
                                maxLength={300}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* 特殊条件配置 */}



                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>


        </Form>
      </div>
    );
  };

  // CCTV联动规则 - 标签页版本
  const renderCCTVLinkage = () => {
    // 联动动作选项（移除聚光灯和警报器）
    const linkageOptions = [
      {
        label: '🎯 CCTV转向跟踪',
        value: 'track',
        desc: '自动控制云台转向目标位置并持续跟踪',
        responseTime: '0.5-1.0秒'
      },
      {
        label: '📸 自动抓拍',
        value: 'capture',
        desc: '立即抓拍当前画面并保存',
        responseTime: '0.2-0.5秒'
      },
      {
        label: '🎬 开始录像',
        value: 'record',
        desc: '开始录制视频并自动保存',
        responseTime: '0.3-0.8秒'
      },
      {
        label: '🔊 语音提醒',
        value: 'voice',
        desc: '播放预设语音警告信息',
        responseTime: '1.0-2.0秒'
      }
    ];

    // 告警类型配置（调整推荐动作）
    const alertTypes = [
      {
        key: 'collision',
        title: '碰撞风险预警',
        icon: '🚢',
        color: '#ff4d4f',
        description: '船舶间距离过近，存在碰撞风险时触发',
        recommendedActions: ['track', 'capture', 'record'],
        priority: 'critical'
      },
      {
        key: 'deviation',
        title: '船舶偏航预警',
        icon: '🛤️',
        color: '#fa8c16',
        description: '船舶偏离预设航线超过阈值时触发',
        recommendedActions: ['track', 'capture', 'voice'],
        priority: 'high'
      },
      {
        key: 'fence',
        title: '围栏闯入告警',
        icon: '🚫',
        color: '#722ed1',
        description: '船舶进入禁航区或限制区域时触发',
        recommendedActions: ['track', 'capture', 'record', 'voice'],
        priority: 'critical'
      },
      {
        key: 'specialTarget',
        title: '特殊目标预警',
        icon: '⚠️',
        color: '#1890ff',
        description: '检测到军舰等特殊目标时触发',
        recommendedActions: ['track', 'record'],
        priority: 'high'
      }
    ];

    // 渲染联动规则配置标签页
    const renderLinkageConfig = () => (
      <div>
        {/* 联动动作说明 */}
        <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title="📋 联动动作说明" size="small">
              <Row gutter={[16, 8]}>
                {linkageOptions.map(option => (
                  <Col xs={24} sm={12} md={6} key={option.value}>
                    <div style={{
                      padding: '12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      backgroundColor: '#fafafa',
                      height: '100%'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '8px' }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        {option.desc}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        响应时间: {option.responseTime}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* 告警类型联动配置 */}
        <Row gutter={[24, 24]}>
          {alertTypes.map(alertType => (
            <Col xs={24} lg={12} key={alertType.key}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{alertType.icon}</span>
                      <div>
                        <div style={{ color: alertType.color, fontWeight: '600' }}>
                          {alertType.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                          {alertType.description}
                        </div>
                      </div>
                    </div>
                    <Tag color={alertType.priority === 'critical' ? 'red' : 'orange'}>
                      {alertType.priority === 'critical' ? '关键告警' : '重要告警'}
                    </Tag>
                  </div>
                }
                className={styles.linkageCard}
                extra={
                  <Space>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => {
                        const recommended = alertType.recommendedActions;
                        handleSaveCCTVLinkage(alertType.key, recommended);
                        message.success(`已应用${alertType.title}推荐配置`);
                      }}
                    >
                      应用推荐
                    </Button>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => message.info(`测试${alertType.title}联动`)}
                    >
                      测试
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    💡 推荐联动动作：
                    {alertType.recommendedActions.map(action => {
                      const option = linkageOptions.find(opt => opt.value === action);
                      return option ? (
                        <Tag key={action} size="small" color="blue" style={{ margin: '2px' }}>
                          {option.label}
                        </Tag>
                      ) : null;
                    })}
                  </div>
                </div>

                <Checkbox.Group
                  value={cctvLinkageConfig[alertType.key] || []}
                  onChange={(values) => handleSaveCCTVLinkage(alertType.key, values)}
                  style={{ width: '100%' }}
                >
                  <Row gutter={[8, 8]}>
                    {linkageOptions.map(option => (
                      <Col xs={24} sm={12} key={option.value}>
                        <Checkbox
                          value={option.value}
                          style={{
                            padding: '8px',
                            border: cctvLinkageConfig[alertType.key]?.includes(option.value)
                              ? '1px solid #1890ff'
                              : '1px solid #f0f0f0',
                            borderRadius: '4px',
                            backgroundColor: cctvLinkageConfig[alertType.key]?.includes(option.value)
                              ? '#f6ffed'
                              : '#fafafa',
                            width: '100%',
                            margin: 0
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '500' }}>{option.label}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                              {option.responseTime}
                            </div>
                          </div>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>

                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#1890ff', fontWeight: '500' }}>
                    ✅ 已选择 {(cctvLinkageConfig[alertType.key] || []).length} 项联动动作
                  </div>
                  {(cctvLinkageConfig[alertType.key] || []).length > 0 && (
                    <div style={{ color: '#666', marginTop: '4px' }}>
                      预计响应时间: 0.2-2.0秒 | 成功率: 95%+
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );

    // 渲染系统状态监控标签页
    const renderSystemStatus = () => (
      <div>
        {/* 联动系统状态总览 */}
        <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title="📊 联动系统状态总览">
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>8</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>在线设备</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>156</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>今日联动次数</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>0.8s</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>平均响应时间</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>98.5%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>联动成功率</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* CCTV设备联动状态 */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card
              title="🎥 CCTV设备联动状态"
              extra={
                <Space>
                  <Button size="small" icon={<ReloadOutlined />}>刷新状态</Button>
                  <Button size="small" icon={<SettingOutlined />}>设备管理</Button>
                </Space>
              }
            >
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {[
                  {
                    name: '港口入口监控',
                    id: 'CAM001',
                    status: 'online',
                    linkage: '自动跟踪+抓拍',
                    location: '121.5°E, 31.2°N',
                    lastActive: '2分钟前',
                    todayCount: 23,
                    successRate: '100%'
                  },
                  {
                    name: '码头作业区监控',
                    id: 'CAM002',
                    status: 'online',
                    linkage: '自动录像+语音提醒',
                    location: '121.6°E, 31.3°N',
                    lastActive: '5分钟前',
                    todayCount: 18,
                    successRate: '95%'
                  },
                  {
                    name: '船舶停泊区监控',
                    id: 'CAM003',
                    status: 'offline',
                    linkage: '暂停',
                    location: '121.4°E, 31.1°N',
                    lastActive: '2小时前',
                    todayCount: 0,
                    successRate: '-'
                  },
                  {
                    name: '航道监控点A',
                    id: 'CAM004',
                    status: 'online',
                    linkage: '自动跟踪+语音',
                    location: '121.7°E, 31.4°N',
                    lastActive: '1分钟前',
                    todayCount: 31,
                    successRate: '97%'
                  },
                  {
                    name: '围栏监控点B',
                    id: 'CAM005',
                    status: 'online',
                    linkage: '全功能联动',
                    location: '121.3°E, 31.5°N',
                    lastActive: '刚刚',
                    todayCount: 12,
                    successRate: '100%'
                  }
                ].map(device => (
                  <div
                    key={device.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      backgroundColor: device.status === 'online' ? '#f6ffed' : '#fff2f0'
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={8}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {device.name}
                            <Tag
                              color={device.status === 'online' ? 'green' : 'red'}
                              size="small"
                              style={{ marginLeft: '8px' }}
                            >
                              {device.status === 'online' ? '在线' : '离线'}
                            </Tag>
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {device.id} | {device.location}
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                            <strong>联动配置:</strong> {device.linkage}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            最后活动: {device.lastActive}
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={4}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                            {device.todayCount}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666' }}>今日联动</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={4}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Button
                            size="small"
                            type="primary"
                            disabled={device.status !== 'online'}
                            onClick={() => message.info(`测试${device.name}联动`)}
                            block
                          >
                            测试联动
                          </Button>
                          <Button
                            size="small"
                            onClick={() => message.info(`配置${device.name}`)}
                            block
                          >
                            设备配置
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );

    // 自动跟踪配置标签页内容
    const renderAutoTrackingConfig = () => {
      console.log('🎯 自动跟踪配置标签页正在渲染'); // 添加调试信息
      
      return (
        <div style={{ padding: '20px' }}>
          <h2>🎯 自动跟踪配置</h2>
          <p>这是自动跟踪配置标签页的内容。</p>
          
          <Card title="AI识别参数" style={{ marginBottom: 20 }}>
            <p>目标类型识别范围配置</p>
            <Checkbox.Group
              options={[
                { label: '商船', value: 'commercial' },
                { label: '渔船', value: 'fishing' },
                { label: '军舰', value: 'military' }
              ]}
              defaultValue={['commercial', 'military']}
            />
          </Card>
          
          <Card title="跟踪优先级">
            <p>多目标冲突处理策略</p>
            <Radio.Group defaultValue="priority">
              <Radio value="priority">按优先级顺序</Radio>
              <Radio value="distance">按距离远近</Radio>
            </Radio.Group>
          </Card>
          
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <Button type="primary">保存配置</Button>
          </div>
        </div>
      );
    };

    // 标签页配置
    const tabItems = [
      {
        key: 'config',
        label: (
          <span>
            <SettingOutlined />
            联动规则配置
          </span>
        ),
        children: renderLinkageConfig()
      },
      {
        key: 'tracking',
        label: (
          <span>
            <ControlOutlined />
            自动跟踪配置
          </span>
        ),
        children: renderAutoTrackingConfig()
      },
      {
        key: 'status',
        label: (
          <span>
            <MonitorOutlined />
            系统状态监控
          </span>
        ),
        children: renderSystemStatus()
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <div>
            <h3>🎥 CCTV智能联动规则管理</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              配置不同告警事件触发的CCTV自动联动动作、自动跟踪参数以及系统运行状态监控
            </p>
          </div>
          <Space>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => message.info('查看联动效果统计报告')}
            >
              效果统计
            </Button>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => message.info('执行联动测试')}
            >
              测试联动
            </Button>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => message.success('联动规则配置已保存')}
            >
              保存全部配置
            </Button>
          </Space>
        </div>

        <Tabs
          defaultActiveKey="config"
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
          onChange={(key) => {
            console.log('切换到标签页:', key);
            // 这里可以添加标签页切换的逻辑
          }}
        />
      </div>
    );
  };

  // 告警通知设置 - 按告警类型配置通知方式
  const renderNotificationSettings = () => {
    // 通知方式配置
    const notificationTypes = [
      { key: 'popup', label: '系统弹窗', icon: <BellOutlined />, color: '#1890ff' },
      { key: 'sound', label: '声音提示', icon: <SoundOutlined />, color: '#52c41a' },
      { key: 'sms', label: '短信推送', icon: <MessageOutlined />, color: '#fa8c16' },
      { key: 'email', label: '邮件通知', icon: <MailOutlined />, color: '#722ed1' },
      { key: 'vhf', label: 'VHF自动播报', icon: <RadarChartOutlined />, color: '#eb2f96' },
      { key: 'other', label: '其他通知', icon: <MoreOutlined />, color: '#13c2c2' }
    ];

    // 处理通知方式切换
    const handleNotificationToggle = (alertType, notificationType, checked) => {
      setAlertConfig(prev => ({
        ...prev,
        [alertType]: {
          ...prev[alertType],
          notifications: {
            ...prev[alertType].notifications,
            [notificationType]: checked
          }
        }
      }));
    };

    // 保存配置
    const handleSaveConfig = () => {
      message.success('告警通知配置已保存');
      console.log('保存的配置:', alertConfig);
    };

    // 重置配置
    const handleResetConfig = () => {
      Modal.confirm({
        title: '确认重置',
        content: '确定要重置所有告警通知配置吗？此操作不可撤销。',
        onOk: () => {
          // 重置为默认配置
          setAlertConfig({
            collisionRisk: {
              name: '碰撞风险预警',
              description: '船舶间距离过近或可能发生碰撞时的预警',
              notifications: {
                popup: true,
                sound: true,
                sms: false,
                email: false,
                vhf: true,
                other: false
              }
            },
            shipDeviation: {
              name: '船舶偏航预警',
              description: '船舶偏离预设航线时的预警',
              notifications: {
                popup: true,
                sound: true,
                sms: true,
                email: false,
                vhf: true,
                other: false
              }
            },
            fenceIntrusion: {
              name: '围栏闯入告警',
              description: '船舶进入禁航区或离开指定区域时的告警',
              notifications: {
                popup: true,
                sound: true,
                sms: true,
                email: true,
                vhf: true,
                other: false
              }
            },
            targetTrigger: {
              name: '预警库目标触发',
              description: '预警库中的重点监控目标出现时的告警',
              notifications: {
                popup: true,
                sound: true,
                sms: true,
                email: true,
                vhf: false,
                other: true
              }
            },
            deviceOffline: {
              name: '设备离线告警',
              description: 'AIS、雷达、CCTV等设备离线时的告警',
              notifications: {
                popup: true,
                sound: false,
                sms: true,
                email: true,
                vhf: false,
                other: false
              }
            },
            abnormalBehavior: {
              name: '异常行为告警',
              description: '船舶出现异常航行行为时的告警',
              notifications: {
                popup: true,
                sound: true,
                sms: false,
                email: false,
                vhf: true,
                other: false
              }
            }
          });
          message.success('配置已重置为默认值');
        }
      });
    };

    return (
      <div className={styles.dashboardContent}>
        <div className={styles.tableHeader}>
          <h3>告警通知设置</h3>
          <Space>
            <Button onClick={handleResetConfig}>
              重置配置
            </Button>
            <Button type="primary" onClick={handleSaveConfig}>
              保存配置
            </Button>
          </Space>
        </div>

        <Card>
          <div style={{ marginBottom: 16 }}>
            <Alert
              message="配置说明"
              description="为不同类型的告警事件配置相应的通知方式。每种告警类型可以独立配置多种通知渠道，确保重要告警能够及时传达给相关人员。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          </div>

          <Row gutter={[24, 24]}>
            {Object.entries(alertConfig).map(([alertType, config]) => (
              <Col xs={24} lg={12} key={alertType}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <AlertOutlined style={{ color: '#fa8c16' }} />
                      {config.name}
                    </Space>
                  }
                  className={styles.alertConfigCard}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {config.description}
                    </Text>
                  </div>

                  <div className={styles.notificationGrid}>
                    {notificationTypes.map(type => (
                      <div key={type.key} className={styles.notificationItem}>
                        <div className={styles.notificationLabel}>
                          <Space>
                            <span style={{ color: type.color }}>
                              {type.icon}
                            </span>
                            <span style={{ fontSize: 12 }}>
                              {type.label}
                            </span>
                          </Space>
                        </div>
                        <Switch
                          size="small"
                          checked={config.notifications[type.key]}
                          onChange={(checked) =>
                            handleNotificationToggle(alertType, type.key, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    );
  };

  // 围栏绘制与配置
  const renderFenceDraw = () => {
    return (
      <div className={styles.dashboardContent}>
        <div className={styles.tableHeader}>
          <h3>围栏绘制与配置</h3>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              新建围栏
            </Button>
            <Button icon={<ReloadOutlined />}>
              刷新地图
            </Button>
          </Space>
        </div>

        <Card>
          <Alert
            message="功能说明"
            description="在电子地图上通过多边形、圆形、矩形工具绘制围栏，支持命名和参数配置。可设置围栏类型（禁航区/通航区）、生效时间等属性。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title="地图绘制区域" size="small">
                <div style={{
                  height: 500,
                  background: '#f0f2f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #d9d9d9',
                  borderRadius: 6
                }}>
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    <BorderOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>电子地图组件</div>
                    <div style={{ fontSize: 12 }}>支持围栏绘制、编辑、删除等操作</div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="绘制工具" size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<AimOutlined />}>多边形围栏</Button>
                  <Button block icon={<BorderOutlined />}>矩形围栏</Button>
                  <Button block icon={<RadarChartOutlined />}>圆形围栏</Button>
                  <Button block icon={<EditOutlined />}>编辑围栏</Button>
                  <Button block icon={<DeleteOutlined />} danger>删除围栏</Button>
                </Space>
              </Card>

              <Card title="围栏配置" size="small">
                <Form layout="vertical" size="small">
                  <Form.Item label="围栏名称">
                    <Input placeholder="如：禁航区A" />
                  </Form.Item>
                  <Form.Item label="围栏类型">
                    <Select placeholder="选择类型">
                      <Option value="forbidden">禁航区</Option>
                      <Option value="navigation">通航区</Option>
                      <Option value="monitoring">监控区</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="生效时间">
                    <Select placeholder="选择时间">
                      <Option value="always">全天生效</Option>
                      <Option value="custom">自定义时段</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" block>
                      保存围栏
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  // 围栏列表管理
  const renderFenceList = () => {
    const fenceData = [
      {
        key: '1',
        name: '禁航区A',
        type: '禁航区',
        status: '启用',
        createTime: '2024-01-15 10:30:00',
        effectTime: '全天',
        alertLevel: '高级',
        area: '2.5平方公里',
        description: '港口核心区域禁航'
      },
      {
        key: '2',
        name: '通航区B',
        type: '通航区',
        status: '启用',
        createTime: '2024-01-14 15:20:00',
        effectTime: '06:00-22:00',
        alertLevel: '中级',
        area: '5.2平方公里',
        description: '主要通航航道'
      },
      {
        key: '3',
        name: '监控区C',
        type: '监控区',
        status: '禁用',
        createTime: '2024-01-13 09:15:00',
        effectTime: '全天',
        alertLevel: '低级',
        area: '1.8平方公里',
        description: '临时监控区域'
      }
    ];

    const columns = [
      { title: '围栏名称', dataIndex: 'name', key: 'name', width: 120 },
      {
        title: '围栏类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (type) => (
          <Tag color={type === '禁航区' ? 'red' : type === '通航区' ? 'blue' : 'orange'}>
            {type}
          </Tag>
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status) => (
          <Tag color={status === '启用' ? 'green' : 'default'}>
            {status}
          </Tag>
        )
      },
      { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
      { title: '生效时间', dataIndex: 'effectTime', key: 'effectTime', width: 120 },

      { title: '围栏面积', dataIndex: 'area', key: 'area', width: 120 },
      { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
      {
        title: '操作',
        key: 'action',
        width: 150,
        render: (_, record) => (
          <Space size="small">
            <Button size="small" icon={<EyeOutlined />}>查看</Button>
            <Button size="small" icon={<EditOutlined />}>编辑</Button>
            <Button size="small" icon={<DeleteOutlined />} danger>删除</Button>
          </Space>
        )
      }
    ];

    return (
      <div className={styles.dashboardContent}>
        <div className={styles.tableHeader}>
          <h3>围栏列表管理</h3>
          <Space>
            <Search
              placeholder="搜索围栏名称"
              style={{ width: 200 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="围栏类型" style={{ width: 140 }}>
              <Option value="">全部</Option>
              <Option value="forbidden">禁航区</Option>
              <Option value="navigation">通航区</Option>
              <Option value="monitoring">监控区</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />}>
              新建围栏
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={fenceData}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            size="small"
          />
        </Card>
      </div>
    );
  };

  // 围栏监控状态
  const renderFenceMonitor = () => {
    const monitorData = [
      {
        key: '1',
        fenceName: '禁航区A',
        status: '正常',
        shipCount: 0,
        lastEvent: '无',
        lastEventTime: '-',
        alertCount: 0
      },
      {
        key: '2',
        fenceName: '通航区B',
        status: '正常',
        shipCount: 3,
        lastEvent: '船舶进入',
        lastEventTime: '2024-01-15 14:25:30',
        alertCount: 0
      },
      {
        key: '3',
        fenceName: '监控区C',
        status: '告警',
        shipCount: 1,
        lastEvent: '未授权进入',
        lastEventTime: '2024-01-15 14:30:15',
        alertCount: 2
      }
    ];

    return (
      <div className={styles.dashboardContent}>
        <div className={styles.tableHeader}>
          <h3>围栏监控状态</h3>
          <Space>
            <Button icon={<ReloadOutlined />}>刷新状态</Button>
            <Button type="primary" icon={<EyeOutlined />}>实时监控</Button>
          </Space>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>5</div>
                <div style={{ color: '#666' }}>总围栏数</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>4</div>
                <div style={{ color: '#666' }}>正常围栏</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>1</div>
                <div style={{ color: '#666' }}>告警围栏</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>4</div>
                <div style={{ color: '#666' }}>围栏内船舶</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={[
              { title: '围栏名称', dataIndex: 'fenceName', key: 'fenceName', width: 150 },
              {
                title: '监控状态',
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: (status) => (
                  <Badge
                    status={status === '正常' ? 'success' : 'error'}
                    text={status}
                  />
                )
              },
              { title: '围栏内船舶', dataIndex: 'shipCount', key: 'shipCount', width: 120 },
              { title: '最近事件', dataIndex: 'lastEvent', key: 'lastEvent', width: 150 },
              { title: '事件时间', dataIndex: 'lastEventTime', key: 'lastEventTime', width: 150 },
              {
                title: '今日告警次数',
                dataIndex: 'alertCount',
                key: 'alertCount',
                width: 120,
                render: (count) => (
                  <Tag color={count > 0 ? 'red' : 'green'}>
                    {count}
                  </Tag>
                )
              },
              {
                title: '操作',
                key: 'action',
                width: 150,
                render: (_, record) => (
                  <Space size="small">
                    <Button size="small" icon={<EyeOutlined />}>详情</Button>
                    <Button size="small" icon={<SettingOutlined />}>配置</Button>
                  </Space>
                )
              }
            ]}
            dataSource={monitorData}
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    );
  };

  // 围栏事件历史
  const renderFenceHistory = () => {
    const historyData = [
      {
        key: '1',
        eventTime: '2024-01-15 14:30:15',
        fenceName: '禁航区A',
        eventType: '未授权进入',
        shipInfo: '货船 (MMSI: 123456789)',
        position: '121.5°E, 31.2°N',
        duration: '5分钟',
        handleStatus: '已处理',
        operator: '张三',
        remark: '已通过VHF警告船舶离开'
      },
      {
        key: '2',
        eventTime: '2024-01-15 13:45:22',
        fenceName: '通航区B',
        eventType: '正常通过',
        shipInfo: '客船 (MMSI: 987654321)',
        position: '121.6°E, 31.3°N',
        duration: '15分钟',
        handleStatus: '无需处理',
        operator: '-',
        remark: '正常通航'
      },
      {
        key: '3',
        eventTime: '2024-01-15 12:20:08',
        fenceName: '监控区C',
        eventType: '长时间停留',
        shipInfo: '渔船 (MMSI: 555666777)',
        position: '121.4°E, 31.1°N',
        duration: '45分钟',
        handleStatus: '处理中',
        operator: '李四',
        remark: '正在联系船舶确认情况'
      }
    ];

    return (
      <div className={styles.dashboardContent}>
        <div className={styles.tableHeader}>
          <h3>围栏事件历史</h3>
          <Space>
            <DatePicker.RangePicker />
            <Select placeholder="围栏名称" style={{ width: 150 }}>
              <Option value="">全部围栏</Option>
              <Option value="fence1">禁航区A</Option>
              <Option value="fence2">通航区B</Option>
              <Option value="fence3">监控区C</Option>
            </Select>
            <Select placeholder="事件类型" style={{ width: 140 }}>
              <Option value="">全部类型</Option>
              <Option value="enter">进入</Option>
              <Option value="exit">离开</Option>
              <Option value="unauthorized">未授权进入</Option>
              <Option value="stay">长时间停留</Option>
            </Select>
            <Button icon={<SearchOutlined />}>查询</Button>
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={[
              { title: '事件时间', dataIndex: 'eventTime', key: 'eventTime', width: 150 },
              { title: '围栏名称', dataIndex: 'fenceName', key: 'fenceName', width: 120 },
              {
                title: '事件类型',
                dataIndex: 'eventType',
                key: 'eventType',
                width: 120,
                render: (type) => (
                  <Tag color={
                    type === '未授权进入' ? 'red' :
                    type === '长时间停留' ? 'orange' :
                    'green'
                  }>
                    {type}
                  </Tag>
                )
              },
              { title: '船舶信息', dataIndex: 'shipInfo', key: 'shipInfo', width: 180 },
              { title: '位置坐标', dataIndex: 'position', key: 'position', width: 150 },
              { title: '持续时间', dataIndex: 'duration', key: 'duration', width: 100 },
              {
                title: '处理状态',
                dataIndex: 'handleStatus',
                key: 'handleStatus',
                width: 100,
                render: (status) => (
                  <Tag color={
                    status === '已处理' ? 'green' :
                    status === '处理中' ? 'orange' :
                    'default'
                  }>
                    {status}
                  </Tag>
                )
              },
              { title: '操作员', dataIndex: 'operator', key: 'operator', width: 80 },
              { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
              {
                title: '操作',
                key: 'action',
                width: 100,
                render: (_, record) => (
                  <Space size="small">
                    <Button size="small" icon={<EyeOutlined />}>详情</Button>
                  </Space>
                )
              }
            ]}
            dataSource={historyData}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            size="small"
          />
        </Card>
      </div>
    );
  };

  // CCTV台账 - 监控操作记录
  const renderCCTVLinkageLedger = () => {
    const mockData = [
      {
        key: '1',
        id: 'CCTV001',
        eventTime: '2024-01-15 14:30:25',
        triggerShip: '船舶A (MMSI: 123456789)',
        shipType: '货船',
        eventType: '碰撞风险预警',
        position: '121.5°E, 31.2°N',
        cctvDevice: 'CAM001 - 港口入口监控',
        operationResult: '转向跟踪成功，抓拍完成',
        executionStatus: '成功',
        responseTime: '0.8秒',
        attachments: ['screenshot_001.jpg', 'record_001.mp4'],
        operator: '系统自动',
        remark: '目标船舶已安全通过'
      },
      {
        key: '2',
        id: 'CCTV002',
        eventTime: '2024-01-15 15:45:12',
        triggerShip: '船舶B (MMSI: 987654321)',
        shipType: '军舰',
        eventType: '特殊目标预警',
        position: '121.6°E, 31.3°N',
        cctvDevice: 'CAM002 - 码头作业区监控',
        operationResult: '转向跟踪成功，录像已保存',
        executionStatus: '成功',
        responseTime: '1.2秒',
        attachments: ['record_002.mp4', 'tracking_log.txt'],
        operator: '系统自动',
        remark: '特殊目标持续监控中'
      },
      {
        key: '3',
        id: 'CCTV003',
        eventTime: '2024-01-15 16:20:33',
        triggerShip: '船舶C (MMSI: 333444555)',
        shipType: '渔船',
        eventType: '进出围栏告警',
        position: '121.3°E, 31.4°N',
        cctvDevice: 'CAM003 - 围栏监控点',
        operationResult: '转向跟踪延迟，抓拍成功',
        executionStatus: '部分成功',
        responseTime: '1.5秒',
        attachments: ['fence_violation.jpg'],
        operator: '系统自动',
        remark: '云台转向响应延迟',
        failureReason: '云台转向延迟'
      }
    ];

    const columns = [
      {
        title: '事件ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        fixed: 'left'
      },
      {
        title: '事件时间',
        dataIndex: 'eventTime',
        key: 'eventTime',
        width: 160,
        sorter: (a, b) => new Date(a.eventTime) - new Date(b.eventTime)
      },
      {
        title: '触发船舶',
        dataIndex: 'triggerShip',
        key: 'triggerShip',
        width: 180,
        ellipsis: true
      },
      {
        title: '触发事件',
        dataIndex: 'eventType',
        key: 'eventType',
        width: 120,
        render: (text) => {
          const colorMap = {
            '碰撞风险预警': 'red',
            '特殊目标预警': 'purple',
            '进出围栏告警': 'orange',
            '船舶偏航预警': 'blue'
          };
          return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
        },
        filters: [
          { text: '碰撞风险预警', value: '碰撞风险预警' },
          { text: '特殊目标预警', value: '特殊目标预警' },
          { text: '进出围栏告警', value: '进出围栏告警' },
          { text: '船舶偏航预警', value: '船舶偏航预警' }
        ],
        onFilter: (value, record) => record.eventType === value
      },
      {
        title: 'CCTV设备',
        dataIndex: 'cctvDevice',
        key: 'cctvDevice',
        width: 180,
        ellipsis: true
      },
      {
        title: 'CCTV操作结果',
        dataIndex: 'operationResult',
        key: 'operationResult',
        width: 200,
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            {text}
          </Tooltip>
        )
      },
      {
        title: '处理状态',
        dataIndex: 'executionStatus',
        key: 'executionStatus',
        width: 100,
        render: (status, record) => {
          const statusConfig = {
            '成功': { color: 'green', icon: '✅' },
            '部分成功': { color: 'orange', icon: '⚠️' },
            '失败': { color: 'red', icon: '❌' }
          };
          const config = statusConfig[status] || { color: 'default', icon: '❓' };
          return (
            <div>
              <Tag color={config.color}>
                {config.icon} {status}
              </Tag>
              {record.failureReason && (
                <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '2px' }}>
                  {record.failureReason}
                </div>
              )}
            </div>
          );
        },
        filters: [
          { text: '成功', value: '成功' },
          { text: '部分成功', value: '部分成功' },
          { text: '失败', value: '失败' }
        ],
        onFilter: (value, record) => record.executionStatus === value
      },
      {
        title: '关联文件',
        dataIndex: 'attachments',
        key: 'attachments',
        width: 140,
        render: (attachments) => (
          <div>
            {attachments.map((file, index) => {
              const isImage = file.includes('.jpg') || file.includes('.png');
              const isVideo = file.includes('.mp4') || file.includes('.avi');

              if (isImage) {
                return (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, height: 'auto' }}
                      onClick={() => setImagePreview({
                        visible: true,
                        src: `/mock-images/${file}`, // 模拟图片路径
                        title: file
                      })}
                    >
                      📷 {file}
                    </Button>
                  </div>
                );
              } else if (isVideo) {
                return (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, height: 'auto' }}
                      onClick={() => setVideoPlayer({
                        visible: true,
                        src: `/mock-videos/${file}`, // 模拟视频路径
                        title: file
                      })}
                    >
                      🎥 {file}
                    </Button>
                  </div>
                );
              } else {
                return (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }}>
                      📄 {file}
                    </Button>
                  </div>
                );
              }
            })}
          </div>
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space direction="vertical" size="small">
            <Button size="small" icon={<EyeOutlined />}>
              查看详情
            </Button>
            <Button size="small" icon={<DownloadOutlined />}>
              下载文件
            </Button>
          </Space>
        )
      }
    ];

    // 计算统计数据
    const getStatistics = () => {
      const total = mockData.length;
      const successful = mockData.filter(item => item.executionStatus === '成功').length;
      const partialSuccess = mockData.filter(item => item.executionStatus === '部分成功').length;
      const failed = mockData.filter(item => item.executionStatus === '失败').length;
      const avgResponseTime = (mockData.reduce((sum, item) => sum + parseFloat(item.responseTime), 0) / total).toFixed(1);
      const successRate = ((successful / total) * 100).toFixed(1);

      return { total, successful, partialSuccess, failed, avgResponseTime, successRate };
    };

    const stats = getStatistics();

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <div>
            <h3>🎥 CCTV监控台账</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              CCTV监控操作记录，包含抓拍图片和录像文件
            </p>
          </div>
          <Space>
            <Search
              placeholder="搜索事件ID、船舶MMSI..."
              allowClear
              style={{ width: 300 }}
              onSearch={(value) => setLedgerSearchText(value)}
            />
            <Button icon={<ReloadOutlined />}>刷新数据</Button>
            <Button type="primary" icon={<DownloadOutlined />}>导出报告</Button>
          </Space>
        </div>

        {/* CCTV监控统计 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#1890ff' }}>{stats.total}</div>
                <div className={styles.statLabel}>总监控事件</div>
                <div style={{ fontSize: '12px', color: '#999' }}>CCTV操作记录</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#52c41a' }}>{stats.successful}</div>
                <div className={styles.statLabel}>操作成功</div>
                <div style={{ fontSize: '12px', color: '#999' }}>成功率 {stats.successRate}%</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#faad14' }}>{stats.partialSuccess}</div>
                <div className={styles.statLabel}>部分成功</div>
                <div style={{ fontSize: '12px', color: '#999' }}>需要检查设备</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#ff4d4f' }}>{stats.avgResponseTime}秒</div>
                <div className={styles.statLabel}>平均响应时间</div>
                <div style={{ fontSize: '12px', color: '#999' }}>设备响应速度</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 快速操作面板 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  size="large"
                  onClick={() => message.info('查看监控统计报告')}
                >
                  监控统计分析
                </Button>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  查看CCTV监控效果统计
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  icon={<SettingOutlined />}
                  size="large"
                  onClick={() => message.info('跳转到设备管理页面')}
                >
                  设备状态管理
                </Button>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  查看和管理CCTV设备
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  icon={<MonitorOutlined />}
                  size="large"
                  onClick={() => message.info('查看实时监控画面')}
                >
                  实时监控画面
                </Button>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  查看当前监控画面
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* CCTV监控记录表格 */}
        <Card title="📋 CCTV监控操作记录" extra={
          <Space>
            <Tag color="green">📷 抓拍记录</Tag>
            <Tag color="blue">🎥 录像文件</Tag>
            <Tag color="orange">📊 操作台账</Tag>
          </Space>
        }>
          <Table
            columns={columns}
            dataSource={mockData}
            loading={ledgerLoading}
            scroll={{ x: 1600 }}
            pagination={{
              total: mockData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条监控记录`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys, selectedRows) => {
                console.log('选中的监控记录:', selectedRowKeys, selectedRows);
              }
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <h4>📋 操作详情</h4>
                      <p><strong>操作人员:</strong> {record.operator}</p>
                      <p><strong>操作结果:</strong> {record.operationResult}</p>
                      <p><strong>响应时间:</strong> {record.responseTime}</p>
                      <p><strong>备注信息:</strong> {record.remark}</p>
                      {record.failureReason && (
                        <p><strong>失败原因:</strong> <span style={{ color: '#ff4d4f' }}>{record.failureReason}</span></p>
                      )}
                    </Col>
                    <Col span={12}>
                      <h4>📁 关联文件列表</h4>
                      {record.attachments.map((file, index) => {
                        const isImage = file.includes('.jpg') || file.includes('.png');
                        const isVideo = file.includes('.mp4') || file.includes('.avi');

                        if (isImage) {
                          return (
                            <div key={index} style={{ marginBottom: '8px' }}>
                              <Button
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() => setImagePreview({
                                  visible: true,
                                  src: `/mock-images/${file}`,
                                  title: file
                                })}
                              >
                                📷 {file} (点击查看)
                              </Button>
                            </div>
                          );
                        } else if (isVideo) {
                          return (
                            <div key={index} style={{ marginBottom: '8px' }}>
                              <Button
                                type="link"
                                icon={<PlayCircleOutlined />}
                                onClick={() => setVideoPlayer({
                                  visible: true,
                                  src: `/mock-videos/${file}`,
                                  title: file
                                })}
                              >
                                🎥 {file} (点击播放)
                              </Button>
                            </div>
                          );
                        } else {
                          return (
                            <div key={index} style={{ marginBottom: '8px' }}>
                              <Button
                                type="link"
                                icon={<DownloadOutlined />}
                                onClick={() => message.success(`下载文件: ${file}`)}
                              >
                                📄 {file}
                              </Button>
                            </div>
                          );
                        }
                      })}
                    </Col>
                  </Row>
                </div>
              ),
              rowExpandable: (record) => record.attachments && record.attachments.length > 0
            }}
          />
        </Card>

        {/* 图片预览模态框 */}
        <Modal
          title={`图片预览 - ${imagePreview.title}`}
          open={imagePreview.visible}
          onCancel={() => setImagePreview({ visible: false, src: '', title: '' })}
          footer={[
            <Button key="download" icon={<DownloadOutlined />}>
              下载图片
            </Button>,
            <Button key="close" onClick={() => setImagePreview({ visible: false, src: '', title: '' })}>
              关闭
            </Button>
          ]}
          width={800}
          centered
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {imagePreview.src ? (
              <img
                src={imagePreview.src}
                alt={imagePreview.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <div style={{ display: 'none', padding: '40px', color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
              <div>图片预览</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>
                模拟图片文件：{imagePreview.title}
              </div>
            </div>
          </div>
        </Modal>

        {/* 视频播放模态框 */}
        <Modal
          title={`视频播放 - ${videoPlayer.title}`}
          open={videoPlayer.visible}
          onCancel={() => setVideoPlayer({ visible: false, src: '', title: '' })}
          footer={[
            <Button key="download" icon={<DownloadOutlined />}>
              下载视频
            </Button>,
            <Button key="close" onClick={() => setVideoPlayer({ visible: false, src: '', title: '' })}>
              关闭
            </Button>
          ]}
          width={900}
          centered
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              height: '400px',
              background: '#000',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <div>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎥</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>视频播放器</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>
                  模拟视频文件：{videoPlayer.title}
                </div>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  size="large"
                  style={{ marginTop: 16 }}
                  onClick={() => message.info('开始播放视频')}
                >
                  播放视频
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  };



  // 进出围栏台账
  const renderFenceAccessLedger = () => {
    const mockData = [
      {
        key: '1',
        id: 'FENCE001',
        eventTime: '2024-01-15 16:20:15',
        ship: '船舶C (MMSI: 456789123)',
        shipType: '渔船',
        eventType: '进入围栏',
        fenceName: '禁航区A',
        position: '121.4°E, 31.1°N',
        status: '未处理',
        operator: '系统',
        remark: '船舶误入禁航区，需要立即处理',
        attachments: ['warning_call.mp3']
      },
      {
        key: '2',
        id: 'FENCE002',
        eventTime: '2024-01-15 17:35:42',
        ship: '船舶D (MMSI: 789123456)',
        shipType: '货船',
        eventType: '离开围栏',
        fenceName: '通航区B',
        position: '121.7°E, 31.4°N',
        status: '自由通行',
        operator: '系统',
        remark: '正常离港',
        attachments: []
      },
      {
        key: '3',
        id: 'FENCE003',
        eventTime: '2024-01-15 15:20:15',
        ship: '船舶E (MMSI: 111222333)',
        shipType: '客船',
        eventType: '进入围栏',
        fenceName: '禁航区A',
        position: '121.3°E, 31.0°N',
        status: '已处理',
        operator: '李四',
        remark: '已引导船舶绕行',
        attachments: ['guidance_record.mp4']
      },
      {
        key: '4',
        id: 'FENCE004',
        eventTime: '2024-01-15 14:15:30',
        ship: '船舶F (MMSI: 444555666)',
        shipType: '渔船',
        eventType: '离开围栏',
        fenceName: '通航区B',
        position: '121.6°E, 31.3°N',
        status: '自由通行',
        operator: '系统',
        remark: '正常通过',
        attachments: []
      },
      {
        key: '5',
        id: 'FENCE005',
        eventTime: '2024-01-15 13:20:15',
        ship: '船舶G (MMSI: 555666777)',
        shipType: '油轮',
        eventType: '进入围栏',
        fenceName: '通航区B',
        position: '121.2°E, 31.4°N',
        status: '自由通行',
        operator: '系统',
        remark: '正常进入通航区',
        attachments: []
      },
      {
        key: '6',
        id: 'FENCE006',
        eventTime: '2024-01-15 12:45:22',
        ship: '海鸥号 (MMSI: 987123456)',
        shipType: '货船',
        eventType: '进入围栏',
        fenceName: '锚地C',
        position: '121.8°E, 31.6°N',
        status: '自由通行',
        operator: '系统',
        remark: '正常进入锚地停泊',
        attachments: []
      },
      {
        key: '7',
        id: 'FENCE007',
        eventTime: '2024-01-15 11:30:18',
        ship: '远洋明珠 (MMSI: 654321789)',
        shipType: '军舰',
        eventType: '进入围栏',
        fenceName: '禁航区A',
        position: '121.5°E, 31.2°N',
        status: '未处理',
        operator: '系统',
        remark: '军舰进入禁航区，异常事件',
        attachments: ['military_alert.mp3', 'tracking_record.mp4']
      },
      {
        key: '8',
        id: 'FENCE008',
        eventTime: '2024-01-15 10:15:45',
        ship: '蓝鲸号 (MMSI: 147258369)',
        shipType: '客船',
        eventType: '离开围栏',
        fenceName: '港口区D',
        position: '121.9°E, 31.8°N',
        status: '已处理',
        operator: '王五',
        remark: '客船正常离港，已确认安全',
        attachments: ['departure_log.pdf']
      },
      {
        key: '9',
        id: 'FENCE009',
        eventTime: '2024-01-15 09:22:33',
        ship: '海星号 (MMSI: 369258147)',
        shipType: '渔船',
        eventType: '进入围栏',
        fenceName: '限制区E',
        position: '121.1°E, 30.9°N',
        status: '未处理',
        operator: '系统',
        remark: '渔船进入限制区域，需要确认作业许可',
        attachments: ['permission_check.pdf']
      },
      {
        key: '10',
        id: 'FENCE010',
        eventTime: '2024-01-15 08:40:12',
        ship: '金龙号 (MMSI: 258147369)',
        shipType: '油轮',
        eventType: '离开围栏',
        fenceName: '通航区B',
        position: '121.3°E, 31.5°N',
        status: '自由通行',
        operator: '系统',
        remark: '油轮正常通过航道',
        attachments: []
      },
      {
        key: '11',
        id: 'FENCE011',
        eventTime: '2024-01-15 07:55:28',
        ship: '白鹭号 (MMSI: 741852963)',
        shipType: '货船',
        eventType: '进入围栏',
        fenceName: '港口区D',
        position: '121.8°E, 31.7°N',
        status: '已处理',
        operator: '赵六',
        remark: '货船进港，已办理相关手续',
        attachments: ['port_entry.pdf', 'cargo_manifest.pdf']
      },
      {
        key: '12',
        id: 'FENCE012',
        eventTime: '2024-01-15 06:30:55',
        ship: '银河号 (MMSI: 852963741)',
        shipType: '客船',
        eventType: '进入围栏',
        fenceName: '通航区B',
        position: '121.6°E, 31.3°N',
        status: '自由通行',
        operator: '系统',
        remark: '客船正常进入通航区',
        attachments: []
      },
      {
        key: '13',
        id: 'FENCE013',
        eventTime: '2024-01-15 05:20:40',
        ship: '黄河号 (MMSI: 963741852)',
        shipType: '油轮',
        eventType: '进入围栏',
        fenceName: '禁航区A',
        position: '121.4°E, 31.1°N',
        status: '已处理',
        operator: '孙七',
        remark: '油轮误入禁航区，已引导绕行',
        attachments: ['course_correction.mp3', 'guidance_log.pdf']
      },
      {
        key: '14',
        id: 'FENCE014',
        eventTime: '2024-01-15 04:10:25',
        ship: '长江号 (MMSI: 159357486)',
        shipType: '渔船',
        eventType: '离开围栏',
        fenceName: '锚地C',
        position: '121.7°E, 31.5°N',
        status: '自由通行',
        operator: '系统',
        remark: '渔船结束停泊离开锚地',
        attachments: []
      },
      {
        key: '15',
        id: 'FENCE015',
        eventTime: '2024-01-15 03:45:18',
        ship: '珠江号 (MMSI: 486159357)',
        shipType: '货船',
        eventType: '进入围栏',
        fenceName: '限制区E',
        position: '121.2°E, 30.8°N',
        status: '未处理',
        operator: '系统',
        remark: '货船进入限制区，需要验证通行许可',
        attachments: ['permit_verification.pdf']
      },
      {
        key: '16',
        id: 'FENCE016',
        eventTime: '2024-01-15 02:30:50',
        ship: '东海号 (MMSI: 357486159)',
        shipType: '客船',
        eventType: '离开围栏',
        fenceName: '港口区D',
        position: '121.9°E, 31.9°N',
        status: '已处理',
        operator: '周八',
        remark: '客船完成载客离港',
        attachments: ['passenger_manifest.pdf', 'departure_clearance.pdf']
      },
      {
        key: '17',
        id: 'FENCE017',
        eventTime: '2024-01-15 01:15:32',
        ship: '南海号 (MMSI: 789456123)',
        shipType: '军舰',
        eventType: '离开围栏',
        fenceName: '军事区F',
        position: '121.0°E, 30.7°N',
        status: '已处理',
        operator: '军事值班员',
        remark: '军舰完成巡航任务离开军事区',
        attachments: ['military_clearance.pdf']
      },
      {
        key: '18',
        id: 'FENCE018',
        eventTime: '2024-01-15 00:50:15',
        ship: '北海号 (MMSI: 123789456)',
        shipType: '油轮',
        eventType: '进入围栏',
        fenceName: '通航区B',
        position: '121.5°E, 31.4°N',
        status: '自由通行',
        operator: '系统',
        remark: '油轮夜间正常通过航道',
        attachments: []
      }
    ];

    // 生成图表数据
    const generateChartData = () => {
      const data = [];
      const today = new Date();

      if (chartTimeDimension === 'day') {
        // 按天统计，显示最近7天
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          data.push({
            time: dateStr,
            进入围栏: Math.floor(Math.random() * 20) + 5,
            离开围栏: Math.floor(Math.random() * 25) + 8
          });
        }
      } else if (chartTimeDimension === 'week') {
        // 按周统计，显示最近4周
        for (let i = 3; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i * 7);
          const weekStr = `第${Math.ceil((date.getDate()) / 7)}周`;

          data.push({
            time: weekStr,
            进入围栏: Math.floor(Math.random() * 100) + 30,
            离开围栏: Math.floor(Math.random() * 120) + 40
          });
        }
      } else {
        // 按月统计，显示最近6个月
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          const monthStr = `${date.getMonth() + 1}月`;

          data.push({
            time: monthStr,
            进入围栏: Math.floor(Math.random() * 400) + 100,
            离开围栏: Math.floor(Math.random() * 500) + 150
          });
        }
      }

      return data;
    };

    const chartData = generateChartData();

    const columns = [
      {
        title: '事件ID',
        dataIndex: 'id',
        key: 'id',
        width: 100
      },
      {
        title: '事件时间',
        dataIndex: 'eventTime',
        key: 'eventTime',
        width: 160
      },
      {
        title: '船舶信息',
        dataIndex: 'ship',
        key: 'ship',
        width: 200
      },
      {
        title: '事件类型',
        dataIndex: 'eventType',
        key: 'eventType',
        width: 100,
        render: (text) => (
          <Tag color={text === '进入围栏' ? 'red' : 'green'}>{text}</Tag>
        )
      },
      {
        title: '围栏名称',
        dataIndex: 'fenceName',
        key: 'fenceName',
        width: 120
      },
      {
        title: '位置坐标',
        dataIndex: 'position',
        key: 'position',
        width: 140
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => {
          const getStatusConfig = (status) => {
            switch (status) {
              case '未处理':
                return { color: 'red', text: '未处理' };
              case '已处理':
                return { color: 'orange', text: '已处理' };
              case '自由通行':
                return { color: 'green', text: '自由通行' };
              default:
                return { color: 'blue', text: status };
            }
          };
          const config = getStatusConfig(status);
          return <Tag color={config.color}>{config.text}</Tag>;
        },
        filters: [
          { text: '未处理', value: '未处理' },
          { text: '已处理', value: '已处理' },
          { text: '自由通行', value: '自由通行' }
        ],
        onFilter: (value, record) => record.status === value
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setFenceDetailModal({ visible: true, record })}
            >
              详情
            </Button>
            <Button size="small" icon={<DownloadOutlined />}>导出</Button>
          </Space>
        )
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>进出围栏台账</h3>
          <Space wrap>
            <Search
              placeholder="搜索围栏名称、船舶MMSI..."
              allowClear
              style={{ width: 300 }}
              onSearch={(value) => setLedgerSearchText(value)}
            />
            <DatePicker.RangePicker
              placeholder={['开始时间', '结束时间']}
              style={{ width: 280 }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={fenceTimeRange}
              onChange={setFenceTimeRange}
            />
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button type="primary" icon={<DownloadOutlined />}>批量导出</Button>
          </Space>
        </div>



        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#1890ff' }}>{mockData.length}</div>
                <div className={styles.statLabel}>今日进出次数</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#ff4d4f' }}>{mockData.filter(item => item.status === '未处理').length}</div>
                <div className={styles.statLabel}>未处理事件</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#faad14' }}>{mockData.filter(item => item.status === '已处理').length}</div>
                <div className={styles.statLabel}>已处理事件</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#52c41a' }}>{mockData.filter(item => item.status === '自由通行').length}</div>
                <div className={styles.statLabel}>自由通行</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={mockData.map(record => {
              // 如果共享数据中有更新的记录，使用更新后的数据
              const updatedRecord = sharedFenceData.get(record.id);
              return updatedRecord || record;
            })}
            loading={ledgerLoading}
            scroll={{ x: 1000 }}
            pagination={{
              total: mockData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        </Card>

        {/* 统计图表区域 - 移到列表下方 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>📊 进出围栏事件趋势</h4>
                <Radio.Group
                  value={chartTimeDimension}
                  onChange={(e) => setChartTimeDimension(e.target.value)}
                  size="small"
                >
                  <Radio.Button value="day">按天</Radio.Button>
                  <Radio.Button value="week">按周</Radio.Button>
                  <Radio.Button value="month">按月</Radio.Button>
                </Radio.Group>
              </div>

              <div style={{ height: 280, padding: 16, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 6 }}>
                {/* 简单的图表可视化 */}
                <div style={{ display: 'flex', alignItems: 'end', height: 200, gap: 15, justifyContent: 'space-around' }}>
                  {chartData.map((item, index) => {
                    const maxValue = Math.max(...chartData.map(d => Math.max(d.进入围栏, d.离开围栏)));
                    const enterHeight = (item.进入围栏 / maxValue) * 160;
                    const leaveHeight = (item.离开围栏 / maxValue) * 160;

                    return (
                      <div key={index} style={{ textAlign: 'center', minWidth: 60 }}>
                        <div style={{ display: 'flex', alignItems: 'end', gap: 3, justifyContent: 'center', marginBottom: 8 }}>
                          <Tooltip title={`进入围栏: ${item.进入围栏}次`}>
                            <div style={{
                              width: 16,
                              height: enterHeight,
                              background: 'linear-gradient(to top, #ff4d4f, #ff7875)',
                              borderRadius: '2px 2px 0 0',
                              minHeight: 8
                            }} />
                          </Tooltip>
                          <Tooltip title={`离开围栏: ${item.离开围栏}次`}>
                            <div style={{
                              width: 16,
                              height: leaveHeight,
                              background: 'linear-gradient(to top, #52c41a, #73d13d)',
                              borderRadius: '2px 2px 0 0',
                              minHeight: 8
                            }} />
                          </Tooltip>
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>{item.time}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 图例 - 修复超出问题 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: '#ff4d4f', borderRadius: 2 }} />
                    <span style={{ fontSize: 11, color: '#666' }}>进入围栏</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: '#52c41a', borderRadius: 2 }} />
                    <span style={{ fontSize: 11, color: '#666' }}>离开围栏</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>🏛️ 不同围栏进出统计</h4>
                <Radio.Group
                  value={fenceChartTimeDimension}
                  onChange={(e) => setFenceChartTimeDimension(e.target.value)}
                  size="small"
                >
                  <Radio.Button value="day">按天</Radio.Button>
                  <Radio.Button value="week">按周</Radio.Button>
                  <Radio.Button value="month">按月</Radio.Button>
                </Radio.Group>
              </div>

              <div style={{ height: 280, padding: 16, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 6 }}>
                {/* 围栏统计图表 */}
                <div style={{ display: 'flex', alignItems: 'end', height: 200, gap: 12, justifyContent: 'space-around' }}>
                  {(() => {
                    // 根据时间维度生成不同的数据
                    const generateFenceData = () => {
                      const baseData = [
                        { name: '禁航区A', baseEnter: 45, baseLeave: 38 },
                        { name: '通航区B', baseEnter: 32, baseLeave: 41 },
                        { name: '锚地C', baseEnter: 18, baseLeave: 22 },
                        { name: '港口区D', baseEnter: 28, baseLeave: 25 }
                      ];

                      const multiplier = fenceChartTimeDimension === 'day' ? 1 :
                                       fenceChartTimeDimension === 'week' ? 7 : 30;

                      return baseData.map(fence => ({
                        ...fence,
                        enter: Math.floor(fence.baseEnter * multiplier * (0.8 + Math.random() * 0.4)),
                        leave: Math.floor(fence.baseLeave * multiplier * (0.8 + Math.random() * 0.4))
                      }));
                    };

                    const fenceData = generateFenceData();
                    const maxValue = Math.max(...fenceData.map(f => Math.max(f.enter, f.leave)));

                    return fenceData.map((fence, index) => {
                      const enterHeight = (fence.enter / maxValue) * 160;
                      const leaveHeight = (fence.leave / maxValue) * 160;

                      return (
                        <div key={index} style={{ textAlign: 'center', minWidth: 60 }}>
                          <div style={{ display: 'flex', alignItems: 'end', gap: 3, justifyContent: 'center', marginBottom: 8 }}>
                            <Tooltip title={`进入: ${fence.enter}次`}>
                              <div style={{
                                width: 16,
                                height: enterHeight,
                                background: 'linear-gradient(to top, #1890ff, #40a9ff)',
                                borderRadius: '2px 2px 0 0',
                                minHeight: 8
                              }} />
                            </Tooltip>
                            <Tooltip title={`离开: ${fence.leave}次`}>
                              <div style={{
                                width: 16,
                                height: leaveHeight,
                                background: 'linear-gradient(to top, #722ed1, #9254de)',
                                borderRadius: '2px 2px 0 0',
                                minHeight: 8
                              }} />
                            </Tooltip>
                          </div>
                          <div style={{ fontSize: 11, color: '#666', wordBreak: 'break-all' }}>{fence.name}</div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* 图例 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: '#1890ff', borderRadius: 2 }} />
                    <span style={{ fontSize: 11, color: '#666' }}>进入</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: '#722ed1', borderRadius: 2 }} />
                    <span style={{ fontSize: 11, color: '#666' }}>离开</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#999', marginLeft: 8 }}>
                    统计周期: {fenceChartTimeDimension === 'day' ? '今日' : fenceChartTimeDimension === 'week' ? '本周' : '本月'}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 进出围栏详情模态框 */}
        <Modal
          title="进出围栏事件详情"
          open={fenceDetailModal.visible}
          onCancel={() => setFenceDetailModal({ visible: false, record: null })}
          footer={[
            <Button key="export" icon={<DownloadOutlined />}>
              导出详情
            </Button>,
            <Button key="close" onClick={() => setFenceDetailModal({ visible: false, record: null })}>
              关闭
            </Button>
          ]}
          width={700}
        >
          {fenceDetailModal.record && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>📋 基本信息</h4>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                      <p><strong>事件ID：</strong>{fenceDetailModal.record.id}</p>
                      <p><strong>事件时间：</strong>{fenceDetailModal.record.eventTime}</p>
                      <p><strong>事件类型：</strong>
                        <Tag color={fenceDetailModal.record.eventType === '进入围栏' ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                          {fenceDetailModal.record.eventType}
                        </Tag>
                      </p>
                      <p><strong>围栏名称：</strong>{fenceDetailModal.record.fenceName}</p>
                      <p><strong>位置坐标：</strong>{fenceDetailModal.record.position}</p>
                      <p><strong>处理状态：</strong>
                        <Tag
                          color={
                            fenceDetailModal.record.status === '未处理' ? 'red' :
                            fenceDetailModal.record.status === '已处理' ? 'orange' : 'green'
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {fenceDetailModal.record.status}
                        </Tag>
                      </p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>🚢 船舶信息</h4>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                      <p><strong>船舶信息：</strong>{fenceDetailModal.record.ship}</p>
                      <p><strong>船舶类型：</strong>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {fenceDetailModal.record.shipType}
                        </Tag>
                      </p>
                      <p><strong>操作人员：</strong>{fenceDetailModal.record.operator}</p>
                      <p><strong>备注信息：</strong>{fenceDetailModal.record.remark}</p>
                    </div>
                  </div>
                </Col>
              </Row>

              {fenceDetailModal.record.attachments && fenceDetailModal.record.attachments.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4>📎 关联文件</h4>
                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                    {fenceDetailModal.record.attachments.map((file, index) => (
                      <div key={index} style={{ marginBottom: 8 }}>
                        <Button type="link" icon={<DownloadOutlined />}>
                          📄 {file}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 6, border: '1px solid #91d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <span><strong>处理建议：</strong></span>
                </div>
                <div style={{ marginTop: 8, color: '#666' }}>
                  {fenceDetailModal.record.eventType === '进入围栏'
                    ? '建议立即联系船舶，确认进入原因，必要时引导船舶离开禁航区域。'
                    : '船舶正常离开围栏区域，请继续监控船舶动态。'
                  }
                </div>
              </div>

              {/* 数据同步状态提示 */}
              {sharedFenceData.has(fenceDetailModal.record.id) && (
                <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <span><strong>同步状态：</strong></span>
                  </div>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    该事件的处理状态已与实时预警台账同步，最新状态：
                    <Tag
                      color={
                        sharedFenceData.get(fenceDetailModal.record.id).status === '未处理' ? 'red' :
                        sharedFenceData.get(fenceDetailModal.record.id).status === '已处理' ? 'orange' : 'green'
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {sharedFenceData.get(fenceDetailModal.record.id).status}
                    </Tag>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>


      </div>
    );
  };

  // 紧急联系处理函数
  const handleEmergencyContact = (record) => {
    setEmergencyContactModal({ visible: true, record });
    emergencyContactForm.setFieldsValue({
      contactType: 'vhf',
      priority: 'urgent',
      message: `船舶${record.ship1}，您当前存在碰撞风险，请立即调整航向！`
    });
  };

  // 执行紧急联系
  const handleExecuteEmergencyContact = async (values) => {
    setContactLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success(`已通过${values.contactType === 'vhf' ? 'VHF' : values.contactType === 'phone' ? '电话' : 'AIS'}联系船舶`);
      
      const contactLog = {
        time: new Date().toLocaleString(),
        type: values.contactType,
        message: values.message,
        operator: '当前用户',
        result: '联系成功'
      };
      
      console.log('紧急联系记录:', contactLog);
      
      setEmergencyContactModal({ visible: false, record: null });
      emergencyContactForm.resetFields();
      
    } catch (error) {
      message.error('联系失败，请重试');
    } finally {
      setContactLoading(false);
    }
  };

  // 航线指导处理函数
  const handleRouteGuidance = (record) => {
    setRouteGuidanceModal({ visible: true, record });
    routeGuidanceForm.setFieldsValue({
      guidanceType: 'course',
      recommendedCourse: '090',
      recommendedSpeed: '8',
      reason: '偏离预定航线，建议调整航向返回'
    });
  };

  // 执行航线指导
  const handleExecuteRouteGuidance = async (values) => {
    setGuidanceLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('航线指导信息已发送');
      
      const guidanceLog = {
        time: new Date().toLocaleString(),
        ship: routeGuidanceModal.record.ship1,
        guidanceType: values.guidanceType,
        recommendedCourse: values.recommendedCourse,
        recommendedSpeed: values.recommendedSpeed,
        operator: '当前用户'
      };
      
      console.log('航线指导记录:', guidanceLog);
      
      setRouteGuidanceModal({ visible: false, record: null });
      routeGuidanceForm.resetFields();
      
    } catch (error) {
      message.error('指导发送失败，请重试');
    } finally {
      setGuidanceLoading(false);
    }
  };

  // 持续监控处理函数
  const handleContinuousMonitor = (record) => {
    setContinuousMonitorModal({ visible: true, record });
    monitoringForm.setFieldsValue({
      monitorLevel: 'high',
      monitorDuration: '60',
      alertThreshold: 'movement',
      remarks: '特殊目标需要重点监控'
    });
  };

  // 执行持续监控
  const handleExecuteContinuousMonitor = async (values) => {
    setMonitorLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('已启动持续监控');
      
      const monitorLog = {
        time: new Date().toLocaleString(),
        target: continuousMonitorModal.record.ship1,
        level: values.monitorLevel,
        duration: values.monitorDuration,
        operator: '当前用户'
      };
      
      console.log('监控记录:', monitorLog);
      
      setContinuousMonitorModal({ visible: false, record: null });
      monitoringForm.resetFields();
      
    } catch (error) {
      message.error('监控启动失败，请重试');
    } finally {
      setMonitorLoading(false);
    }
  };

  // 显示实时预警台账详情
  const handleShowRealtimeDetail = (record) => {
    setRealtimeDetailModal({ visible: true, record });
  };

  // 处理预警记录
  const handleProcessAlert = (record) => {
    setAlertProcessModal({ visible: true, record });
    alertProcessForm.setFieldsValue({
      status: record.status === '未处理' ? '处理中' : record.status,
      remark: record.remark || ''
    });
  };

  // 执行处理操作
  const handleExecuteProcess = async (values) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('预警记录处理完成');
      
      const processLog = {
        time: new Date().toLocaleString(),
        status: values.status,
        operator: '当前用户',
        remark: values.remark
      };
      
      console.log('处理记录:', processLog);
      
      setAlertProcessModal({ visible: false, record: null });
      alertProcessForm.resetFields();
      
    } catch (error) {
      message.error('处理失败，请重试');
    }
  };

  // VHF播报台账处理函数
  const handleVhfAudioPlay = (record) => {
    console.log('VHF音频播放:', record);
    setAudioPlayer({
      visible: true,
      src: record.audioFile,
      title: `播放语音 - ${record.id}`,
      isPlaying: false
    });
  };

  const handleVhfDetailView = (record) => {
    console.log('VHF详情查看:', record);
    setVhfDetailModal({ visible: true, record });
  };



  const handleVhfDownload = (record) => {
    message.success(`开始下载音频文件: ${record.audioFile}`);
  };

  // VHF播报台账
  const renderVHFBroadcastLedger = () => {
    const mockData = [
      {
        key: '1',
        id: 'VHF001',
        broadcastTime: '2024-01-15 14:32:10',
        content: '船舶123456789，您已进入碰撞风险区域，请减速避让',
        triggerEvent: '碰撞风险预警',
        targetShip: '船舶A (MMSI: 123456789)',
        shipType: '商船',
        channel: 'VHF16',
        frequency: '156.800MHz',
        status: '播报成功',
        operator: '张三',
        remark: '船舶已回应并调整航向',
        audioFile: 'broadcast_001.mp3',
        audioDuration: '00:15',
        responseTime: '2分30秒',
        effectiveness: 'effective',
        processRemark: '船舶响应及时，已安全避让',
        position: '121.4737°E, 31.2304°N',
        attachments: ['response_record.mp3', 'tracking_screenshot.jpg'],
        autoGenerated: true,
        priority: 'high'
      },
      {
        key: '2',
        id: 'VHF002',
        broadcastTime: '2024-01-15 15:15:33',
        content: '欢迎进入XX港，当前通航密度高，请保持VHF16频道守听',
        triggerEvent: '进港通告',
        targetShip: '船舶B (MMSI: 987654321)',
        shipType: '集装箱船',
        channel: 'VHF16',
        frequency: '156.800MHz',
        status: '播报成功',
        operator: '系统',
        remark: '自动播报',
        audioFile: 'broadcast_002.mp3',
        audioDuration: '00:12',
        responseTime: '1分15秒',
        effectiveness: 'effective',
        processRemark: '船舶已确认收到，正常进港',
        position: '121.5370°E, 31.1304°N',
        attachments: ['port_entry_log.pdf'],
        autoGenerated: true,
        priority: 'medium'
      },
      {
        key: '3',
        id: 'VHF003',
        broadcastTime: '2024-01-15 16:45:18',
        content: '渔船888777666，您已偏离预定航线，请及时调整航向',
        triggerEvent: '船舶偏航预警',
        targetShip: '渔船海丰号 (MMSI: 888777666)',
        shipType: '渔船',
        channel: 'VHF16',
        frequency: '156.800MHz',
        status: '播报失败',
        operator: '李四',
        remark: '设备故障，通过其他方式联系',
        audioFile: 'broadcast_003.mp3',
        audioDuration: '00:18',
        responseTime: '无响应',
        effectiveness: 'ineffective',
        processRemark: '播报失败，已通过电话联系船舶，船舶已调整航向',
        position: '121.3737°E, 31.0304°N',
        attachments: ['phone_call_record.mp3', 'alternative_contact.pdf'],
        autoGenerated: true,
        priority: 'high'
      },
      {
        key: '4',
        id: 'VHF004',
        broadcastTime: '2024-01-15 17:20:45',
        content: '军舰001，您进入军事管制区域，请确认身份',
        triggerEvent: '特殊目标预警',
        targetShip: '军舰威远号 (MMSI: 999888777)',
        shipType: '军舰',
        channel: 'VHF16',
        frequency: '156.800MHz',
        status: '播报成功',
        operator: '王五',
        remark: '军舰已确认身份，正常通行',
        audioFile: 'broadcast_004.mp3',
        audioDuration: '00:08',
        responseTime: '30秒',
        effectiveness: 'effective',
        processRemark: '军舰身份确认，允许进入管制区域',
        position: '121.6737°E, 31.3304°N',
        attachments: ['military_clearance.pdf', 'identity_verification.jpg'],
        autoGenerated: false,
        priority: 'urgent'
      },
      {
        key: '5',
        id: 'VHF005',
        broadcastTime: '2024-01-15 18:10:22',
        content: '货轮中远海运，您已进入禁航区，请立即离开',
        triggerEvent: '进出围栏告警',
        targetShip: '货轮中远海运 (MMSI: 555444333)',
        shipType: '货轮',
        channel: 'VHF16',
        frequency: '156.800MHz',
        status: '待处理',
        operator: '系统',
        remark: '等待船舶响应',
        audioFile: 'broadcast_005.mp3',
        audioDuration: '00:10',
        responseTime: '等待中',
        effectiveness: 'pending',
        processRemark: '',
        position: '121.2737°E, 31.4304°N',
        attachments: [],
        autoGenerated: true,
        priority: 'urgent'
      }
    ];

    const columns = [
      {
        title: '播报ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        fixed: 'left'
      },
      {
        title: '播报时间',
        dataIndex: 'broadcastTime',
        key: 'broadcastTime',
        width: 160,
        sorter: (a, b) => new Date(a.broadcastTime) - new Date(b.broadcastTime)
      },
      {
        title: '播报内容',
        dataIndex: 'content',
        key: 'content',
        width: 300,
        ellipsis: {
          showTitle: false,
        },
        render: (content) => (
          <Tooltip placement="topLeft" title={content}>
            {content}
          </Tooltip>
        )
      },
      {
        title: '触发事件',
        dataIndex: 'triggerEvent',
        key: 'triggerEvent',
        width: 120,
        render: (text, record) => {
          const color = 
            text === '碰撞风险预警' ? 'red' :
            text === '船舶偏航预警' ? 'orange' :
            text === '进出围栏告警' ? 'purple' :
            text === '特殊目标预警' ? 'magenta' : 'blue';
          return <Tag color={color}>{text}</Tag>;
        },
        filters: [
          { text: '碰撞风险预警', value: '碰撞风险预警' },
          { text: '船舶偏航预警', value: '船舶偏航预警' },
          { text: '进出围栏告警', value: '进出围栏告警' },
          { text: '特殊目标预警', value: '特殊目标预警' },
          { text: '进港通告', value: '进港通告' }
        ],
        onFilter: (value, record) => record.triggerEvent === value
      },
      {
        title: '目标船舶',
        dataIndex: 'targetShip',
        key: 'targetShip',
        width: 180,
        ellipsis: {
          showTitle: false,
        },
        render: (ship, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{ship}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              <Tag size="small" color={
                record.shipType === '军舰' ? 'red' :
                record.shipType === '商船' ? 'blue' :
                record.shipType === '渔船' ? 'green' : 'default'
              }>
                {record.shipType}
              </Tag>
            </div>
          </div>
        )
      },
      {
        title: '频道/频率',
        dataIndex: 'channel',
        key: 'channel',
        width: 100,
        render: (channel, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{channel}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.frequency}</div>
          </div>
        )
      },
      {
        title: '播报状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status, record) => {
          const config = {
            '播报成功': { color: 'green', icon: '✅' },
            '播报失败': { color: 'red', icon: '❌' },
            '待处理': { color: 'orange', icon: '⏳' }
          };
          const statusConfig = config[status] || { color: 'default', icon: '❓' };
          return (
            <div>
              <Tag color={statusConfig.color}>{statusConfig.icon} {status}</Tag>
              {record.audioDuration && (
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                  🎵 {record.audioDuration}
                </div>
              )}
            </div>
          );
        },
        filters: [
          { text: '播报成功', value: '播报成功' },
          { text: '播报失败', value: '播报失败' },
          { text: '待处理', value: '待处理' }
        ],
        onFilter: (value, record) => record.status === value
      },
      {
        title: '响应情况',
        dataIndex: 'responseTime',
        key: 'responseTime',
        width: 100,
        render: (responseTime, record) => (
          <div>
            <div style={{ fontSize: 12 }}>⏱️ {responseTime}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {record.effectiveness === 'effective' ? '✅ 有效' :
               record.effectiveness === 'ineffective' ? '❌ 无效' :
               record.effectiveness === 'pending' ? '⏳ 待定' : '❓ 未知'}
            </div>
          </div>
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small" wrap>
            <Button 
              size="small" 
              icon={<SoundOutlined />}
              onClick={() => handleVhfAudioPlay(record)}
              disabled={!record.audioFile}
              type="primary"
            >
              回放
            </Button>
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleVhfDetailView(record)}
            >
              详情
            </Button>

            <Button 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => handleVhfDownload(record)}
            >
              下载
            </Button>
          </Space>
        )
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>📻 VHF播报台账 <Tag color="blue">数据分析</Tag></h3>
          <Space>
            <Search
              placeholder="搜索播报内容、船舶MMSI、操作员..."
              allowClear
              style={{ width: 300 }}
              onSearch={(value) => setLedgerSearchText(value)}
            />
            <Button icon={<ReloadOutlined />}>刷新数据</Button>
            <Button type="primary" icon={<DownloadOutlined />}>批量导出Excel</Button>
            <Button icon={<FilePdfOutlined />}>导出PDF</Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#1890ff' }}>
                  {mockData.length}
                </div>
                <div className={styles.statLabel}>总播报次数</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#52c41a' }}>
                  {mockData.filter(item => item.status === '播报成功').length}
                </div>
                <div className={styles.statLabel}>播报成功</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#ff4d4f' }}>
                  {mockData.filter(item => item.status === '播报失败').length}
                </div>
                <div className={styles.statLabel}>播报失败</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#faad14' }}>
                  {mockData.filter(item => item.status === '待处理').length}
                </div>
                <div className={styles.statLabel}>待处理</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#722ed1' }}>
                  {(mockData.filter(item => item.status === '播报成功').length / mockData.length * 100).toFixed(1)}%
                </div>
                <div className={styles.statLabel}>成功率</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#13c2c2' }}>
                  {mockData.filter(item => item.effectiveness === 'effective').length}
                </div>
                <div className={styles.statLabel}>有效响应</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#eb2f96' }}>
                  {mockData.filter(item => item.priority === 'urgent').length}
                </div>
                <div className={styles.statLabel}>紧急播报</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue} style={{ color: '#f5222d' }}>
                  {mockData.filter(item => item.autoGenerated).length}
                </div>
                <div className={styles.statLabel}>自动生成</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Card>
          <Table
            columns={columns}
            dataSource={mockData}
            loading={ledgerLoading}
            scroll={{ x: 1600 }}
            pagination={{
              total: mockData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys, selectedRows) => {
                console.log('VHF播报记录选中:', selectedRowKeys, selectedRows);
              }
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '12px 0' }}>
                  <Row gutter={[24, 12]}>
                    <Col span={8}>
                      <div>
                        <strong>位置坐标：</strong>
                        <span style={{ marginLeft: 8 }}>{record.position}</span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <strong>操作员：</strong>
                        <span style={{ marginLeft: 8 }}>{record.operator}</span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <strong>优先级：</strong>
                        <Tag color={
                          record.priority === 'urgent' ? 'red' :
                          record.priority === 'high' ? 'orange' :
                          record.priority === 'medium' ? 'blue' : 'default'
                        } style={{ marginLeft: 8 }}>
                          {record.priority === 'urgent' ? '🚨 紧急' :
                           record.priority === 'high' ? '⚠️ 高' :
                           record.priority === 'medium' ? '📋 中' : '📝 低'}
                        </Tag>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ marginTop: 8 }}>
                        <strong>备注信息：</strong>
                        <span style={{ marginLeft: 8, color: '#666' }}>{record.remark}</span>
                      </div>
                    </Col>
                    {record.processRemark && (
                      <Col span={24}>
                        <div style={{ marginTop: 8 }}>
                          <strong>处理备注：</strong>
                          <span style={{ marginLeft: 8, color: '#666' }}>{record.processRemark}</span>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              ),
              rowExpandable: (record) => true,
            }}
          />
        </Card>

        {/* 音频播放器模态框 */}
        <Modal
          title={
            <Space>
              <SoundOutlined />
              {audioPlayer.title}
            </Space>
          }
          open={audioPlayer.visible}
          onCancel={() => setAudioPlayer({ visible: false, src: '', title: '', isPlaying: false })}
          footer={[
            <Button key="close" onClick={() => setAudioPlayer({ visible: false, src: '', title: '', isPlaying: false })}>
              关闭
            </Button>
          ]}
          width={600}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 20, fontSize: 48 }}>
              {audioPlayer.isPlaying ? '🔊' : '🎵'}
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>音频文件：{audioPlayer.src}</p>
              <Progress percent={audioPlayer.isPlaying ? 65 : 0} showInfo={false} />
            </div>
            <Space>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
                  message.success('开始播放音频');
                }}
                disabled={audioPlayer.isPlaying}
              >
                播放
              </Button>
              <Button 
                icon={<PauseCircleOutlined />}
                onClick={() => {
                  setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
                  message.info('暂停播放');
                }}
                disabled={!audioPlayer.isPlaying}
              >
                暂停
              </Button>
              <Button 
                icon={<StopOutlined />}
                onClick={() => {
                  setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
                  message.info('停止播放');
                }}
              >
                停止
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => message.success(`下载音频文件: ${audioPlayer.src}`)}
              >
                下载
              </Button>
            </Space>
          </div>
        </Modal>

        {/* VHF播报详情模态框 */}
        <Modal
          title={
            <Space>
              <SoundOutlined />
              VHF播报详情 - {vhfDetailModal.record?.id}
            </Space>
          }
          open={vhfDetailModal.visible}
          onCancel={() => setVhfDetailModal({ visible: false, record: null })}
          footer={[
            <Button key="download" icon={<DownloadOutlined />}>
              导出详情
            </Button>,
            <Button key="close" onClick={() => setVhfDetailModal({ visible: false, record: null })}>
              关闭
            </Button>
          ]}
          width={900}
        >
          {vhfDetailModal.record && (
            <div>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Card size="small" title="📋 基本信息">
                    <div style={{ lineHeight: '1.8' }}>
                      <p><strong>播报ID：</strong>{vhfDetailModal.record.id}</p>
                      <p><strong>播报时间：</strong>{vhfDetailModal.record.broadcastTime}</p>
                      <p><strong>触发事件：</strong>
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          {vhfDetailModal.record.triggerEvent}
                        </Tag>
                      </p>
                      <p><strong>频道频率：</strong>{vhfDetailModal.record.channel} / {vhfDetailModal.record.frequency}</p>
                      <p><strong>播报状态：</strong>
                        <Tag color={
                          vhfDetailModal.record.status === '播报成功' ? 'green' :
                          vhfDetailModal.record.status === '播报失败' ? 'red' : 'orange'
                        } style={{ marginLeft: 8 }}>
                          {vhfDetailModal.record.status}
                        </Tag>
                      </p>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="🚢 船舶信息">
                    <div style={{ lineHeight: '1.8' }}>
                      <p><strong>目标船舶：</strong>{vhfDetailModal.record.targetShip}</p>
                      <p><strong>船舶类型：</strong>
                        <Tag color={
                          vhfDetailModal.record.shipType === '军舰' ? 'red' :
                          vhfDetailModal.record.shipType === '商船' ? 'blue' :
                          vhfDetailModal.record.shipType === '渔船' ? 'green' : 'default'
                        } style={{ marginLeft: 8 }}>
                          {vhfDetailModal.record.shipType}
                        </Tag>
                      </p>
                      <p><strong>船舶位置：</strong>{vhfDetailModal.record.position}</p>
                      <p><strong>操作员：</strong>{vhfDetailModal.record.operator}</p>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card size="small" title="📢 播报内容" style={{ marginTop: 16 }}>
                <div style={{ 
                  background: '#f6ffed', 
                  padding: 16, 
                  borderRadius: 6, 
                  border: '1px solid #b7eb8f',
                  fontSize: 14,
                  lineHeight: '1.6'
                }}>
                  "{vhfDetailModal.record.content}"
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    🎵 音频时长：{vhfDetailModal.record.audioDuration} | 📁 音频文件：{vhfDetailModal.record.audioFile}
                  </div>
                  <Button 
                    size="small" 
                    type="primary" 
                    icon={<SoundOutlined />}
                    onClick={() => handleVhfAudioPlay(vhfDetailModal.record)}
                  >
                    播放音频
                  </Button>
                </div>
              </Card>

              {vhfDetailModal.record.attachments && vhfDetailModal.record.attachments.length > 0 && (
                <Card size="small" title="📎 关联文件" style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {vhfDetailModal.record.attachments.map((file, index) => (
                      <Button
                        key={index}
                        type="dashed"
                        icon={<DownloadOutlined />}
                        onClick={() => message.success(`下载文件: ${file}`)}
                      >
                        📄 {file}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </Modal>




      </div>
    );
  };

  // 实时预警台账 - 立即警告处理函数
  const handleRealtimeImmediateWarning = (record) => {
    Modal.confirm({
      title: '确认立即警告',
      content: (
        <div>
          <p>即将对以下船舶发送立即警告信息：</p>
          <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, margin: '12px 0' }}>
            <p><strong>船舶信息：</strong>{record.ship1}</p>
            <p><strong>事件类型：</strong>{record.alertType}</p>
            <p><strong>围栏类型：</strong>{record.fenceType}</p>
            <p><strong>动作类型：</strong>{record.fenceAction}</p>
            <p><strong>位置坐标：</strong>{record.position}</p>
          </div>
          <p style={{ color: '#ff4d4f' }}>⚠️ 警告信息将通过VHF频道自动播发，请确认操作。</p>
        </div>
      ),
      okText: '立即发送警告',
      cancelText: '取消',
      okType: 'danger',
      width: 500,
      onOk: () => {
        return new Promise((resolve) => {
          // 模拟发送警告的过程
          message.loading('正在发送警告信息...', 1);
          setTimeout(() => {
            message.success(`已向${record.ship1}发送警告信息`);
            
            // 更新记录状态
            const updatedRecord = {
              ...record,
              status: '已处理',
              operator: '当前用户',
              remark: `${record.remark} | 已发送立即警告 (${new Date().toLocaleString()})`
            };
            
            // 这里可以更新状态或调用API
            console.log('警告已发送，记录已更新:', updatedRecord);
            resolve();
          }, 1000);
        });
      }
    });
  };

  // 实时预警台账 - 详情模态框状态
  const [realtimeDetailModal, setRealtimeDetailModal] = useState({ visible: false, record: null });

  // 实时预警台账 - 标签页结构
  const renderRealtimeAlertLedger = () => {
    // 模拟数据 - 按告警类型分类
    const mockDataByType = {
      collision: [
        {
          key: 'COL001',
          id: 'ALERT001',
          alertTime: '2024-01-15 14:25:18',
          alertType: '碰撞风险预警',
          level: '高风险',
          ship1: '船舶A (MMSI: 123456789)',
          ship2: '船舶E (MMSI: 555666777)',
          meetDistance: '0.3海里',
          meetTime: '8分钟',
          position: '121.5°E, 31.2°N',
          status: '已处理',
          operator: '张三',
          remark: '双方船舶已调整航向，风险解除',
          attachments: ['alert_001.jpg', 'communication_001.mp3']
        },
        {
          key: 'COL002',
          id: 'ALERT003',
          alertTime: '2024-01-15 16:10:45',
          alertType: '碰撞风险预警',
          level: '中风险',
          ship1: '船舶C (MMSI: 333444555)',
          ship2: '船舶D (MMSI: 666777888)',
          meetDistance: '0.8海里',
          meetTime: '15分钟',
          position: '121.4°E, 31.1°N',
          status: '处理中',
          operator: '王五',
          remark: '正在联系双方船舶调整航向',
          attachments: ['alert_003.jpg']
        }
      ],
      deviation: [
        {
          key: 'DEV001',
          id: 'ALERT004',
          alertTime: '2024-01-15 13:20:15',
          alertType: '船舶偏航预警',
          level: '中风险',
          ship1: '货轮海洋之星 (MMSI: 111222333)',
          ship2: '-',
          meetDistance: '-',
          meetTime: '-',
          position: '121.3°E, 31.4°N',
          deviationDistance: '1.2海里',
          deviationTime: '25分钟',
          status: '已处理',
          operator: '赵六',
          remark: '船舶已收到通知并调整航向',
          attachments: ['deviation_001.jpg', 'route_correction.pdf']
        },
        {
          key: 'DEV002',
          id: 'ALERT016',
          alertTime: '2024-01-15 16:45:22',
          alertType: '船舶偏航预警',
          level: '高风险',
          ship1: '油轮中石化888 (MMSI: 789456123)',
          ship2: '-',
          meetDistance: '-',
          meetTime: '-',
          position: '121.7°E, 31.0°N',
          deviationDistance: '2.1海里',
          deviationTime: '45分钟',
          status: '监控中',
          operator: '孙七',
          remark: '大型油轮严重偏航，正在紧急联系',
          attachments: ['deviation_002.mp4', 'emergency_contact.mp3']
        },
        {
          key: 'DEV003',
          id: 'ALERT017',
          alertTime: '2024-01-15 10:15:33',
          alertType: '船舶偏航预警',
          level: '低风险',
          ship1: '渔船勤劳号 (MMSI: 654321987)',
          ship2: '-',
          meetDistance: '-',
          meetTime: '-',
          position: '121.1°E, 31.6°N',
          deviationDistance: '0.5海里',
          deviationTime: '12分钟',
          status: '未处理',
          operator: '系统',
          remark: '轻微偏航，待处理',
          attachments: []
        }
      ],
      fence: [
        {
          key: 'FEN001',
          id: 'ALERT005',
          alertTime: '2024-01-15 12:45:30',
          alertType: '进出围栏告警',
          ship1: '船舶H (MMSI: 444555666)',
          position: '121.2°E, 31.5°N',
          fenceType: '禁航区',
          fenceAction: '闯入',
          status: '已处理',
          operator: '孙七',
          remark: '船舶已被引导离开禁航区',
          attachments: ['fence_violation.mp4', 'guidance_record.mp3']
        },
        {
          key: 'FEN002',
          id: 'ALERT006',
          alertTime: '2024-01-15 14:20:15',
          alertType: '进出围栏告警',
          ship1: '货轮东方明珠 (MMSI: 123456789)',
          position: '121.5°E, 31.2°N',
          fenceType: '禁航区',
          fenceAction: '闯入',
          status: '未处理',
          operator: '系统',
          remark: '船舶误入禁航区，需要立即处理',
          attachments: ['auto_capture_001.jpg']
        },
        {
          key: 'FEN003',
          id: 'ALERT007',
          alertTime: '2024-01-15 15:35:42',
          alertType: '进出围栏告警',
          ship1: '渔船海丰号 (MMSI: 987654321)',
          position: '121.7°E, 31.4°N',
          fenceType: '通航区',
          fenceAction: '离开',
          status: '自由通行',
          operator: '系统',
          remark: '正常离开通航区',
          attachments: []
        },
        {
          key: 'FEN004',
          id: 'ALERT008',
          alertTime: '2024-01-15 16:10:25',
          alertType: '进出围栏告警',
          ship1: '客轮海上明珠 (MMSI: 111222333)',
          position: '121.3°E, 31.0°N',
          fenceType: '限制区',
          fenceAction: '闯入',
          status: '未处理',
          operator: '系统',
          remark: '客轮进入限制区域，需要处理',
          attachments: ['contact_log.mp3']
        },
        {
          key: 'FEN005',
          id: 'ALERT009',
          alertTime: '2024-01-15 17:25:18',
          alertType: '进出围栏告警',
          ship1: '油轮中海油888 (MMSI: 555666777)',
          position: '121.8°E, 31.6°N',
          fenceType: '通航区',
          fenceAction: '进入',
          status: '自由通行',
          operator: '系统',
          remark: '正常进入通航区',
          attachments: []
        },
        {
          key: 'FEN006',
          id: 'ALERT010',
          alertTime: '2024-01-15 18:40:33',
          alertType: '进出围栏告警',
          ship1: '集装箱船中远海运 (MMSI: 888999000)',
          position: '121.1°E, 31.3°N',
          fenceType: '禁航区',
          fenceAction: '闯入',
          status: '未处理',
          operator: '系统',
          remark: '大型集装箱船误入禁航区，紧急处理',
          attachments: ['emergency_alert.mp4', 'radar_track.jpg']
        },
        {
          key: 'FEN007',
          id: 'ALERT011',
          alertTime: '2024-01-15 20:15:45',
          alertType: '进出围栏告警',
          ship1: '军舰海军001 (MMSI: 999888777)',
          position: '121.9°E, 31.7°N',
          fenceType: '军事管制区',
          fenceAction: '进入',
          status: '已处理',
          operator: '赵六',
          remark: '军舰正常进入军事管制区',
          attachments: ['military_clearance.pdf']
        },
        {
          key: 'FEN008',
          id: 'ALERT012',
          alertTime: '2024-01-15 22:30:12',
          alertType: '进出围栏告警',
          ship1: '科考船海洋探索者 (MMSI: 777666555)',
          position: '121.4°E, 31.8°N',
          fenceType: '限制区',
          fenceAction: '离开',
          status: '已处理',
          operator: '孙七',
          remark: '科考任务完成，正常离开限制区',
          attachments: ['mission_report.pdf', 'exit_confirmation.jpg']
        },
        {
          key: 'FEN009',
          id: 'ALERT013',
          alertTime: '2024-01-15 09:15:28',
          alertType: '进出围栏告警',
          ship1: '货船海星号 (MMSI: 369258147)',
          position: '121.1°E, 30.9°N',
          fenceType: '限制区',
          fenceAction: '闯入',
          status: '未处理',
          operator: '系统',
          remark: '货船进入限制区域，需要确认作业许可',
          attachments: ['permission_check.pdf']
        },
        {
          key: 'FEN010',
          id: 'ALERT014',
          alertTime: '2024-01-15 11:30:18',
          alertType: '进出围栏告警',
          ship1: '远洋明珠 (MMSI: 654321789)',
          position: '121.5°E, 31.2°N',
          fenceType: '禁航区',
          fenceAction: '闯入',
          status: '未处理',
          operator: '系统',
          remark: '军舰进入禁航区，异常事件',
          attachments: ['military_alert.mp3', 'tracking_record.mp4']
        },
        {
          key: 'FEN011',
          id: 'ALERT015',
          alertTime: '2024-01-15 07:45:55',
          alertType: '进出围栏告警',
          ship1: '客船蓝鲸号 (MMSI: 147258369)',
          position: '121.9°E, 31.8°N',
          fenceType: '港口区',
          fenceAction: '离开',
          status: '已处理',
          operator: '王五',
          remark: '客船正常离港，已确认安全',
          attachments: ['departure_log.pdf']
        },
        {
          key: 'FEN012',
          id: 'ALERT016',
          alertTime: '2024-01-15 13:22:40',
          alertType: '进出围栏告警',
          ship1: '渔船珠江号 (MMSI: 486159357)',
          position: '121.2°E, 30.8°N',
          fenceType: '限制区',
          fenceAction: '闯入',
          status: '未处理',
          operator: '系统',
          remark: '渔船进入限制区，需要验证通行许可',
          attachments: ['permit_verification.pdf']
        }
      ],
      specialTarget: [
        {
          key: 'SPE001',
          id: 'ALERT002',
          alertTime: '2024-01-15 15:50:33',
          alertType: '特殊目标预警',
          level: '高风险',
          ship1: '军舰威远号 (MMSI: 888999000)',
          ship2: '-',
          meetDistance: '-',
          meetTime: '-',
          position: '121.6°E, 31.3°N',
          targetType: '军用船舶',
          status: '监控中',
          operator: '李四',
          remark: '军舰进入监控区域，持续跟踪',
          attachments: ['tracking_002.mp4', 'military_id.jpg']
        },
        {
          key: 'SPE002',
          id: 'ALERT014',
          alertTime: '2024-01-15 11:20:15',
          alertType: '特殊目标预警',
          level: '中风险',
          ship1: '可疑船舶X (MMSI: 412789456)',
          ship2: '-',
          meetDistance: '-',
          meetTime: '-',
          position: '121.8°E, 31.1°N',
          targetType: '高危船舶',
          status: '处理中',
          operator: '王五',
          remark: '多次出现在敏感区域，需重点关注',
          attachments: ['suspicious_activity.mp4', 'behavior_log.pdf']
        },
        {
          key: 'SPE003',
          id: 'ALERT015',
          alertTime: '2024-01-15 18:35:45',
          alertType: '特殊目标预警',
          level: '低风险',
          ship1: '科考船海洋科学号 (MMSI: 555444333)',
          ship2: '-',
          meetDistance: '-',
          meetTime: '-',
          position: '121.2°E, 31.7°N',
          targetType: '科研船舶',
          status: '已处理',
          operator: '赵六',
          remark: '科考任务正常，已登记备案',
          attachments: ['research_permit.pdf']
        }
      ]
    };

    // 通用列配置（移除风险等级）
    const getCommonColumns = () => [
      {
        title: '预警ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        fixed: 'left'
      },
      {
        title: '预警时间',
        dataIndex: 'alertTime',
        key: 'alertTime',
        width: 160,
        sorter: (a, b) => new Date(a.alertTime) - new Date(b.alertTime)
      },
      {
        title: '涉及船舶',
        dataIndex: 'ship1',
        key: 'ship1',
        width: 180,
        ellipsis: true
      },
      {
        title: '位置坐标',
        dataIndex: 'position',
        key: 'position',
        width: 140
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => {
          const color = status === '已处理' ? 'orange' : status === '自由通行' ? 'green' : 'red';
          return <Tag color={color}>{status}</Tag>;
        },
        filters: [
          { text: '未处理', value: '未处理' },
          { text: '已处理', value: '已处理' },
          { text: '自由通行', value: '自由通行' }
        ],
        onFilter: (value, record) => record.status === value
      },
      {
        title: '处理人员',
        dataIndex: 'operator',
        key: 'operator',
        width: 100
      }
    ];

    // 碰撞风险预警专用列
    const getCollisionColumns = () => [
      ...getCommonColumns(),
      {
        title: '目标船舶',
        dataIndex: 'ship2',
        key: 'ship2',
        width: 180,
        ellipsis: true
      },
      {
        title: '会遇距离',
        dataIndex: 'meetDistance',
        key: 'meetDistance',
        width: 100,
        sorter: (a, b) => parseFloat(a.meetDistance) - parseFloat(b.meetDistance)
      },
      {
        title: '会遇时间',
        dataIndex: 'meetTime',
        key: 'meetTime',
        width: 100,
        sorter: (a, b) => parseFloat(a.meetTime) - parseFloat(b.meetTime)
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button 
              size="small" 
              type="primary" 
              icon={<PhoneOutlined />}
              onClick={() => handleEmergencyContact(record)}
            >
              紧急联系
            </Button>
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleShowRealtimeDetail(record)}
            >
              详情
            </Button>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleProcessAlert(record)}
            >
              处理
            </Button>
          </Space>
        )
      }
    ];

    // 船舶偏航预警专用列
    const getDeviationColumns = () => [
      ...getCommonColumns(),
      {
        title: '偏航距离',
        dataIndex: 'deviationDistance',
        key: 'deviationDistance',
        width: 100,
        sorter: (a, b) => parseFloat(a.deviationDistance) - parseFloat(b.deviationDistance)
      },
      {
        title: '偏航时长',
        dataIndex: 'deviationTime',
        key: 'deviationTime',
        width: 100
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button 
              size="small" 
              type="primary" 
              icon={<CompassOutlined />}
              onClick={() => handleRouteGuidance(record)}
            >
              航线指导
            </Button>
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleShowRealtimeDetail(record)}
            >
              详情
            </Button>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleProcessAlert(record)}
            >
              处理
            </Button>
          </Space>
        )
      }
    ];

    // 进出围栏告警专用列
    const getFenceColumns = () => [
      ...getCommonColumns(),
      {
        title: '围栏类型',
        dataIndex: 'fenceType',
        key: 'fenceType',
        width: 100,
        render: (type) => {
          const color = type === '禁航区' ? 'red' : type === '限制区' ? 'orange' : 'blue';
          return <Tag color={color}>{type}</Tag>;
        }
      },
      {
        title: '动作类型',
        dataIndex: 'fenceAction',
        key: 'fenceAction',
        width: 100,
        render: (action) => {
          const color = action === '闯入' ? 'red' : 'green';
          return <Tag color={color}>{action}</Tag>;
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 220,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            {(record.status === '未处理' && record.fenceAction === '闯入') && (
              <Button 
                size="small" 
                type="primary" 
                danger
                icon={<SoundOutlined />}
                onClick={() => handleRealtimeImmediateWarning(record)}
              >
                立即警告
              </Button>
            )}
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => setRealtimeDetailModal({ visible: true, record })}
            >
              详情
            </Button>
            {(record.status === '未处理') && (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => setAlertProcessModal({ visible: true, record })}
              >
                处理
              </Button>
            )}
          </Space>
        )
      }
    ];

    // 特殊目标预警专用列
    const getSpecialColumns = () => [
      ...getCommonColumns(),
      {
        title: '目标类型',
        dataIndex: 'targetType',
        key: 'targetType',
        width: 120,
        render: (type) => {
          const color = type === '军用船舶' ? 'red' : type === '高危船舶' ? 'orange' : 'blue';
          return <Tag color={color}>{type}</Tag>;
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button 
              size="small" 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => handleContinuousMonitor(record)}
            >
              持续监控
            </Button>
            <Button 
              size="small" 
              icon={<FileTextOutlined />}
              onClick={() => handleShowRealtimeDetail(record)}
            >
              详情
            </Button>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleProcessAlert(record)}
            >
              处理
            </Button>
          </Space>
        )
      }
    ];

    // 渲染单个标签页内容
    const renderTabContent = (type, data, columns, title, icon) => {
      const getStatistics = (data, tabType) => {
        const total = data.length;
        const unprocessed = data.filter(item => item.status === '未处理').length;
        const processed = data.filter(item => item.status === '已处理').length;
        
        // 只有进出围栏告警台账有自由通行状态
        if (tabType === 'fence') {
          const freeNavigation = data.filter(item => item.status === '自由通行').length;
          return { total, unprocessed, processed, freeNavigation };
        } else {
          // 其他台账有监控中和处理中状态
          const processing = data.filter(item => item.status === '处理中').length;
          const monitoring = data.filter(item => item.status === '监控中').length;
          return { total, unprocessed, processed, processing, monitoring };
        }
      };

      const stats = getStatistics(data, type);

      return (
        <div>
          {/* 操作栏 */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>{title}</span>
            </div>
            <Space>
              <Search
                placeholder={`搜索${title.replace('台账', '')}记录...`}
                allowClear
                style={{ width: 250 }}
                onSearch={(value) => console.log(`搜索${type}:`, value)}
              />
              <Button icon={<ReloadOutlined />}>刷新</Button>
              <Button type="primary" icon={<DownloadOutlined />}>导出Excel</Button>
              <Button icon={<FilePdfOutlined />}>导出PDF</Button>
            </Space>
          </div>

          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {type === 'fence' ? (
              // 进出围栏告警台账：4个统计卡片
              <>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <div className={styles.statItem}>
                      <div className={styles.statValue} style={{ color: '#1890ff' }}>{stats.total}</div>
                      <div className={styles.statLabel}>总记录数</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <div className={styles.statItem}>
                      <div className={styles.statValue} style={{ color: '#ff4d4f' }}>{stats.unprocessed}</div>
                      <div className={styles.statLabel}>未处理</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <div className={styles.statItem}>
                      <div className={styles.statValue} style={{ color: '#1890ff' }}>{stats.processed}</div>
                      <div className={styles.statLabel}>已处理</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <div className={styles.statItem}>
                      <div className={styles.statValue} style={{ color: '#52c41a' }}>{stats.freeNavigation}</div>
                      <div className={styles.statLabel}>自由通行</div>
                    </div>
                  </Card>
                </Col>
              </>
            ) : (
              // 其他台账：5个统计卡片，使用flex布局均匀分布
              <>
                <Col xs={24} sm={24} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <Card size="small">
                      <div className={styles.statItem}>
                        <div className={styles.statValue} style={{ color: '#1890ff' }}>{stats.total}</div>
                        <div className={styles.statLabel}>总记录数</div>
                      </div>
                    </Card>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Card size="small">
                      <div className={styles.statItem}>
                        <div className={styles.statValue} style={{ color: '#ff4d4f' }}>{stats.unprocessed}</div>
                        <div className={styles.statLabel}>未处理</div>
                      </div>
                    </Card>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Card size="small">
                      <div className={styles.statItem}>
                        <div className={styles.statValue} style={{ color: '#1890ff' }}>{stats.processed}</div>
                        <div className={styles.statLabel}>已处理</div>
                      </div>
                    </Card>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Card size="small">
                      <div className={styles.statItem}>
                        <div className={styles.statValue} style={{ color: '#faad14' }}>{stats.processing || 0}</div>
                        <div className={styles.statLabel}>处理中</div>
                      </div>
                    </Card>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Card size="small">
                      <div className={styles.statItem}>
                        <div className={styles.statValue} style={{ color: '#13c2c2' }}>{stats.monitoring || 0}</div>
                        <div className={styles.statLabel}>监控中</div>
                      </div>
                    </Card>
                  </div>
                </Col>
              </>
            )}
          </Row>

          {/* 数据表格 */}
          <Card>
            <Table
              columns={columns}
              dataSource={type === 'fence' ? data.map(record => {
                // 如果是进出围栏告警，检查共享数据中是否有更新
                const sharedRecord = sharedFenceData.get(record.id);
                if (sharedRecord) {
                  return {
                    ...record,
                    status: sharedRecord.status,
                    operator: sharedRecord.operator,
                    remark: sharedRecord.remark
                  };
                }
                return record;
              }) : data}
              loading={ledgerLoading}
              scroll={{ x: 1400 }}
              pagination={{
                total: data.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              rowSelection={{
                type: 'checkbox',
                onChange: (selectedRowKeys, selectedRows) => {
                  console.log(`${type} 选中:`, selectedRowKeys, selectedRows);
                }
              }}
            />
          </Card>

          {/* 数据同步提示 */}
          {type === 'fence' && sharedFenceData.size > 0 && (
            <Alert
              message="数据同步状态"
              description={`已同步 ${sharedFenceData.size} 条记录的处理状态，与进出围栏台账保持一致`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
              closable
            />
          )}
        </div>
      );
    };

    // 标签页配置
    const tabItems = [
      {
        key: 'collision',
        label: (
          <span>
            <WarningOutlined />
            碰撞风险预警台账
          </span>
        ),
        children: renderTabContent(
          'collision',
          mockDataByType.collision,
          getCollisionColumns(),
          '碰撞风险预警台账',
          '⚠️'
        )
      },
      {
        key: 'deviation',
        label: (
          <span>
            <CompassOutlined />
            船舶偏航预警台账
          </span>
        ),
        children: renderTabContent(
          'deviation',
          mockDataByType.deviation,
          getDeviationColumns(),
          '船舶偏航预警台账',
          '📍'
        )
      },
      {
        key: 'fence',
        label: (
          <span>
            <BorderOutlined />
            进出围栏告警台账
          </span>
        ),
        children: renderTabContent(
          'fence',
          mockDataByType.fence,
          getFenceColumns(),
          '进出围栏告警台账',
          '🚧'
        )
      },
      {
        key: 'specialTarget',
        label: (
          <span>
            <EyeOutlined />
            特殊目标预警台账
          </span>
        ),
        children: renderTabContent(
          'specialTarget',
          mockDataByType.specialTarget,
          getSpecialColumns(),
          '特殊目标预警台账',
          '🎯'
        )
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>实时预警台账管理</h3>
          <Space>
            <Button icon={<SyncOutlined />} onClick={() => message.info('数据已刷新')}>
              全局刷新
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              批量导出全部
            </Button>
          </Space>
        </div>

        <Tabs
          defaultActiveKey="collision"
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
          onChange={(key) => {
            console.log('切换到标签页:', key);
            // 这里可以添加标签页切换的逻辑，比如数据刷新等
          }}
        />



        {/* 实时预警台账详情模态框 */}
        <Modal
          title={realtimeDetailModal.record ? `${realtimeDetailModal.record.alertType}详情` : '预警详情'}
          open={realtimeDetailModal.visible}
          onCancel={() => setRealtimeDetailModal({ visible: false, record: null })}
          footer={[
            <Button key="export" icon={<DownloadOutlined />}>
              导出详情
            </Button>,
            <Button key="close" onClick={() => setRealtimeDetailModal({ visible: false, record: null })}>
              关闭
            </Button>
          ]}
          width={800}
        >
          {realtimeDetailModal.record && (
            <div>
              {/* 基本信息区域 */}
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>📋 基本信息</h4>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                      <p><strong>预警ID：</strong>{realtimeDetailModal.record.id}</p>
                      <p><strong>预警时间：</strong>{realtimeDetailModal.record.alertTime}</p>
                      <p><strong>预警类型：</strong>
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          {realtimeDetailModal.record.alertType}
                        </Tag>
                      </p>
                      <p><strong>位置坐标：</strong>{realtimeDetailModal.record.position}</p>
                      <p><strong>处理状态：</strong>
                        <Tag
                          color={
                            realtimeDetailModal.record.status === '已处理' ? 'blue' :
                            realtimeDetailModal.record.status === '自由通行' ? 'green' :
                            realtimeDetailModal.record.status === '处理中' ? 'orange' :
                            realtimeDetailModal.record.status === '监控中' ? 'cyan' : 'red'
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {realtimeDetailModal.record.status === '已处理' ? '✅ 已处理' :
                           realtimeDetailModal.record.status === '自由通行' ? '🟢 自由通行' :
                           realtimeDetailModal.record.status === '处理中' ? '⏳ 处理中' :
                           realtimeDetailModal.record.status === '监控中' ? '👁️ 监控中' : '🚨 未处理'}
                        </Tag>
                      </p>
                      {realtimeDetailModal.record.level && (
                        <p><strong>风险等级：</strong>
                          <Tag
                            color={
                              realtimeDetailModal.record.level === '高风险' ? 'red' :
                              realtimeDetailModal.record.level === '中风险' ? 'orange' : 'green'
                            }
                            style={{ marginLeft: 8 }}
                          >
                            {realtimeDetailModal.record.level}
                          </Tag>
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>🚢 船舶信息</h4>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                      <p><strong>船舶信息：</strong>{realtimeDetailModal.record.ship1}</p>
                      {realtimeDetailModal.record.ship2 && (
                        <p><strong>目标船舶：</strong>{realtimeDetailModal.record.ship2}</p>
                      )}
                      <p><strong>处理人员：</strong>{realtimeDetailModal.record.operator}</p>
                      <p><strong>备注信息：</strong>{realtimeDetailModal.record.remark || '无备注'}</p>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* 专属信息区域 - 根据告警类型显示不同内容 */}
              <div style={{ marginBottom: 16 }}>
                <h4>
                  {realtimeDetailModal.record.alertType === '碰撞风险预警' ? '⚠️ 碰撞风险信息' :
                   realtimeDetailModal.record.alertType === '船舶偏航预警' ? '🧭 偏航信息' :
                   realtimeDetailModal.record.alertType === '进出围栏告警' ? '🚧 围栏信息' :
                   realtimeDetailModal.record.alertType === '特殊目标预警' ? '🎯 目标信息' : '专属信息'}
                </h4>
                <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, border: '1px solid #b7eb8f' }}>
                  {/* 碰撞风险预警专属信息 */}
                  {realtimeDetailModal.record.alertType === '碰撞风险预警' && (
                    <div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <p><strong>预计会遇距离：</strong>
                            <span style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                              {realtimeDetailModal.record.meetDistance}
                            </span>
                          </p>
                          <p><strong>预计会遇时间：</strong>
                            <span style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                              {realtimeDetailModal.record.meetTime}
                            </span>
                          </p>
                        </Col>
                        <Col span={12}>
                          <p><strong>船舶1速度：</strong>12.5节</p>
                          <p><strong>船舶2速度：</strong>8.3节</p>
                          <p><strong>相对航向：</strong>相向而行</p>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* 船舶偏航预警专属信息 */}
                  {realtimeDetailModal.record.alertType === '船舶偏航预警' && (
                    <div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <p><strong>偏航距离：</strong>
                            <span style={{ color: '#faad14', fontWeight: 'bold', marginLeft: 8 }}>
                              {realtimeDetailModal.record.deviationDistance}
                            </span>
                          </p>
                          <p><strong>偏航时长：</strong>
                            <span style={{ color: '#faad14', fontWeight: 'bold', marginLeft: 8 }}>
                              {realtimeDetailModal.record.deviationTime}
                            </span>
                          </p>
                        </Col>
                        <Col span={12}>
                          <p><strong>预定航线：</strong>A1-B3航线</p>
                          <p><strong>当前航向：</strong>092°</p>
                          <p><strong>建议航向：</strong>085°</p>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* 进出围栏告警专属信息 */}
                  {realtimeDetailModal.record.alertType === '进出围栏告警' && (
                    <div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <p><strong>围栏类型：</strong>
                            <Tag 
                              color={
                                realtimeDetailModal.record.fenceType === '禁航区' ? 'red' :
                                realtimeDetailModal.record.fenceType === '限制区' ? 'orange' : 'blue'
                              } 
                              style={{ marginLeft: 8 }}
                            >
                              {realtimeDetailModal.record.fenceType}
                            </Tag>
                          </p>
                          <p><strong>动作类型：</strong>
                            <Tag 
                              color={realtimeDetailModal.record.fenceAction === '闯入' ? 'red' : 'green'} 
                              style={{ marginLeft: 8 }}
                            >
                              {realtimeDetailModal.record.fenceAction}
                            </Tag>
                          </p>
                        </Col>
                        <Col span={12}>
                          <p><strong>围栏名称：</strong>禁航区-A1</p>
                          <p><strong>进入时间：</strong>{realtimeDetailModal.record.alertTime}</p>
                          <p><strong>滞留时长：</strong>3分钟</p>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* 特殊目标预警专属信息 */}
                  {realtimeDetailModal.record.alertType === '特殊目标预警' && (
                    <div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <p><strong>目标类型：</strong>
                            <Tag color={
                              realtimeDetailModal.record.targetType === '军用船舶' ? 'red' :
                              realtimeDetailModal.record.targetType === '高危船舶' ? 'orange' : 'blue'
                            }>
                              {realtimeDetailModal.record.targetType}
                            </Tag>
                          </p>
                          <p><strong>目标MMSI：</strong>412789456</p>
                        </Col>
                        <Col span={12}>
                          <p><strong>监控等级：</strong>高等级</p>
                          <p><strong>出现次数：</strong>第3次</p>
                          <p><strong>上次出现：</strong>2024-01-15 09:30</p>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </div>

              {/* 关联文件 */}
              {realtimeDetailModal.record.attachments && realtimeDetailModal.record.attachments.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4>📎 关联文件</h4>
                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                    {realtimeDetailModal.record.attachments.map((file, index) => (
                      <div key={index} style={{ marginBottom: 8 }}>
                        <Button type="link" icon={<DownloadOutlined />}>
                          📄 {file}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 处理建议 */}
              <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 6, border: '1px solid #91d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <span><strong>处理建议：</strong></span>
                </div>
                <div style={{ marginTop: 8, color: '#666' }}>
                  {realtimeDetailModal.record.alertType === '碰撞风险预警' && 
                    '建议立即通过VHF联系相关船舶，指挥其中一方调整航向或速度以避免碰撞。优先联系体积较小、机动性较强的船舶。'
                  }
                  {realtimeDetailModal.record.alertType === '船舶偏航预警' && 
                    '建议通过AIS或VHF向船舶发送航线指导信息，提醒其返回预定航线。如持续偏航，应升级处理等级。'
                  }
                  {realtimeDetailModal.record.alertType === '进出围栏告警' && 
                    (realtimeDetailModal.record.fenceAction === '闯入'
                      ? '建议立即联系船舶，确认进入原因，必要时发送警告信息引导船舶离开。'
                      : '船舶正常离开围栏区域，请继续监控船舶动态。')
                  }
                  {realtimeDetailModal.record.alertType === '特殊目标预警' && 
                    '建议启动高等级监控，密切关注目标动态，必要时通知相关部门介入处理。记录目标活动轨迹。'
                  }
                </div>
              </div>

              {/* 操作历史记录 */}
              <div style={{ marginTop: 16 }}>
                <h4>📋 操作历史</h4>
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    {realtimeDetailModal.record.alertTime} - 系统自动检测到{realtimeDetailModal.record.alertType}
                  </div>
                  
                  {/* 特定告警类型的操作历史 */}
                  {realtimeDetailModal.record.alertType === '碰撞风险预警' && (
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                      {new Date(Date.now() - 120000).toLocaleString()} - 系统发出紧急联系建议
                    </div>
                  )}
                  
                  {realtimeDetailModal.record.alertType === '船舶偏航预警' && (
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                      {new Date(Date.now() - 180000).toLocaleString()} - 系统发送航线指导建议
                    </div>
                  )}

                  {realtimeDetailModal.record.status !== '未处理' && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {new Date().toLocaleString()} - {realtimeDetailModal.record.operator}处理了此事件
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* 紧急联系模态框 */}
        <Modal
          title="紧急联系船舶"
          open={emergencyContactModal.visible}
          onCancel={() => {
            setEmergencyContactModal({ visible: false, record: null });
            emergencyContactForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setEmergencyContactModal({ visible: false, record: null });
              emergencyContactForm.resetFields();
            }}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={contactLoading}
              onClick={() => {
                emergencyContactForm.validateFields().then(values => {
                  handleExecuteEmergencyContact(values);
                });
              }}
            >
              立即联系
            </Button>
          ]}
          width={600}
        >
          {emergencyContactModal.record && (
            <div>
              <Alert
                message="紧急碰撞风险警告"
                description={
                  <div>
                    <p><strong>船舶1：</strong>{emergencyContactModal.record.ship1}</p>
                    <p><strong>船舶2：</strong>{emergencyContactModal.record.ship2}</p>
                    <p><strong>预计会遇距离：</strong>
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        {emergencyContactModal.record.meetDistance}
                      </span>
                    </p>
                    <p><strong>预计会遇时间：</strong>
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        {emergencyContactModal.record.meetTime}
                      </span>
                    </p>
                  </div>
                }
                type="error"
                style={{ marginBottom: 16 }}
              />

              <Form
                form={emergencyContactForm}
                layout="vertical"
              >
                <Form.Item
                  label="联系方式"
                  name="contactType"
                  rules={[{ required: true, message: '请选择联系方式' }]}
                >
                  <Radio.Group>
                    <Radio value="vhf">📻 VHF无线电</Radio>
                    <Radio value="phone">📞 卫星电话</Radio>
                    <Radio value="ais">📡 AIS消息</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="紧急等级"
                  name="priority"
                  rules={[{ required: true, message: '请选择紧急等级' }]}
                >
                  <Select>
                    <Select.Option value="urgent">🚨 紧急 - 立即避让</Select.Option>
                    <Select.Option value="high">⚠️ 高优先级 - 调整航向</Select.Option>
                    <Select.Option value="normal">ℹ️ 正常 - 保持警戒</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="联系内容"
                  name="message"
                  rules={[{ required: true, message: '请输入联系内容' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请输入要发送给船舶的紧急警告信息..."
                    maxLength={200}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  label="联系备注"
                  name="remark"
                >
                  <Input placeholder="可选：添加联系备注信息" />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* 航线指导模态框 */}
        <Modal
          title="航线指导"
          open={routeGuidanceModal.visible}
          onCancel={() => {
            setRouteGuidanceModal({ visible: false, record: null });
            routeGuidanceForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setRouteGuidanceModal({ visible: false, record: null });
              routeGuidanceForm.resetFields();
            }}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={guidanceLoading}
              onClick={() => {
                routeGuidanceForm.validateFields().then(values => {
                  handleExecuteRouteGuidance(values);
                });
              }}
            >
              发送指导
            </Button>
          ]}
          width={600}
        >
          {routeGuidanceModal.record && (
            <div>
              <Alert
                message="船舶偏航警告"
                description={
                  <div>
                    <p><strong>偏航船舶：</strong>{routeGuidanceModal.record.ship1}</p>
                    <p><strong>偏航距离：</strong>
                      <span style={{ color: '#faad14', fontWeight: 'bold' }}>
                        {routeGuidanceModal.record.deviationDistance}
                      </span>
                    </p>
                    <p><strong>偏航时长：</strong>
                      <span style={{ color: '#faad14', fontWeight: 'bold' }}>
                        {routeGuidanceModal.record.deviationTime}
                      </span>
                    </p>
                  </div>
                }
                type="warning"
                style={{ marginBottom: 16 }}
              />

              <Form
                form={routeGuidanceForm}
                layout="vertical"
              >
                <Form.Item
                  label="指导类型"
                  name="guidanceType"
                  rules={[{ required: true, message: '请选择指导类型' }]}
                >
                  <Radio.Group>
                    <Radio value="course">🧭 航向调整</Radio>
                    <Radio value="speed">⚡ 速度建议</Radio>
                    <Radio value="route">🗺️ 航线规划</Radio>
                  </Radio.Group>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="建议航向"
                      name="recommendedCourse"
                      rules={[{ required: true, message: '请输入建议航向' }]}
                    >
                      <InputNumber
                        min={0}
                        max={359}
                        formatter={value => `${value}°`}
                        parser={value => value.replace('°', '')}
                        style={{ width: '100%' }}
                        placeholder="输入0-359度"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="建议速度"
                      name="recommendedSpeed"
                      rules={[{ required: true, message: '请输入建议速度' }]}
                    >
                      <InputNumber
                        min={0}
                        max={25}
                        formatter={value => `${value}节`}
                        parser={value => value.replace('节', '')}
                        style={{ width: '100%' }}
                        placeholder="输入速度"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="指导原因"
                  name="reason"
                  rules={[{ required: true, message: '请输入指导原因' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请说明发送航线指导的原因..."
                    maxLength={150}
                    showCount
                  />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* 持续监控模态框 */}
        <Modal
          title="启动持续监控"
          open={continuousMonitorModal.visible}
          onCancel={() => {
            setContinuousMonitorModal({ visible: false, record: null });
            monitoringForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setContinuousMonitorModal({ visible: false, record: null });
              monitoringForm.resetFields();
            }}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={monitorLoading}
              onClick={() => {
                monitoringForm.validateFields().then(values => {
                  handleExecuteContinuousMonitor(values);
                });
              }}
            >
              启动监控
            </Button>
          ]}
          width={600}
        >
          {continuousMonitorModal.record && (
            <div>
              <Alert
                message="特殊目标监控"
                description={
                  <div>
                    <p><strong>目标船舶：</strong>{continuousMonitorModal.record.ship1}</p>
                    <p><strong>目标类型：</strong>
                      <Tag color={
                        continuousMonitorModal.record.targetType === '军用船舶' ? 'red' :
                        continuousMonitorModal.record.targetType === '高危船舶' ? 'orange' : 'blue'
                      }>
                        {continuousMonitorModal.record.targetType}
                      </Tag>
                    </p>
                    <p><strong>当前位置：</strong>{continuousMonitorModal.record.position}</p>
                  </div>
                }
                type="info"
                style={{ marginBottom: 16 }}
              />

              <Form
                form={monitoringForm}
                layout="vertical"
              >
                <Form.Item
                  label="监控等级"
                  name="monitorLevel"
                  rules={[{ required: true, message: '请选择监控等级' }]}
                >
                  <Radio.Group>
                    <Radio value="high">🔴 高等级 - 实时跟踪</Radio>
                    <Radio value="medium">🟡 中等级 - 定期检查</Radio>
                    <Radio value="low">🟢 低等级 - 常规监控</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="监控时长"
                  name="monitorDuration"
                  rules={[{ required: true, message: '请输入监控时长' }]}
                >
                  <Select>
                    <Select.Option value="30">30分钟</Select.Option>
                    <Select.Option value="60">1小时</Select.Option>
                    <Select.Option value="180">3小时</Select.Option>
                    <Select.Option value="360">6小时</Select.Option>
                    <Select.Option value="720">12小时</Select.Option>
                    <Select.Option value="1440">24小时</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="告警阈值"
                  name="alertThreshold"
                  rules={[{ required: true, message: '请选择告警阈值' }]}
                >
                  <Checkbox.Group>
                    <Row>
                      <Col span={12}>
                        <Checkbox value="movement">异常移动</Checkbox>
                      </Col>
                      <Col span={12}>
                        <Checkbox value="speed">速度变化</Checkbox>
                      </Col>
                      <Col span={12}>
                        <Checkbox value="course">航向改变</Checkbox>
                      </Col>
                      <Col span={12}>
                        <Checkbox value="zone">区域闯入</Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item
                  label="监控备注"
                  name="remarks"
                >
                  <TextArea
                    rows={3}
                    placeholder="可选：添加监控备注信息..."
                    maxLength={200}
                    showCount
                  />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* 处理模态框 */}
        <Modal
          title="处理预警事件"
          open={alertProcessModal.visible}
          onCancel={() => {
            setAlertProcessModal({ visible: false, record: null });
            alertProcessForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setAlertProcessModal({ visible: false, record: null });
              alertProcessForm.resetFields();
            }}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                alertProcessForm.validateFields().then(values => {
                  handleExecuteProcess(values);
                });
              }}
            >
              提交处理
            </Button>
          ]}
          width={600}
        >
          {alertProcessModal.record && (
            <div>
              <Alert
                message="预警事件信息"
                description={
                  <div>
                    <p><strong>预警ID：</strong>{alertProcessModal.record.id}</p>
                    <p><strong>船舶：</strong>{alertProcessModal.record.ship1}</p>
                    <p><strong>预警类型：</strong>{alertProcessModal.record.alertType}</p>
                    {alertProcessModal.record.level && (
                      <p><strong>风险等级：</strong>
                        <Tag color={
                          alertProcessModal.record.level === '高风险' ? 'red' :
                          alertProcessModal.record.level === '中风险' ? 'orange' : 'green'
                        }>
                          {alertProcessModal.record.level}
                        </Tag>
                      </p>
                    )}
                  </div>
                }
                type="warning"
                style={{ marginBottom: 16 }}
              />

              <Form
                form={alertProcessForm}
                layout="vertical"
                initialValues={{
                  status: '已处理',
                  operator: '当前用户',
                  processTime: new Date().toLocaleString()
                }}
              >
                <Form.Item
                  label="处理状态"
                  name="status"
                  rules={[{ required: true, message: '请选择处理状态' }]}
                >
                  <Select>
                    <Select.Option value="处理中">⏳ 处理中</Select.Option>
                    <Select.Option value="已处理">✅ 已处理</Select.Option>
                    {alertProcessModal.record?.alertType === '进出围栏告警' ? (
                      <Select.Option value="自由通行">🟢 自由通行</Select.Option>
                    ) : (
                      <Select.Option value="监控中">👁️ 监控中</Select.Option>
                    )}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="处理人员"
                  name="operator"
                  rules={[{ required: true, message: '请输入处理人员' }]}
                >
                  <Input placeholder="请输入处理人员姓名" />
                </Form.Item>

                <Form.Item
                  label="处理备注"
                  name="remark"
                  rules={[{ required: true, message: '请输入处理备注' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请详细描述处理过程和结果..."
                  />
                </Form.Item>

                <Form.Item
                  label="处理时间"
                  name="processTime"
                >
                  <Input disabled />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  // 渲染救援资源管理页面
  const renderRescueResources = () => (
    <div className={styles.dashboardContent}>
      <Card title="🚑 救援资源管理" extra={
        <Button icon={<DownloadOutlined />}>导出资源清单</Button>
      }>
        <Tabs defaultActiveKey="teams" items={[
          {
            key: 'teams',
            label: (
              <span>
                <TeamOutlined />
                救援队伍
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space wrap>
                    <Input.Search placeholder="搜索队伍名称" style={{ width: 200 }} />
                    <Select placeholder="队伍类型" style={{ width: 140 }}>
                      <Option value="all">全部类型</Option>
                      <Option value="professional">专业救援队</Option>
                      <Option value="volunteer">志愿者队伍</Option>
                      <Option value="lifeguard">兼职救生员</Option>
                    </Select>
                    <Select placeholder="技能认证" style={{ width: 140 }}>
                      <Option value="all">全部技能</Option>
                      <Option value="first_aid">急救证</Option>
                      <Option value="lifeguard">救生员证</Option>
                      <Option value="diving">潜水证</Option>
                    </Select>
                    <Button type="primary" ghost onClick={() => message.info('智能匹配功能开发中...')}>
                      🎯 智能匹配最近队伍
                    </Button>
                  </Space>
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />}>
                      添加救援队伍
                    </Button>
                  </Space>
                </div>
                <Table
                  columns={[
                    {
                      title: '队伍名称',
                      dataIndex: 'name',
                      key: 'name',
                      width: 150,
                      render: (text, record) => (
                        <div>
                          <div style={{ fontWeight: 500 }}>{text}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            📍 {record.location} ({record.distance})
                          </div>
                        </div>
                      )
                    },
                    {
                      title: '队伍类型',
                      dataIndex: 'type',
                      key: 'type',
                      width: 100,
                      render: (type) => {
                        const typeMap = {
                          professional: { text: '专业队', color: 'blue' },
                          volunteer: { text: '志愿者', color: 'green' },
                          lifeguard: { text: '救生员', color: 'orange' }
                        };
                        const config = typeMap[type] || { text: type, color: 'default' };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    },
                    {
                      title: '人员/技能',
                      key: 'skills',
                      width: 200,
                      render: (_, record) => (
                        <div>
                          <div>👥 {record.memberCount}人 | 👨‍✈️ {record.leader}</div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                            {record.certifications.slice(0, 2).map(cert => (
                              <Tag key={cert} size="small" color="cyan">{cert}</Tag>
                            ))}
                            {record.certifications.length > 2 && <span>+{record.certifications.length - 2}</span>}
                          </div>
                        </div>
                      )
                    },
                    {
                      title: '擅长领域',
                      dataIndex: 'specialties',
                      key: 'specialties',
                      width: 120,
                      render: (specialties) => (
                        <div>
                          {specialties.map(specialty => (
                            <Tag key={specialty} size="small" color="purple">{specialty}</Tag>
                          ))}
                        </div>
                      )
                    },
                    {
                      title: '状态/响应',
                      key: 'statusInfo',
                      width: 120,
                      render: (_, record) => (
                        <div>
                          <Tag color={
                            record.status === '值班中' ? 'green' :
                            record.status === '待命' ? 'orange' : 'red'
                          }>
                            {record.status}
                          </Tag>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            ⏱️ {record.responseTime}
                          </div>
                        </div>
                      )
                    },
                    {
                      title: '联系方式',
                      dataIndex: 'contact',
                      key: 'contact',
                      width: 120
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 200,
                      render: (_, record) => (
                        <Space direction="vertical" size="small">
                          <Space>
                            <Button type="link" size="small" onClick={() => message.info('查看详情功能开发中...')}>查看详情</Button>
                            <Button type="link" size="small" onClick={() => message.info('编辑功能开发中...')}>编辑</Button>
                          </Space>
                          <Space>
                            <Button type="link" size="small" onClick={() => message.info('队员管理功能：点击后将显示队员列表，支持添加、编辑、删除队员')}>队员管理</Button>
                            <Button type="link" size="small" onClick={() => message.info('培训记录功能开发中...')}>培训记录</Button>
                          </Space>
                        </Space>
                      )
                    }
                  ]}
                  dataSource={[
                    {
                      key: '1',
                      name: '港口专业救援队',
                      type: 'professional',
                      memberCount: 12,
                      location: '东港区救援站',
                      distance: '0.5km',
                      certifications: ['急救证', '救生员证', '潜水证'],
                      specialties: ['静水救援', '急流救援'],
                      status: '值班中',
                      contact: '13800138001',
                      leader: '张队长',
                      responseTime: '5分钟'
                    },
                    {
                      key: '2',
                      name: '海事志愿者队伍',
                      type: 'volunteer',
                      memberCount: 8,
                      location: '中央码头',
                      distance: '1.2km',
                      certifications: ['急救证'],
                      specialties: ['静水救援'],
                      status: '待命',
                      contact: '13800138002',
                      leader: '刘队长',
                      responseTime: '8分钟'
                    }
                  ]}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 1000 }}
                />
              </div>
            )
          },
          {
            key: 'equipment',
            label: (
              <span>
                <ToolOutlined />
                设备台账
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space wrap>
                    <Input.Search placeholder="搜索设备名称" style={{ width: 200 }} />
                    <Select placeholder="设备类型" style={{ width: 140 }}>
                      <Option value="all">全部类型</Option>
                      <Option value="boat">救生艇</Option>
                      <Option value="drone">无人机</Option>
                      <Option value="medical">急救设备</Option>
                      <Option value="personal">个人装备</Option>
                    </Select>
                    <Select placeholder="设备状态" style={{ width: 140 }}>
                      <Option value="all">全部状态</Option>
                      <Option value="idle">闲置</Option>
                      <Option value="in_use">在用</Option>
                      <Option value="maintenance">维修中</Option>
                    </Select>
                  </Space>
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />}>
                      添加设备
                    </Button>
                  </Space>
                </div>
                <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                  <p>设备台账管理功能开发中...</p>
                  <p>将包含救生艇、无人机、个人装备、急救设备等管理</p>
                </div>
              </div>
            )
          },
          {
            key: 'supplies',
            label: (
              <span>
                <InboxOutlined />
                物资储备
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space wrap>
                    <Input.Search placeholder="搜索物资名称" style={{ width: 200 }} />
                    <Select placeholder="物资类别" style={{ width: 140 }}>
                      <Option value="all">全部类别</Option>
                      <Option value="rescue">救生设备</Option>
                      <Option value="emergency">应急物资</Option>
                      <Option value="lighting">照明设备</Option>
                      <Option value="medical">医疗用品</Option>
                    </Select>
                    <Select placeholder="库存状态" style={{ width: 140 }}>
                      <Option value="all">全部状态</Option>
                      <Option value="normal">正常</Option>
                      <Option value="low">偏低</Option>
                      <Option value="critical">紧急</Option>
                    </Select>
                    <Button icon={<WarningOutlined />} style={{ color: '#ff4d4f' }}>
                      库存预警 (2)
                    </Button>
                  </Space>
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />}>
                      添加物资
                    </Button>
                  </Space>
                </div>
                <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                  <p>物资储备管理功能开发中...</p>
                  <p>将包含库存管理、预警设置、出入库记录等功能</p>
                </div>
              </div>
            )
          }
        ]} />
      </Card>
    </div>
  );

  // 渲染救援方案管理页面
  const renderRescuePlans = () => (
    <div className={styles.dashboardContent}>
      <Card title="📋 救援方案管理" extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>新建方案</Button>
          <Button icon={<DownloadOutlined />}>导出方案库</Button>
        </Space>
      }>
        <Tabs defaultActiveKey="standard" items={[
          {
            key: 'standard',
            label: '标准化流程库',
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Input.Search placeholder="搜索方案名称" style={{ width: 200 }} />
                    <Select placeholder="救援场景" style={{ width: 140 }}>
                      <Option value="offshore">离岸救援</Option>
                      <Option value="rapid_current">急流救援</Option>
                      <Option value="night">夜间救援</Option>
                    </Select>
                    <Select placeholder="成功率" style={{ width: 140 }}>
                      <Option value="high">高成功率(&gt;90%)</Option>
                      <Option value="medium">中等成功率(70-90%)</Option>
                      <Option value="low">低成功率(&lt;70%)</Option>
                    </Select>
                  </Space>
                </div>
                <Table
                  columns={[
                    { title: '方案名称', dataIndex: 'name', key: 'name', width: 200 },
                    { title: '适用场景', dataIndex: 'scenario', key: 'scenario', width: 120 },
                    { title: '环境参数', dataIndex: 'environment', key: 'environment', width: 180 },
                    { title: '成功率', dataIndex: 'successRate', key: 'successRate', width: 100, render: (rate) => (
                      <Tag color={rate >= '90%' ? 'green' : rate >= '70%' ? 'orange' : 'red'}>{rate}</Tag>
                    )},
                    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 120 },
                    { title: '操作', key: 'action', width: 180, render: () => (
                      <Space>
                        <Button type="link" size="small">查看</Button>
                        <Button type="link" size="small">编辑</Button>
                        <Button type="link" size="small">应用</Button>
                      </Space>
                    )}
                  ]}
                  dataSource={[
                    {
                      key: '1',
                      name: '离岸10米内救援方案',
                      scenario: '离岸救援',
                      environment: '水深<5米，流速<1m/s',
                      successRate: '95%',
                      updateTime: '2024-01-15'
                    },
                    {
                      key: '2',
                      name: '急流中救援方案',
                      scenario: '急流救援',
                      environment: '流速1-3m/s，水深>5米',
                      successRate: '78%',
                      updateTime: '2024-01-10'
                    },
                    {
                      key: '3',
                      name: '夜间落水救援方案',
                      scenario: '夜间救援',
                      environment: '能见度<50米，水温<15℃',
                      successRate: '85%',
                      updateTime: '2024-01-08'
                    }
                  ]}
                  pagination={{ pageSize: 10 }}
                />
              </div>
            )
          },
          {
            key: 'guidance',
            label: '临场指导工具',
            children: (
              <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                <p>临场指导工具功能开发中...</p>
                <p>将包含应急操作手册、远程指导、视频标注等功能</p>
              </div>
            )
          }
        ]} />
      </Card>
    </div>
  );

  return (
    <div className={styles.dashboardLayout}>
      {/* 顶部标题栏 */}
      <HeaderBar />
      
      {/* 侧边导航栏 */}
      <NavigationBar 
        collapsed={collapsed} 
        onCollapse={() => setCollapsed(!collapsed)} 
      />
      
      {/* 主内容区 */}
      <div className={`${styles.mainLayout} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.contentInner}>
          {/* 面包屑导航 */}
          <Breadcrumb />
          
          {/* 页面内容 */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
