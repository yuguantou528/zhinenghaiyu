import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card, Row, Col, Table, Button, Space, Tag, message,
  Select, Input, Form, Switch, Slider, DatePicker,
  Radio, Checkbox, Divider, Progress, Badge, Tooltip,
  Modal, Upload, Spin, InputNumber, Alert, Typography,
  Dropdown, Tabs, Descriptions, Rate, Timeline, Statistic
} from 'antd';
const { TextArea, Search } = Input;
const { Option } = Select;
const { Text } = Typography;
import MapSelector from '../../components/MapSelector';
import ReactECharts from 'echarts-for-react';
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
  ArrowLeftOutlined,
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
  InfoCircleOutlined,
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
  AudioOutlined,
  FileOutlined,
  MinusOutlined,
  CloseOutlined,
  SaveOutlined
} from '@ant-design/icons';
import HeaderBar from '../../components/HeaderBar';
import NavigationBar from '../../components/NavigationBar';
import Breadcrumb from '../../components/Breadcrumb';
import styles from './index.module.css';
import moment from 'moment';

const Dashboard = () => {
  const location = useLocation();
  
  // 自动跟踪配置相关状态 - 移到组件顶层
  const [priorityStrategy, setPriorityStrategy] = useState('priority');
  const [shipTypePriority, setShipTypePriority] = useState([
    { id: 1, name: '⚓ 军舰', value: 'military', priority: 1 },
    { id: 2, name: '🚢 其他军用船舶', value: 'military_other', priority: 2 },
    { id: 3, name: '🚢 商船', value: 'commercial', priority: 3 },
    { id: 4, name: '🎣 渔船', value: 'fishing', priority: 4 },
    { id: 5, name: '🛥️ 游艇', value: 'yacht', priority: 5 }
  ]);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  
  // 拖拽排序功能
  const moveShipType = (dragIndex, hoverIndex) => {
    const dragItem = shipTypePriority[dragIndex];
    const newOrder = [...shipTypePriority];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragItem);
    
    // 重新设置优先级
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      priority: index + 1
    }));
    
    setShipTypePriority(updatedOrder);
    message.success('优先级顺序已调整');
  };

  // 重置优先级
  const resetPriority = () => {
    const defaultOrder = [
      { id: 1, name: '⚓ 军舰', value: 'military', priority: 1 },
      { id: 2, name: '🚢 其他军用船舶', value: 'military_other', priority: 2 },
      { id: 3, name: '🚢 商船', value: 'commercial', priority: 3 },
      { id: 4, name: '🎣 渔船', value: 'fishing', priority: 4 },
      { id: 5, name: '🛥️ 游艇', value: 'yacht', priority: 5 }
    ];
    setShipTypePriority(defaultOrder);
    message.info('优先级已重置为默认值');
  };

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



  // 救援方案模拟数据
  const rescuePlansData = [
    {
      id: 'plan001',
      name: '离岸10米内救援方案',
      scenario: 'offshore',
      difficulty: 'easy',
      description: '适用于距离岸边10米内的落水救援，主要采用抛投救生圈配合岸边拖拽的方式',
      steps: [
        { id: 1, title: '现场评估', content: '评估落水者状态、水域环境、天气条件', duration: '1-2分钟', equipment: ['望远镜', '对讲机'] },
        { id: 2, title: '抛投救生圈', content: '向落水者抛投救生圈，确保落水者能够抓住', duration: '30秒-1分钟', equipment: ['救生圈', '抛投绳'] },
        { id: 3, title: '岸边拖拽', content: '通过绳索将落水者拖拽至岸边安全区域', duration: '2-3分钟', equipment: ['拖拽绳', '救生衣'] },
        { id: 4, title: '上岸救护', content: '协助落水者上岸，进行初步医疗检查', duration: '3-5分钟', equipment: ['急救包', '保暖毯'] }
      ],
      requiredPersonnel: [
        { role: '现场指挥', count: 1, skills: ['指挥协调', '现场评估'] },
        { role: '抛投手', count: 2, skills: ['抛投技能', '游泳救生'] },
        { role: '医疗救护', count: 1, skills: ['急救证', '医疗救护'] }
      ],
      environmentParams: {
        waterDepth: '1-3米',
        currentSpeed: '< 0.5m/s',
        weather: ['晴天', '多云', '小雨'],
        visibility: '> 100米',
        waveHeight: '< 0.5米'
      },
      successRate: 95.2,
      avgExecutionTime: '6-10分钟',
      executionCount: 156,
      lastUpdated: '2024-01-15',
      status: 'active',
      tags: ['标准方案', '高成功率', '快速响应']
    },
    {
      id: 'plan002',
      name: '急流救援方案',
      scenario: 'rapid_current',
      difficulty: 'hard',
      description: '适用于急流水域的救援，采用顺流跟踪配合无人机抛投浮具的方式',
      steps: [
        { id: 1, title: '无人机定位', content: '使用无人机快速定位落水者位置，评估水流情况', duration: '2-3分钟', equipment: ['救援无人机', '热成像设备'] },
        { id: 2, title: '救生艇部署', content: '在下游安全位置部署救生艇，准备接应', duration: '3-5分钟', equipment: ['救生艇', '船外机', '救生衣'] },
        { id: 3, title: '无人机抛投', content: '使用无人机向落水者抛投浮具，保持其漂浮', duration: '1-2分钟', equipment: ['抛投浮具', '定位信标'] },
        { id: 4, title: '顺流接应', content: '救生艇顺流接近，将落水者救上船', duration: '5-8分钟', equipment: ['救生艇', '救生钩', '救生绳'] },
        { id: 5, title: '医疗救护', content: '船上进行初步救护，快速送往医疗点', duration: '10-15分钟', equipment: ['船载急救设备', '氧气瓶'] }
      ],
      requiredPersonnel: [
        { role: '现场指挥', count: 1, skills: ['指挥协调', '水域救援'] },
        { role: '无人机操作员', count: 1, skills: ['无人机操作证', '搜救技能'] },
        { role: '救生艇驾驶员', count: 1, skills: ['船舶驾驶证', '急流救援'] },
        { role: '水上救生员', count: 2, skills: ['救生员证', '急流救援'] },
        { role: '医疗救护', count: 1, skills: ['急救证', '水上医疗'] }
      ],
      environmentParams: {
        waterDepth: '> 3米',
        currentSpeed: '> 1.0m/s',
        weather: ['晴天', '多云'],
        visibility: '> 50米',
        waveHeight: '< 1.0米'
      },
      successRate: 78.5,
      avgExecutionTime: '15-25分钟',
      executionCount: 43,
      lastUpdated: '2024-01-10',
      status: 'active',
      tags: ['复杂方案', '设备密集', '专业技能']
    },
    {
      id: 'plan003',
      name: '夜间救援方案',
      scenario: 'night',
      difficulty: 'medium',
      description: '适用于夜间或低能见度条件下的救援，采用热成像定位配合照明设备',
      steps: [
        { id: 1, title: '照明部署', content: '快速部署强光照明设备，照亮救援区域', duration: '2-3分钟', equipment: ['强光探照灯', '便携照明'] },
        { id: 2, title: '热成像搜索', content: '使用热成像设备定位落水者精确位置', duration: '3-5分钟', equipment: ['热成像无人机', '手持热成像仪'] },
        { id: 3, title: '救生艇接近', content: '救生艇在照明引导下接近落水者', duration: '5-8分钟', equipment: ['救生艇', '船载照明', '夜视设备'] },
        { id: 4, title: '水中救援', content: '救生员下水进行救援，确保安全', duration: '3-5分钟', equipment: ['救生衣', '救生绳', '发光浮标'] },
        { id: 5, title: '安全撤离', content: '将落水者安全转移至岸边或医疗点', duration: '8-12分钟', equipment: ['保暖设备', '急救包'] }
      ],
      requiredPersonnel: [
        { role: '现场指挥', count: 1, skills: ['夜间救援', '指挥协调'] },
        { role: '照明操作员', count: 2, skills: ['设备操作', '现场照明'] },
        { role: '热成像操作员', count: 1, skills: ['热成像设备', '搜救定位'] },
        { role: '救生艇驾驶员', count: 1, skills: ['夜间驾驶', '船舶操作'] },
        { role: '水上救生员', count: 2, skills: ['夜间救生', '水中救援'] }
      ],
      environmentParams: {
        waterDepth: '1-5米',
        currentSpeed: '< 1.0m/s',
        weather: ['晴天', '多云', '小雨'],
        visibility: '< 50米',
        waveHeight: '< 0.8米'
      },
      successRate: 85.7,
      avgExecutionTime: '20-30分钟',
      executionCount: 67,
      lastUpdated: '2024-01-12',
      status: 'active',
      tags: ['夜间专用', '技术密集', '照明设备']
    },
    {
      id: 'plan004',
      name: '深水救援方案',
      scenario: 'deep_water',
      difficulty: 'hard',
      description: '适用于深水区域的救援，需要专业潜水设备和技能',
      steps: [
        { id: 1, title: '水下搜索', content: '专业潜水员下水搜索落水者', duration: '10-15分钟', equipment: ['潜水设备', '水下通信', '搜索声纳'] },
        { id: 2, title: '水下救援', content: '发现目标后进行水下救援操作', duration: '5-10分钟', equipment: ['救援浮力袋', '水下切割工具'] },
        { id: 3, title: '水面接应', content: '将落水者带至水面，船只接应', duration: '3-5分钟', equipment: ['救生艇', '起重设备'] },
        { id: 4, title: '紧急救护', content: '进行心肺复苏等紧急医疗救护', duration: '持续进行', equipment: ['急救设备', 'AED', '氧气'] }
      ],
      requiredPersonnel: [
        { role: '潜水队长', count: 1, skills: ['潜水证', '水下救援', '指挥协调'] },
        { role: '专业潜水员', count: 2, skills: ['潜水证', '水下救援', '水下焊接'] },
        { role: '水面支援', count: 2, skills: ['船舶操作', '设备操作'] },
        { role: '医疗救护', count: 1, skills: ['急救证', '心肺复苏', '潜水医学'] }
      ],
      environmentParams: {
        waterDepth: '> 10米',
        currentSpeed: '< 0.8m/s',
        weather: ['晴天', '多云'],
        visibility: '> 30米',
        waveHeight: '< 1.5米'
      },
      successRate: 65.3,
      avgExecutionTime: '30-60分钟',
      executionCount: 28,
      lastUpdated: '2024-01-08',
      status: 'active',
      tags: ['专业方案', '高难度', '潜水作业']
    }
  ];

  // 应急操作手册数据
  const emergencyManualsData = [
    {
      id: 'manual001',
      title: '低温溺水急救步骤',
      category: 'medical',
      priority: 'high',
      content: `
## 低温溺水急救操作流程

### 1. 现场安全评估
- 确保救援人员安全
- 评估环境温度和水温
- 检查是否有其他危险因素

### 2. 快速救援
- 尽快将溺水者救出水面
- 避免剧烈移动，防止心律失常
- 保持溺水者水平位置

### 3. 体温管理
- 立即脱去湿衣物
- 用干燥保暖材料包裹
- 避免直接加热，防止血管扩张

### 4. 生命体征监测
- 检查呼吸和脉搏
- 注意体温过低可能导致微弱生命体征
- 持续监测至少10分钟

### 5. 复苏措施
- 如无呼吸，立即进行人工呼吸
- 如无脉搏，进行胸外按压
- 低温情况下延长复苏时间

### 6. 禁忌事项
- 禁止控水操作
- 禁止剧烈摇晃
- 禁止快速复温
- 禁止给予酒精类饮品
      `,
      attachments: ['低温急救图解.pdf', '体温管理指南.doc'],
      lastUpdated: '2024-01-15',
      viewCount: 234,
      downloadCount: 89,
      tags: ['急救', '低温', '溺水', '医疗']
    },
    {
      id: 'manual002',
      title: '溺水者控水禁忌',
      category: 'medical',
      priority: 'high',
      content: `
## 溺水急救中的控水禁忌

### 为什么不能控水？
1. **延误救援时间**：控水操作浪费宝贵的急救时间
2. **增加误吸风险**：可能导致胃内容物反流，增加误吸
3. **影响循环**：头低位可能影响心脑血管功能
4. **无实际效果**：肺内水分无法通过控水排出

### 正确的急救步骤
1. **立即开始心肺复苏**
2. **清理口鼻异物**
3. **开放气道**
4. **人工呼吸**
5. **胸外按压**

### 常见误区
- ❌ 倒挂控水
- ❌ 腹部冲击
- ❌ 背部拍打
- ✅ 直接CPR

### 记住：时间就是生命
溺水急救的黄金时间是4-6分钟，任何延误都可能导致不可逆的脑损伤。
      `,
      attachments: ['CPR操作指南.pdf', '急救流程图.jpg'],
      lastUpdated: '2024-01-12',
      viewCount: 456,
      downloadCount: 178,
      tags: ['急救', '溺水', '禁忌', 'CPR']
    },
    {
      id: 'manual003',
      title: '复杂水域脱困技巧',
      category: 'rescue',
      priority: 'medium',
      content: `
## 复杂水域脱困技巧

### 急流脱困
1. **保持冷静**：不要逆流游泳
2. **顺流而下**：利用水流力量
3. **寻找缓流区**：河弯内侧、大石后方
4. **正确姿势**：脚在前，仰泳姿势

### 漩涡脱困
1. **深吸气下潜**：潜入漩涡底部
2. **水平游离**：在水下水平游出漩涡范围
3. **上浮脱离**：远离漩涡中心后上浮

### 水草缠绕脱困
1. **保持冷静**：避免挣扎加重缠绕
2. **缓慢解脱**：用手慢慢解开水草
3. **工具辅助**：使用潜水刀等工具

### 冰面落水脱困
1. **不要恐慌**：保持体力
2. **寻找坚固冰面**：测试冰层厚度
3. **正确上冰**：身体平躺分散重量
4. **滚动离开**：不要直立行走
      `,
      attachments: ['水域脱困示意图.pdf', '安全游泳指南.doc'],
      lastUpdated: '2024-01-10',
      viewCount: 189,
      downloadCount: 67,
      tags: ['脱困', '水域安全', '自救', '技巧']
    }
  ];



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
      case '/cctv/tracking':
        return renderCCTVTracking();
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
                  <Divider style={{ margin: '2px 0', fontSize: '12px' }}>
                    <Space size={4}>
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
                        <div style={{ marginTop: '4px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#666' }}>速度：</span>
                          <Button.Group size="small">
                            <Button size="small" onClick={() => handlePTZControl('设置速度', '慢')}>慢</Button>
                            <Button size="small" type="primary" onClick={() => handlePTZControl('设置速度', '中')}>中</Button>
                            <Button size="small" onClick={() => handlePTZControl('设置速度', '快')}>快</Button>
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
                            style={{ marginBottom: '2px', height: '24px', fontSize: '11px' }}
                          >
                            放大
                          </Button>
                          <Button
                            size="small"
                            icon={<ZoomOutOutlined />}
                            onClick={() => handlePTZControl('缩小')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                            style={{ marginBottom: '2px', height: '24px', fontSize: '11px' }}
                          >
                            缩小
                          </Button>
                          <Button
                            size="small"
                            icon={<FullscreenOutlined />}
                            onClick={() => handlePTZControl('全屏')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                            style={{ marginBottom: '2px', height: '24px', fontSize: '11px' }}
                          >
                            全屏
                          </Button>
                          <Button
                            size="small"
                            icon={<SyncOutlined />}
                            onClick={() => handlePTZControl('自动巡航')}
                            disabled={selectedDevice.status !== 'online'}
                            block
                            style={{ height: '24px', fontSize: '11px' }}
                          >
                            巡航
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
                  <Divider style={{ margin: '2px 0', fontSize: '12px' }}>⚡ 即时操作</Divider>
                  <Row gutter={[4, 4]}>
                    <Col span={12}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CameraOutlined />}
                        onClick={handleScreenshot}
                        disabled={selectedDevice.status !== 'online'}
                        loading={quickActionLoading}
                        block
                        style={{ height: '24px', fontSize: '11px' }}
                      >
                        截图
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
                        style={{ height: '24px', fontSize: '11px' }}
                      >
                        {isCurrentDeviceRecording ? '停止' : '录像'}
                      </Button>
                    </Col>
                  </Row>

                  {/* 预设位置 */}
                  {selectedDevice.type === 'ptz' && (
                    <>
                      <Divider style={{ margin: '2px 0', fontSize: '12px' }}>📍 预设位置</Divider>
                      <Row gutter={[2, 2]}>
                        {['位置1', '位置2', '位置3', '位置4'].map((pos, index) => (
                          <Col span={6} key={index}>
                            <Button
                              size="small"
                              onClick={() => handlePTZControl(`转到${pos}`)}
                              disabled={selectedDevice.status !== 'online'}
                              block
                              style={{ height: '22px', fontSize: '10px' }}
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

  // CCTV 自动跟踪配置内容
  const renderCCTVTracking = () => {



    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>自动跟踪配置</h3>
          <Space>
            <Button onClick={handleResetConfig}>重置配置</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => trackingForm.submit()}
              loading={trackingLoading}
            >
              保存配置
            </Button>
          </Space>
        </div>

        <Form
          form={trackingForm}
          layout="vertical"
          initialValues={trackingConfig}
          onFinish={handleSaveConfig}
        >
          <Row gutter={[24, 24]}>
            {/* AI识别参数配置 */}
            <Col xs={24} xl={14}>
              <Card
                title={
                  <Space>
                    <ControlOutlined />
                    AI识别参数设置
                  </Space>
                }
                className={styles.configCard}
              >
                <Form.Item
                  label="目标类型识别范围"
                  name="targetTypes"
                  tooltip="选择需要自动识别和跟踪的船舶类型"
                >
                  <Checkbox.Group
                    options={[
                      { label: '商船', value: 'commercial' },
                      { label: '渔船', value: 'fishing' },
                      { label: '军舰', value: 'military' },
                      { label: '游艇', value: 'yacht' },
                      { label: '货船', value: 'cargo' },
                      { label: '客船', value: 'passenger' }
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="识别置信度阈值"
                  name="confidenceThreshold"
                  tooltip="AI识别的最低置信度要求，数值越高识别越准确但可能遗漏目标"
                >
                  <Slider
                    min={0.5}
                    max={1.0}
                    step={0.1}
                    marks={{
                      0.5: '50%',
                      0.7: '70%',
                      0.8: '80%',
                      0.9: '90%',
                      1.0: '100%'
                    }}
                    tooltip={{ formatter: (value) => `${(value * 100).toFixed(0)}%` }}
                  />
                </Form.Item>

                <Form.Item
                  label="跟踪半径 (米)"
                  name="trackingRadius"
                  tooltip="自动跟踪的有效范围"
                >
                  <Slider
                    min={500}
                    max={5000}
                    step={100}
                    marks={{
                      500: '500m',
                      1000: '1km',
                      2000: '2km',
                      3000: '3km',
                      5000: '5km'
                    }}
                    tooltip={{ formatter: (value) => `${value}米` }}
                  />
                </Form.Item>

                <Form.Item
                  label="跟踪持续时间 (秒)"
                  name="trackingDuration"
                  tooltip="单个目标的最大跟踪时间"
                >
                  <Slider
                    min={60}
                    max={1800}
                    step={30}
                    marks={{
                      60: '1分钟',
                      300: '5分钟',
                      600: '10分钟',
                      1200: '20分钟',
                      1800: '30分钟'
                    }}
                    tooltip={{ formatter: (value) => `${Math.floor(value/60)}分${value%60}秒` }}
                  />
                </Form.Item>

                <Form.Item
                  label="自动跟踪开关"
                  name="autoTracking"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* 跟踪优先级规则配置 */}
            <Col xs={24} xl={10}>
              <Card
                title={
                  <Space>
                    <SafetyOutlined />
                    跟踪优先级规则
                  </Space>
                }
                className={styles.configCard}
              >
                <div className={styles.priorityConfig}>
                  <p className={styles.priorityDescription}>
                    当多个目标同时出现时，系统将按照以下优先级顺序进行跟踪：
                  </p>

                  <div className={styles.priorityList}>
                    {priorityList.map((item, index) => (
                      <div key={item.id} className={styles.priorityItem}>
                        <div className={styles.priorityRank}>{index + 1}</div>
                        <div className={styles.priorityInfo}>
                          <div className={styles.priorityTitle}>{item.title}</div>
                          <div className={styles.priorityDesc}>{item.desc}</div>
                        </div>
                        <div className={styles.priorityActions}>
                          <Space direction="vertical" size="small">
                            <Button
                              type="text"
                              size="small"
                              icon={<UpOutlined />}
                              disabled={index === 0}
                              onClick={() => movePriorityUp(index)}
                              title="向上移动"
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<DownOutlined />}
                              disabled={index === priorityList.length - 1}
                              onClick={() => movePriorityDown(index)}
                              title="向下移动"
                            />
                          </Space>
                        </div>
                        <Badge status={item.status} />
                      </div>
                    ))}
                  </div>

                  <Divider />

                  <div className={styles.prioritySettings}>
                    <h4>优先级设置</h4>
                    <Form.Item
                      label="多目标冲突处理策略"
                      name="conflictStrategy"
                    >
                      <Radio.Group>
                        <Radio value="priority">按优先级顺序</Radio>
                        <Radio value="distance">按距离远近</Radio>
                        <Radio value="size">按目标大小</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      label="同时跟踪目标数量"
                      name="maxTargets"
                    >
                      <Select defaultValue={3} style={{ width: '100%' }}>
                        <Option value={1}>1个目标</Option>
                        <Option value={2}>2个目标</Option>
                        <Option value={3}>3个目标</Option>
                        <Option value={5}>5个目标</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="目标丢失后重新搜索"
                      name="reacquireTarget"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="开启"
                        unCheckedChildren="关闭"
                      />
                    </Form.Item>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>


        </Form>
      </div>
    );
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
                      style={{ width: 120 }}
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
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>24h</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>监控时长</div>
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

        // 自动跟踪配置功能
    const renderAutoTrackingConfig = () => {
      console.log('🎯 自动跟踪配置标签页正在渲染');

      return (
        <div style={{ padding: '20px' }}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="🤖 AI识别参数" style={{ height: '100%' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>目标类型识别范围</Text>
                  <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 12px 0' }}>
                    配置CCTV系统能够自动识别的船舶类型
                  </p>
                </div>
                <Checkbox.Group
                  options={[
                    { label: '🚢 商船', value: 'commercial' },
                    { label: '🎣 渔船', value: 'fishing' },
                    { label: '⚓ 军舰', value: 'military' },
                    { label: '🛥️ 游艇', value: 'yacht' },
                    { label: '🚤 快艇', value: 'speedboat' }
                  ]}
                  defaultValue={['commercial', 'military', 'fishing']}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                />
                
                <Divider />
                
                <div style={{ marginBottom: 16 }}>
                  <Text strong>识别精度设置</Text>
                  <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 12px 0' }}>
                    设置AI识别的置信度阈值
                  </p>
                </div>
                <div>
                  <span>识别置信度: </span>
                  <Slider
                    min={0}
                    max={100}
                    defaultValue={85}
                    marks={{
                      0: '0%',
                      50: '50%',
                      85: '85%',
                      100: '100%'
                    }}
                    tooltip={{ formatter: (value) => `${value}%` }}
                  />
                </div>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="🎯 跟踪优先级规则" style={{ height: '100%' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>多目标冲突处理策略</Text>
                  <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 12px 0' }}>
                    当监控范围内出现多个目标时的处理方式
                  </p>
                </div>
                <Radio.Group 
                  value={priorityStrategy}
                  onChange={(e) => setPriorityStrategy(e.target.value)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <Radio value="priority">
                    <div>
                      <div style={{ fontWeight: 500 }}>按优先级顺序</div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        当前顺序：{shipTypePriority
                          .map(ship => ship.name.replace(/[⚓🚢🎣🛥️]/g, '').trim())
                          .join(' > ')
                        }
                      </div>
                      <Button 
                        size="small" 
                        type="link" 
                        style={{ padding: 0, fontSize: '12px' }}
                        onClick={() => setPriorityModalVisible(true)}
                      >
                        📝 自定义优先级配置
                      </Button>
                    </div>
                  </Radio>
                  <Radio value="distance">
                    <div>
                      <div style={{ fontWeight: 500 }}>按距离远近</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        优先跟踪距离最近的目标
                      </div>
                    </div>
                  </Radio>
                  <Radio value="size">
                    <div>
                      <div style={{ fontWeight: 500 }}>按目标大小</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        优先跟踪体积最大的目标
                      </div>
                    </div>
                  </Radio>
                </Radio.Group>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="⚙️ 跟踪参数设置">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>跟踪持续时间</Text>
                    </div>
                    <InputNumber
                      min={10}
                      max={300}
                      defaultValue={60}
                      addonAfter="秒"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>跟踪丢失重试次数</Text>
                    </div>
                    <InputNumber
                      min={1}
                      max={10}
                      defaultValue={3}
                      addonAfter="次"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>目标切换延迟</Text>
                    </div>
                    <InputNumber
                      min={1}
                      max={30}
                      defaultValue={5}
                      addonAfter="秒"
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => message.info('配置已重置为默认值')}>
                重置默认
              </Button>
              <Button 
                type="primary" 
                onClick={() => {
                  const priorityText = shipTypePriority
                    .map(ship => ship.name.replace(/[⚓🚢🎣🛥️]/g, '').trim())
                    .join(' > ');
                  message.success(`自动跟踪配置已保存！当前优先级：${priorityText}`);
                }}
              >
                保存配置
              </Button>
            </Space>
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
              配置不同告警事件触发的CCTV自动联动动作，监控系统运行状态
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
            <Select placeholder="围栏名称" style={{ width: 160 }}>
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
      const onlineRate = 95.8; // 设备在线率
      const successRate = ((successful / total) * 100).toFixed(1);

      return { total, successful, partialSuccess, failed, onlineRate, successRate };
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
                <div className={styles.statValue} style={{ color: '#ff4d4f' }}>{stats.onlineRate}%</div>
                <div className={styles.statLabel}>设备在线率</div>
                <div style={{ fontSize: '12px', color: '#999' }}>设备运行状态</div>
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
                      <p><strong>事件ID：</strong>{fenceDetailModal.record.id || '未知'}</p>
                      <p><strong>事件时间：</strong>{fenceDetailModal.record.eventTime || '未知'}</p>
                      <p><strong>事件类型：</strong>
                        <Tag color={fenceDetailModal.record.eventType === '进入围栏' ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                          {fenceDetailModal.record.eventType || '未知'}
                        </Tag>
                      </p>
                      <p><strong>围栏名称：</strong>{fenceDetailModal.record.fenceName || '未知'}</p>
                      <p><strong>位置坐标：</strong>{fenceDetailModal.record.position || '未知'}</p>
                      <p><strong>处理状态：</strong>
                        <Tag
                          color={
                            fenceDetailModal.record.status === '未处理' ? 'red' :
                            fenceDetailModal.record.status === '已处理' ? 'orange' : 'green'
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {fenceDetailModal.record.status || '未知'}
                        </Tag>
                      </p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>🚢 船舶信息</h4>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                      <p><strong>船舶信息：</strong>{fenceDetailModal.record.ship || '未知'}</p>
                      <p><strong>船舶类型：</strong>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {fenceDetailModal.record.shipType || '未知'}
                        </Tag>
                      </p>
                      <p><strong>操作人员：</strong>{fenceDetailModal.record.operator || '系统'}</p>
                      <p><strong>备注信息：</strong>{fenceDetailModal.record.remark || '无备注'}</p>
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
      message: `船舶${record.ship1 || '未知'}，您当前存在碰撞风险，请立即调整航向！`
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
      priority: record.level === '高风险' ? 'high' : record.level === '中风险' ? 'medium' : 'low',
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
        remark: values.remark,
        priority: values.priority
      };
      
      console.log('处理记录:', processLog);
      
      setAlertProcessModal({ visible: false, record: null });
      alertProcessForm.resetFields();
      
    } catch (error) {
      message.error('处理失败，请重试');
    }
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
        channel: 'VHF16',
        status: '播报成功',
        operator: '张三',
        remark: '船舶已回应并调整航向',
        audioFile: 'broadcast_001.mp3'
      },
      {
        key: '2',
        id: 'VHF002',
        broadcastTime: '2024-01-15 15:15:33',
        content: '欢迎进入XX港，当前通航密度高，请保持VHF16频道守听',
        triggerEvent: '进港通告',
        targetShip: '船舶B (MMSI: 987654321)',
        channel: 'VHF16',
        status: '播报成功',
        operator: '系统',
        remark: '自动播报',
        audioFile: 'broadcast_002.mp3'
      }
    ];

    const columns = [
      {
        title: '播报ID',
        dataIndex: 'id',
        key: 'id',
        width: 100
      },
      {
        title: '播报时间',
        dataIndex: 'broadcastTime',
        key: 'broadcastTime',
        width: 160
      },
      {
        title: '播报内容',
        dataIndex: 'content',
        key: 'content',
        width: 300,
        ellipsis: true
      },
      {
        title: '触发事件',
        dataIndex: 'triggerEvent',
        key: 'triggerEvent',
        width: 120,
        render: (text) => <Tag color="blue">{text}</Tag>
      },
      {
        title: '目标船舶',
        dataIndex: 'targetShip',
        key: 'targetShip',
        width: 180
      },
      {
        title: '频道',
        dataIndex: 'channel',
        key: 'channel',
        width: 80
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <Tag color={status === '播报成功' ? 'green' : 'red'}>{status}</Tag>
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<SoundOutlined />}>回放</Button>
            <Button size="small" icon={<EyeOutlined />}>详情</Button>
            <Button size="small" icon={<DownloadOutlined />}>下载</Button>
          </Space>
        )
      }
    ];

    return (
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <h3>VHF播报台账</h3>
          <Space>
            <Search
              placeholder="搜索播报内容、船舶MMSI..."
              allowClear
              style={{ width: 300 }}
              onSearch={(value) => setLedgerSearchText(value)}
            />
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button type="primary" icon={<DownloadOutlined />}>批量导出</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue}>43</div>
                <div className={styles.statLabel}>今日播报次数</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue}>41</div>
                <div className={styles.statLabel}>播报成功</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue}>2</div>
                <div className={styles.statLabel}>播报失败</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div className={styles.statItem}>
                <div className={styles.statValue}>95%</div>
                <div className={styles.statLabel}>成功率</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={mockData}
            loading={ledgerLoading}
            scroll={{ x: 1200 }}
            pagination={{
              total: mockData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        </Card>
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
            <p><strong>船舶信息：</strong>{record.ship1 || '未知'}</p>
            <p><strong>事件类型：</strong>{record.alertType || '未知'}</p>
            <p><strong>围栏类型：</strong>{record.fenceType || '未知'}</p>
            <p><strong>动作类型：</strong>{record.fenceAction || '未知'}</p>
            <p><strong>位置坐标：</strong>{record.position || '未知'}</p>
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
            message.success(`已向${record.ship1 || '未知船舶'}发送警告信息`);
            
            // 更新记录状态
            const updatedRecord = {
              ...record,
              status: '已处理',
              operator: '当前用户',
              remark: `${record.remark || ''} | 已发送立即警告 (${new Date().toLocaleString()})`
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
                      <p><strong>预警ID：</strong>{realtimeDetailModal.record.id || '未知'}</p>
                      <p><strong>预警时间：</strong>{realtimeDetailModal.record.alertTime || '未知'}</p>
                      <p><strong>预警类型：</strong>
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          {realtimeDetailModal.record.alertType || '未知'}
                        </Tag>
                      </p>
                      <p><strong>位置坐标：</strong>{realtimeDetailModal.record.position || '未知'}</p>
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
                            {realtimeDetailModal.record.level || '未知'}
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
                      <p><strong>船舶信息：</strong>{realtimeDetailModal.record.ship1 || '未知'}</p>
                      {realtimeDetailModal.record.ship2 && (
                        <p><strong>目标船舶：</strong>{realtimeDetailModal.record.ship2 || '未知'}</p>
                      )}
                      <p><strong>处理人员：</strong>{realtimeDetailModal.record.operator || '系统'}</p>
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
                              {realtimeDetailModal.record.meetDistance || '未知'}
                            </span>
                          </p>
                          <p><strong>预计会遇时间：</strong>
                            <span style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                              {realtimeDetailModal.record.meetTime || '未知'}
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
                              {realtimeDetailModal.record.deviationDistance || '未知'}
                            </span>
                          </p>
                          <p><strong>偏航时长：</strong>
                            <span style={{ color: '#faad14', fontWeight: 'bold', marginLeft: 8 }}>
                              {realtimeDetailModal.record.deviationTime || '未知'}
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
                              {realtimeDetailModal.record.fenceType || '未知'}
                            </Tag>
                          </p>
                          <p><strong>动作类型：</strong>
                            <Tag
                              color={realtimeDetailModal.record.fenceAction === '闯入' ? 'red' : 'green'}
                              style={{ marginLeft: 8 }}
                            >
                              {realtimeDetailModal.record.fenceAction || '未知'}
                            </Tag>
                          </p>
                        </Col>
                        <Col span={12}>
                          <p><strong>围栏名称：</strong>禁航区-A1</p>
                          <p><strong>进入时间：</strong>{realtimeDetailModal.record.alertTime || '未知'}</p>
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
                              {realtimeDetailModal.record.targetType || '未知'}
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
                    {realtimeDetailModal.record.alertTime || '未知'} - 系统自动检测到{realtimeDetailModal.record.alertType || '未知告警'}
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
                      {new Date().toLocaleString()} - {realtimeDetailModal.record.operator || '系统'}处理了此事件
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
                    <p><strong>船舶1：</strong>{emergencyContactModal.record.ship1 || '未知'}</p>
                    <p><strong>船舶2：</strong>{emergencyContactModal.record.ship2 || '未知'}</p>
                    <p><strong>预计会遇距离：</strong>
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        {emergencyContactModal.record.meetDistance || '未知'}
                      </span>
                    </p>
                    <p><strong>预计会遇时间：</strong>
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        {emergencyContactModal.record.meetTime || '未知'}
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
                    <p><strong>偏航船舶：</strong>{routeGuidanceModal.record.ship1 || '未知'}</p>
                    <p><strong>偏航距离：</strong>
                      <span style={{ color: '#faad14', fontWeight: 'bold' }}>
                        {routeGuidanceModal.record.deviationDistance || '未知'}
                      </span>
                    </p>
                    <p><strong>偏航时长：</strong>
                      <span style={{ color: '#faad14', fontWeight: 'bold' }}>
                        {routeGuidanceModal.record.deviationTime || '未知'}
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
                    <p><strong>目标船舶：</strong>{continuousMonitorModal.record.ship1 || '未知'}</p>
                    <p><strong>目标类型：</strong>
                      <Tag color={
                        continuousMonitorModal.record.targetType === '军用船舶' ? 'red' :
                        continuousMonitorModal.record.targetType === '高危船舶' ? 'orange' : 'blue'
                      }>
                        {continuousMonitorModal.record.targetType || '未知'}
                      </Tag>
                    </p>
                    <p><strong>当前位置：</strong>{continuousMonitorModal.record.position || '未知'}</p>
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
                    <p><strong>预警ID：</strong>{alertProcessModal.record.id || '未知'}</p>
                    <p><strong>船舶：</strong>{alertProcessModal.record.ship1 || '未知'}</p>
                    <p><strong>预警类型：</strong>{alertProcessModal.record.alertType || '未知'}</p>
                    {alertProcessModal.record.level && (
                      <p><strong>风险等级：</strong>
                        <Tag color={
                          alertProcessModal.record.level === '高风险' ? 'red' :
                          alertProcessModal.record.level === '中风险' ? 'orange' : 'green'
                        }>
                          {alertProcessModal.record.level || '未知'}
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

  // 船型优先级配置弹窗
  const renderPriorityModal = () => (
    <Modal
      title="🚢 船型优先级配置"
      open={priorityModalVisible}
      onCancel={() => setPriorityModalVisible(false)}
      width={600}
      footer={[
        <Button key="reset" onClick={resetPriority}>
          重置默认
        </Button>,
        <Button key="cancel" onClick={() => setPriorityModalVisible(false)}>
          取消
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={() => {
            const priorityText = shipTypePriority
              .map(ship => ship.name.replace(/[⚓🚢🎣🛥️]/g, '').trim())
              .join(' > ');
            message.success(`优先级配置已保存！当前顺序：${priorityText}`);
            setPriorityModalVisible(false);
          }}
        >
          保存配置
        </Button>
      ]}
    >
      <Alert 
        message="拖拽提示" 
        description="您可以通过拖拽下方的船型卡片来调整跟踪优先级顺序，越靠上的船型优先级越高。" 
        type="info" 
        showIcon 
        style={{ marginBottom: 16 }}
      />

      <div style={{ 
        background: '#fafafa', 
        padding: '16px', 
        borderRadius: '6px',
        border: '2px dashed #d9d9d9',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {shipTypePriority.map((ship, index) => (
          <div
            key={ship.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', index.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
              const hoverIndex = index;
              if (dragIndex !== hoverIndex) {
                moveShipType(dragIndex, hoverIndex);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              margin: '8px 0',
              background: '#fff',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              cursor: 'grab',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(24,144,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d9d9d9';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1890ff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              marginRight: '12px'
            }}>
              {ship.priority}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '16px' }}>
                {ship.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                优先级：第 {ship.priority} 位
              </div>
            </div>
            <div style={{ fontSize: '18px', color: '#999', cursor: 'grab' }}>
              ⋮⋮
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: '12px', color: '#999' }}>
        <Text>💡 提示：当前配置的优先级顺序为：</Text>
        <div style={{ marginTop: 4, color: '#1890ff', fontWeight: 500 }}>
          {shipTypePriority
            .map(ship => ship.name.replace(/[⚓🚢🎣🛥️]/g, '').trim())
            .join(' > ')
          }
        </div>
      </div>
    </Modal>
  );

  // 救援资源管理相关状态
  const [rescueTeamModalVisible, setRescueTeamModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [suppliesModalVisible, setSuppliesModalVisible] = useState(false);
  const [suppliesDetailModalVisible, setSuppliesDetailModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedSuppliesDetail, setSelectedSuppliesDetail] = useState(null);
  const [teamSearchText, setTeamSearchText] = useState('');
  const [teamTypeFilter, setTeamTypeFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [isEditingSupplies, setIsEditingSupplies] = useState(false);

  // 地图相关状态
  const [mapLatitude, setMapLatitude] = useState('');
  const [mapLongitude, setMapLongitude] = useState('');

  // 智能匹配相关状态
  const [smartMatchModalVisible, setSmartMatchModalVisible] = useState(false);
  const [matchConditions, setMatchConditions] = useState({
    accidentLat: '',
    accidentLng: '',
    rescueType: [],
    urgencyLevel: 'normal',
    requiredCertifications: [],
    maxDistance: 5,
    minTeamSize: 3
  });
  const [matchResults, setMatchResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // 处理地图位置变化
  const handleMapLocationChange = (lat, lng) => {
    const latStr = lat.toString();
    const lngStr = lng.toString();
    setMapLatitude(latStr);
    setMapLongitude(lngStr);

    // 同步更新表单字段
    teamForm.setFieldsValue({
      latitude: latStr,
      longitude: lngStr
    });
  };
  const [teamForm] = Form.useForm();
  const [equipmentForm] = Form.useForm();
  const [suppliesForm] = Form.useForm();
  const [smartMatchForm] = Form.useForm();

  // 新增功能相关状态
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [equipmentApplyModalVisible, setEquipmentApplyModalVisible] = useState(false);
  const [stockInOutModalVisible, setStockInOutModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentTeamForMember, setCurrentTeamForMember] = useState(null);
  const [stockOperation, setStockOperation] = useState('in'); // 'in' 或 'out'
  const [selectedSuppliesItem, setSelectedSuppliesItem] = useState(null);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [isEditingTraining, setIsEditingTraining] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [memberSearchText, setMemberSearchText] = useState('');
  const [memberPositionFilter, setMemberPositionFilter] = useState('all');
  const [memberCertFilter, setMemberCertFilter] = useState('all');
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
  const [statisticsDateRange, setStatisticsDateRange] = useState([]);
  const [statisticsActiveTab, setStatisticsActiveTab] = useState('overview');
  const [statisticsFilters, setStatisticsFilters] = useState({
    teamType: 'all',
    equipmentType: 'all',
    suppliesCategory: 'all',
    timeRange: 'month'
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // 物资管理相关状态
  const [stockRecordsModalVisible, setStockRecordsModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [batchOperationModalVisible, setBatchOperationModalVisible] = useState(false);
  const [selectedSuppliesItems, setSelectedSuppliesItems] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);
  const [suppliesSearchText, setSuppliesSearchText] = useState('');
  const [suppliesCategoryFilter, setSuppliesCategoryFilter] = useState('all');
  const [suppliesStatusFilter, setSuppliesStatusFilter] = useState('all');

  // 救援队伍和队员数据状态管理
  const [rescueTeams, setRescueTeams] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  // 救援方案管理相关状态
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [planSearchText, setPlanSearchText] = useState('');
  const [planScenarioFilter, setPlanScenarioFilter] = useState('all');
  const [planDifficultyFilter, setPlanDifficultyFilter] = useState('all');
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [selectedManual, setSelectedManual] = useState(null);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [executionRecordModalVisible, setExecutionRecordModalVisible] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executePlanModalVisible, setExecutePlanModalVisible] = useState(false);
  const [selectedPlanForExecution, setSelectedPlanForExecution] = useState(null);

  // 执行记录详情相关状态
  const [editingStepId, setEditingStepId] = useState(null);
  const [stepNoteForm] = Form.useForm();
  const [improvementForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();
  const [fileUploadVisible, setFileUploadVisible] = useState(false);
  const [previewFileModal, setPreviewFileModal] = useState({ visible: false, type: '', src: '', title: '' });

  // 执行记录状态管理 - 将静态数据改为状态
  const [executionRecords, setExecutionRecords] = useState([
    {
      id: 'exec001',
      planId: 'plan001',
      planName: '离岸10米内救援方案',
      executionDate: '2024-01-20 14:30:00',
      location: '东港区码头',
      weather: '晴天，微风',
      waterConditions: '水深2米，流速0.3m/s',
      rescueTeam: '东港救援队',
      teamLeader: '张队长',
      participants: ['李救生员', '王医护', '陈操作员'],
      victim: {
        age: 35,
        gender: '男',
        condition: '意识清醒',
        cause: '意外落水'
      },
      executionSteps: [
        { stepId: 1, startTime: '14:30:00', endTime: '14:31:30', status: 'completed', notes: '现场评估完成，落水者状态良好', statusChangedBy: '张队长', statusChangedTime: '2024-01-20 14:31:30' },
        { stepId: 2, startTime: '14:31:30', endTime: '14:32:15', status: 'completed', notes: '救生圈成功抛投，落水者抓住', statusChangedBy: '李救生员', statusChangedTime: '2024-01-20 14:32:15' },
        { stepId: 3, startTime: '14:32:15', endTime: '14:34:45', status: 'completed', notes: '拖拽过程顺利', statusChangedBy: '李救生员', statusChangedTime: '2024-01-20 14:34:45' },
        { stepId: 4, startTime: '14:34:45', endTime: '14:38:00', status: 'completed', notes: '上岸后检查，无明显外伤', statusChangedBy: '王医护', statusChangedTime: '2024-01-20 14:38:00' }
      ],
      totalTime: '7分钟30秒',
      result: 'success',
      successRate: 100,
      improvements: ['可以增加一名备用抛投手', '建议配备更长的拖拽绳'],
      feedback: '方案执行顺利，救援及时有效',
      mediaFiles: ['现场照片1.jpg', '救援视频.mp4'],
      reportedBy: '张队长',
      reviewedBy: '救援中心主任',
      status: 'reviewed'
    },
    {
      id: 'exec002',
      planId: 'plan002',
      planName: '急流救援方案',
      executionDate: '2024-01-18 16:45:00',
      location: '主航道急流段',
      weather: '多云，东风3级',
      waterConditions: '水深5米，流速1.2m/s',
      rescueTeam: '专业救援队',
      teamLeader: '刘队长',
      participants: ['无人机操作员小王', '救生艇驾驶员老李', '救生员小张', '救生员小陈', '医护人员小赵'],
      victim: {
        age: 28,
        gender: '女',
        condition: '体力不支',
        cause: '游泳时被急流冲走'
      },
      executionSteps: [
        { stepId: 1, startTime: '16:45:00', endTime: '16:47:30', status: 'completed', notes: '无人机成功定位，水流情况复杂', statusChangedBy: '小王', statusChangedTime: '2024-01-18 16:47:30' },
        { stepId: 2, startTime: '16:47:30', endTime: '16:51:00', status: 'completed', notes: '救生艇部署到位', statusChangedBy: '老李', statusChangedTime: '2024-01-18 16:51:00' },
        { stepId: 3, startTime: '16:51:00', endTime: '16:52:30', status: 'partial_success', notes: '部分成功：浮具抛投成功但落水者未能及时抓住，需要第二次抛投', statusChangedBy: '小张', statusChangedTime: '2024-01-18 16:52:30' },
        { stepId: 4, startTime: '16:52:30', endTime: '16:58:15', status: 'completed', notes: '接应过程中遇到困难，多次尝试后成功', statusChangedBy: '小陈', statusChangedTime: '2024-01-18 16:58:15' },
        { stepId: 5, startTime: '16:58:15', endTime: '17:05:00', status: 'completed', notes: '救护及时，送医途中', statusChangedBy: '小赵', statusChangedTime: '2024-01-18 17:05:00' }
      ],
      totalTime: '20分钟',
      result: 'partial',
      successRate: 90,
      improvements: ['需要增加备用救生艇', '建议改进抛投浮具的设计', '加强急流救援训练'],
      feedback: '方案整体有效，但执行时间略长，需要优化',
      mediaFiles: ['无人机录像.mp4', '救援过程.mp4', '现场照片.jpg'],
      reportedBy: '刘队长',
      reviewedBy: '救援中心主任',
      status: 'reviewed'
    },
    {
      id: 'exec003',
      planId: 'plan001',
      planName: '离岸10米内救援方案',
      executionDate: '2024-01-22 10:15:00',
      location: '西港区浅水区',
      weather: '阴天，小雨',
      waterConditions: '水深1.5米，流速0.2m/s',
      rescueTeam: '西港救援队',
      teamLeader: '王队长',
      participants: ['赵救生员', '孙医护', '周操作员'],
      victim: {
        age: 42,
        gender: '男',
        condition: '轻微呛水',
        cause: '钓鱼时意外落水'
      },
      executionSteps: [
        { stepId: 1, startTime: '10:15:00', endTime: '10:16:15', status: 'completed', notes: '现场评估完成，天气条件不佳但可执行', statusChangedBy: '王队长', statusChangedTime: '2024-01-22 10:16:15' },
        { stepId: 2, startTime: '10:16:15', endTime: '10:17:30', status: 'failed', notes: '执行失败：第一次抛投因风向偏差失败', statusChangedBy: '赵救生员', statusChangedTime: '2024-01-22 10:17:30' },
        { stepId: 3, startTime: '10:17:30', endTime: '10:19:45', status: 'completed', notes: '第二次抛投成功，落水者抓住救生圈', statusChangedBy: '赵救生员', statusChangedTime: '2024-01-22 10:19:45' },
        { stepId: 4, startTime: '10:19:45', endTime: '10:22:30', status: 'partial_success', notes: '部分成功：拖拽过程中救生圈有轻微漏气，但成功上岸', statusChangedBy: '周操作员', statusChangedTime: '2024-01-22 10:22:30' }
      ],
      totalTime: '7分钟30秒',
      result: 'partial',
      successRate: 75,
      improvements: ['需要检查救生圈质量', '雨天作业需要更好的防滑措施', '建议配备备用救生圈'],
      feedback: '虽然遇到一些困难，但最终成功救援，需要改进设备质量',
      mediaFiles: ['雨天救援.mp4', '设备检查.jpg'],
      reportedBy: '王队长',
      reviewedBy: '救援中心主任',
      status: 'reviewed'
    }
  ]);

  const [memberForm] = Form.useForm();
  const [trainingForm] = Form.useForm();
  const [applyForm] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [planForm] = Form.useForm();
  const [manualForm] = Form.useForm();
  const [executionForm] = Form.useForm();
  const [executePlanForm] = Form.useForm();

  // 初始化救援队伍和队员数据
  useEffect(() => {
    console.log('组件初始化，开始加载数据...');
    initializeRescueData();

    // 强制初始化智能匹配功能
    console.log('初始化智能匹配功能...');
    console.log('smartMatchModalVisible初始状态:', smartMatchModalVisible);
  }, []);

  // 确保智能匹配功能在组件加载后立即可用
  useEffect(() => {
    console.log('智能匹配功能检查...');
    console.log('handleSmartMatch函数类型:', typeof handleSmartMatch);
    console.log('smartMatchModalVisible状态:', smartMatchModalVisible);

    // 测试函数是否可调用
    if (typeof handleSmartMatch === 'function') {
      console.log('✅ handleSmartMatch函数已正确初始化');
    } else {
      console.log('❌ handleSmartMatch函数未正确初始化');
    }
  }, [handleSmartMatch, smartMatchModalVisible]);





  // 初始化数据函数
  const initializeRescueData = () => {
    // 初始化队员数据
    const initialMembers = [
      // 港口专业救援队队员
      {
        id: 'member_1_1',
        teamId: '1',
        name: '张三',
        position: '队长',
        certifications: ['急救证', '救生员证'],
        experience: '8年',
        phone: '13800138001',
        age: 35,
        gender: '男',
        joinDate: '2016-03-15',
        certExpiry: {
          '急救证': '2024-12-31',
          '救生员证': '2024-08-15'
        }
      },
      {
        id: 'member_1_2',
        teamId: '1',
        name: '李四',
        position: '副队长',
        certifications: ['急救证', '潜水证'],
        experience: '6年',
        phone: '13800138002',
        age: 32,
        gender: '男',
        joinDate: '2018-06-20',
        certExpiry: {
          '急救证': '2024-10-20',
          '潜水证': '2025-03-10'
        }
      },
      {
        id: 'member_1_3',
        teamId: '1',
        name: '王五',
        position: '队员',
        certifications: ['急救证'],
        experience: '3年',
        phone: '13800138003',
        age: 28,
        gender: '男',
        joinDate: '2021-01-10',
        certExpiry: {
          '急救证': '2024-06-30'
        }
      },
      // 添加第二个队长用于测试多队长功能
      {
        id: 'member_1_4',
        teamId: '1',
        name: '马八',
        position: '队长',
        certifications: ['急救证', '救生员证', '潜水证'],
        experience: '7年',
        phone: '13800138008',
        age: 33,
        gender: '男',
        joinDate: '2017-09-15',
        certExpiry: {
          '急救证': '2024-11-30',
          '救生员证': '2024-12-15',
          '潜水证': '2025-04-20'
        }
      },
      // 海事志愿者队伍队员
      {
        id: 'member_2_1',
        teamId: '2',
        name: '刘一',
        position: '队长',
        certifications: ['急救证'],
        experience: '4年',
        phone: '13800138004',
        age: 30,
        gender: '男',
        joinDate: '2020-05-10',
        certExpiry: {
          '急救证': '2024-11-15'
        }
      },
      {
        id: 'member_2_2',
        teamId: '2',
        name: '陈二',
        position: '队员',
        certifications: ['急救证'],
        experience: '2年',
        phone: '13800138005',
        age: 26,
        gender: '女',
        joinDate: '2022-03-20',
        certExpiry: {
          '急救证': '2024-09-30'
        }
      },
      // 添加第二个队长用于测试多队长功能
      {
        id: 'member_2_3',
        teamId: '2',
        name: '周九',
        position: '队长',
        certifications: ['急救证', '救生员证'],
        experience: '5年',
        phone: '13800138009',
        age: 31,
        gender: '女',
        joinDate: '2019-11-10',
        certExpiry: {
          '急救证': '2024-10-31',
          '救生员证': '2025-01-15'
        }
      },
      // 专业潜水救援队队员
      {
        id: 'member_3_1',
        teamId: '3',
        name: '赵六',
        position: '队长',
        certifications: ['急救证', '潜水证'],
        experience: '10年',
        phone: '13800138006',
        age: 38,
        gender: '男',
        joinDate: '2014-01-15',
        certExpiry: {
          '急救证': '2024-12-20',
          '潜水证': '2025-06-30'
        }
      },
      {
        id: 'member_3_2',
        teamId: '3',
        name: '孙七',
        position: '队员',
        certifications: ['潜水证'],
        experience: '5年',
        phone: '13800138007',
        age: 29,
        gender: '男',
        joinDate: '2019-08-10',
        certExpiry: {
          '潜水证': '2025-02-28'
        }
      }
    ];

    setAllMembers(initialMembers);

    // 初始化救援队伍数据（动态计算人员数量）
    const initialTeams = [
      {
        id: '1',
        name: '港口专业救援队',
        type: 'professional',
        memberCount: initialMembers.filter(m => m.teamId === '1').length,
        location: '东港区救援站',
        distance: '0.5km',
        certifications: ['急救证', '救生员证', '潜水证'],
        specialties: ['静水救援', '急流救援'],
        status: '值班中',
        contact: '13800138001',
        leader: '张三',
        responseTime: 5,
        lastTraining: '2024-01-15',
        equipment: ['救生艇', '潜水设备', '急救包', '通讯设备'],
        latitude: '36.0986',
        longitude: '120.3719'
      },
      {
        id: '2',
        name: '海事志愿者队伍',
        type: 'volunteer',
        memberCount: initialMembers.filter(m => m.teamId === '2').length,
        location: '中央码头',
        distance: '1.2km',
        certifications: ['急救证'],
        specialties: ['静水救援'],
        status: '待命',
        contact: '13800138002',
        leader: '刘一',
        responseTime: 8,
        lastTraining: '2024-01-10',
        equipment: ['救生圈', '急救包', '对讲机'],
        latitude: '36.1056',
        longitude: '120.3825'
      },
      {
        id: '3',
        name: '专业潜水救援队',
        type: 'professional',
        memberCount: initialMembers.filter(m => m.teamId === '3').length,
        location: '西港区',
        distance: '2.1km',
        certifications: ['急救证', '救生员证', '潜水证', '水下焊接证'],
        specialties: ['水下救援', '急流救援'],
        status: '训练中',
        contact: '13800138003',
        leader: '赵六',
        responseTime: 10,
        lastTraining: '2024-01-20',
        equipment: ['专业潜水设备', '水下切割工具', '水下照明设备', '救生艇', '急救包'],
        latitude: '36.0825',
        longitude: '120.3456'
      }
    ];



    setRescueTeams(initialTeams);
    setAllMembers(initialMembers);
    // 强制刷新表格
    setTableRefreshKey(prev => prev + 1);
  };

  // 队员管理函数
  const addMember = (teamId, memberData) => {
    const newMember = {
      ...memberData,
      id: `member_${teamId}_${Date.now()}`,
      teamId: teamId,
      joinDate: memberData.joinDate || new Date().toISOString().split('T')[0],
      certifications: Array.isArray(memberData.certifications) ? memberData.certifications : [],
      certExpiry: memberData.certExpiry || {}
    };

    setAllMembers(prevMembers => {
      const updatedMembers = [...prevMembers, newMember];

      // 立即更新队伍人员数量
      setTimeout(() => {
        updateTeamMemberCount(teamId, updatedMembers);
        // 强制刷新表格
        setTableRefreshKey(prev => prev + 1);
      }, 0);
      return updatedMembers;
    });

    return newMember;
  };

  const updateMember = (memberId, memberData) => {
    setAllMembers(prevMembers => {
      const updatedMembers = prevMembers.map(member =>
        member.id === memberId ? {
          ...member,
          ...memberData,
          certifications: Array.isArray(memberData.certifications) ? memberData.certifications : member.certifications || [],
          certExpiry: memberData.certExpiry || member.certExpiry || {}
        } : member
      );

      // 如果更新的是队长信息，强制刷新表格
      const updatedMember = updatedMembers.find(m => m.id === memberId);

      if (updatedMember && updatedMember.teamId) {
        setTimeout(() => {
          updateTeamMemberCount(updatedMember.teamId, updatedMembers);
          // 强制刷新表格
          setTableRefreshKey(prev => prev + 1);
        }, 0);
      }

      return updatedMembers;
    });
  };

  const deleteMember = (memberId) => {
    setAllMembers(prevMembers => {
      const memberToDelete = prevMembers.find(m => m.id === memberId);
      const updatedMembers = prevMembers.filter(member => member.id !== memberId);

      if (memberToDelete) {
        updateTeamMemberCount(memberToDelete.teamId, updatedMembers);
      }

      return updatedMembers;
    });
  };

  // 更新队伍人员数量
  const updateTeamMemberCount = (teamId, members = allMembers) => {
    const memberCount = members.filter(member => member.teamId === teamId).length;

    setRescueTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId ? { ...team, memberCount } : team
      )
    );
  };

  // 获取队伍所有队长信息
  const getTeamLeaders = (teamId) => {
    const teamMembers = allMembers.filter(member => member.teamId === teamId);
    const leaders = teamMembers.filter(member => member.position === '队长');
    return leaders;
  };

  // 获取队伍联系方式（所有队长的手机号）
  const getTeamContact = (teamId) => {
    const leaders = getTeamLeaders(teamId);
    if (leaders.length === 0) return '暂无';
    return leaders.map(leader => leader.phone).join('、');
  };

  // 获取指定队伍的队员列表
  const getTeamMembers = (teamId) => {
    return allMembers.filter(member => member.teamId === teamId);
  };

  // 模拟救援队伍数据（保持向后兼容）
  const rescueTeamsData = useMemo(() => {
    if (rescueTeams.length === 0) {
      return [];
    }

    const result = rescueTeams.map(team => {
      const teamMembers = allMembers.filter(member => member.teamId === team.id);
      const leaders = allMembers.filter(member => member.teamId === team.id && member.position === '队长');

      return {
        ...team,
        // 确保队伍数据包含最新的队员信息
        actualMemberCount: teamMembers.length,
        leaders: leaders
      };
    });

    return result;
  }, [rescueTeams, allMembers, tableRefreshKey]);

  // 模拟设备台账数据
  const equipmentData = [
    {
      id: '1',
      name: '救生艇-001',
      type: 'boat',
      model: 'RB-480',
      status: '闲置',
      location: '东港区救援站',
      fuelLevel: '85%',
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-04-08',
      operator: '',
      specifications: '长4.8米，载重8人',
      condition: '良好'
    },
    {
      id: '2',
      name: '救生艇-002',
      type: 'boat',
      model: 'RB-520',
      status: '在用',
      location: '海上巡逻',
      fuelLevel: '60%',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-04-05',
      operator: '张三',
      specifications: '长5.2米，载重10人',
      condition: '良好'
    },
    {
      id: '3',
      name: '无人机-DJI001',
      type: 'drone',
      model: 'DJI Matrice 300',
      status: '闲置',
      location: '中央码头',
      batteryLevel: '100%',
      flightTime: '45分钟',
      cameraType: '热成像+可见光',
      lastMaintenance: '2024-01-10',
      condition: '优秀'
    },
    {
      id: '4',
      name: 'AED-001',
      type: 'medical',
      model: 'Philips HeartStart',
      status: '闲置',
      location: '东港区救援站',
      batteryLevel: '90%',
      lastCheck: '2024-01-15',
      nextCheck: '2024-02-15',
      condition: '良好'
    }
  ];

  // 模拟物资储备数据
  const [suppliesData, setSuppliesData] = useState([
    {
      id: '1',
      name: '救生圈',
      category: '救生设备',
      currentStock: 25,
      minStock: 20,
      maxStock: 50,
      location: '东港区仓库A',
      unit: '个',
      lastUpdate: '2024-01-15',
      supplier: '海事装备公司',
      status: 'normal',
      price: 150.00,
      specifications: '直径70cm，橙色，符合IMO标准'
    },
    {
      id: '2',
      name: '保暖毯',
      category: '应急物资',
      currentStock: 8,
      minStock: 15,
      maxStock: 30,
      location: '中央码头仓库',
      unit: '条',
      lastUpdate: '2024-01-14',
      supplier: '应急物资供应商',
      status: 'low',
      price: 45.00,
      specifications: '150x200cm，铝箔材质，防水'
    },
    {
      id: '3',
      name: '救生衣',
      category: '救生设备',
      currentStock: 45,
      minStock: 30,
      maxStock: 80,
      location: '西港区仓库',
      unit: '件',
      lastUpdate: '2024-01-13',
      supplier: '海事装备公司',
      status: 'normal',
      price: 280.00,
      specifications: '成人款，浮力≥75N，CE认证'
    },
    {
      id: '4',
      name: '应急照明灯',
      category: '照明设备',
      currentStock: 2,
      minStock: 5,
      maxStock: 15,
      location: '东港区仓库B',
      unit: '台',
      lastUpdate: '2024-01-12',
      supplier: '照明设备厂',
      status: 'critical',
      price: 320.00,
      specifications: 'LED光源，防水等级IP67，续航8小时'
    },
    {
      id: '5',
      name: '急救包',
      category: '医疗用品',
      currentStock: 18,
      minStock: 15,
      maxStock: 30,
      location: '东港区仓库B',
      unit: '套',
      lastUpdate: '2024-01-15',
      supplier: '医疗器械公司',
      status: 'normal',
      price: 180.00,
      specifications: '包含绷带、消毒液、止血贴等基础用品'
    }
  ]);

  // 出入库记录数据
  const [stockRecordsData, setStockRecordsData] = useState([
    {
      id: 'SR001',
      suppliesId: '1',
      suppliesName: '救生圈',
      type: 'out',
      quantity: 5,
      operationTime: '2024-01-15 14:30:00',
      operator: '张三',
      reason: '应急救援任务',
      recipient: '李四',
      approver: '王五',
      location: '东港区仓库A',
      remark: '紧急调用，用于海上救援',
      status: 'completed'
    },
    {
      id: 'SR002',
      suppliesId: '2',
      suppliesName: '保暖毯',
      type: 'in',
      quantity: 20,
      operationTime: '2024-01-14 09:15:00',
      operator: '赵六',
      supplier: '应急物资供应商',
      inspector: '钱七',
      qualityStatus: 'qualified',
      location: '中央码头仓库',
      remark: '定期补充库存',
      status: 'completed'
    },
    {
      id: 'SR003',
      suppliesId: '4',
      suppliesName: '应急照明灯',
      type: 'out',
      quantity: 2,
      operationTime: '2024-01-13 16:45:00',
      operator: '孙八',
      reason: '设备维护',
      recipient: '周九',
      approver: '吴十',
      location: '中央码头仓库',
      remark: '送修检测',
      status: 'completed'
    }
  ]);

  // 渲染救援资源管理页面
  const renderRescueResources = () => (
    <div className={styles.dashboardContent}>
      {/* 数据统计面板 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {rescueTeamsData.length}
              </div>
              <div style={{ color: '#666' }}>救援队伍总数</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                值班中: {rescueTeamsData.filter(t => t.status === '值班中').length}队
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {rescueTeamsData.reduce((sum, team) => sum + team.actualMemberCount, 0)}
              </div>
              <div style={{ color: '#666' }}>救援人员总数</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                实时统计数据
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {equipmentData.length}
              </div>
              <div style={{ color: '#666' }}>设备总数</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                可用: {equipmentData.filter(e => e.status === '闲置').length}台
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {suppliesData.filter(s => s.status !== 'normal').length}
              </div>
              <div style={{ color: '#666' }}>库存预警</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                紧急: {suppliesData.filter(s => s.status === 'critical').length}项
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="🚑 救援资源管理" extra={
        <Space>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setStatisticsModalVisible(true)}
          >
            统计报表
          </Button>
          <Button icon={<DownloadOutlined />}>导出资源清单</Button>
        </Space>
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
            children: renderTeamsTab()
          },
          {
            key: 'equipment',
            label: (
              <span>
                <ToolOutlined />
                设备台账
              </span>
            ),
            children: renderEquipmentTab()
          },
          {
            key: 'supplies',
            label: (
              <span>
                <InboxOutlined />
                物资储备
              </span>
            ),
            children: renderSuppliesTab()
          }
        ]} />
      </Card>

      {/* 救援队伍详情/编辑弹窗 */}
      {renderTeamModal()}

      {/* 队员管理弹窗 */}
      {renderMemberModal()}

      {/* 培训记录弹窗 */}
      {renderTrainingModal()}

      {/* 设备详情/编辑弹窗 */}
      {renderEquipmentModal()}

      {/* 设备申领弹窗 */}
      {renderEquipmentApplyModal()}

      {/* 物资详情/编辑弹窗 */}
      {renderSuppliesModal()}

      {/* 物资详情查看弹窗 */}
      {renderSuppliesDetailModal()}

      {/* 出入库弹窗 */}
      {renderStockInOutModal()}

      {/* 出入库记录弹窗 */}
      {renderStockRecordsModal()}

      {/* 批量操作弹窗 */}
      {renderBatchOperationModal()}

      {/* 库存盘点弹窗 */}
      {renderInventoryModal()}
    </div>
  );

  // 智能匹配相关函数
  // 打开智能匹配弹窗
  const handleSmartMatch = useCallback(() => {
    console.log('智能匹配按钮被点击，当前状态:', smartMatchModalVisible);
    console.log('准备打开弹窗...');
    setSmartMatchModalVisible(true);
    console.log('弹窗状态已设置为true');
  }, [smartMatchModalVisible]);

  // 计算两点间距离（简化版，实际应使用更精确的地理计算）
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 999;

    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 智能匹配算法
  const performSmartMatch = async (conditions) => {
    setMatchLoading(true);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      const results = rescueTeams.map(team => {
        // 1. 计算距离
        const distance = calculateDistance(
          parseFloat(conditions.accidentLat),
          parseFloat(conditions.accidentLng),
          parseFloat(team.latitude || '36.0986'),
          parseFloat(team.longitude || '120.3719')
        );

        // 2. 检查距离限制
        if (distance > conditions.maxDistance) {
          return null;
        }

        // 3. 检查队伍状态可用性
        const statusScore = team.status === '值班中' ? 100 :
                           team.status === '待命' ? 80 :
                           team.status === '训练中' ? 40 : 20;

        // 4. 计算技能匹配度
        const teamSpecialties = team.specialties || [];
        const requiredTypes = conditions.rescueType || [];
        const skillMatchCount = requiredTypes.filter(type =>
          teamSpecialties.includes(type)
        ).length;
        const skillScore = requiredTypes.length > 0 ?
          (skillMatchCount / requiredTypes.length) * 100 : 50;

        // 5. 检查认证要求
        const teamCerts = team.certifications || [];
        const requiredCerts = conditions.requiredCertifications || [];
        const certMatchCount = requiredCerts.filter(cert =>
          teamCerts.includes(cert)
        ).length;
        const certScore = requiredCerts.length > 0 ?
          (certMatchCount / requiredCerts.length) * 100 : 100;

        // 6. 检查队员数量
        const teamSize = allMembers.filter(member => member.teamId === team.id).length;
        if (teamSize < conditions.minTeamSize) {
          return null;
        }

        // 7. 计算响应时间（基于距离和紧急程度）
        const baseTime = distance * 2; // 假设每公里2分钟
        const urgencyMultiplier = conditions.urgencyLevel === 'critical' ? 0.7 :
                                 conditions.urgencyLevel === 'urgent' ? 0.85 : 1.0;
        const responseTime = Math.round(baseTime * urgencyMultiplier);

        // 8. 综合评分
        const distanceScore = Math.max(0, 100 - (distance / conditions.maxDistance) * 50);
        const timeScore = Math.max(0, 100 - responseTime * 2);

        const totalScore = Math.round(
          (statusScore * 0.3 + skillScore * 0.25 + certScore * 0.2 +
           distanceScore * 0.15 + timeScore * 0.1)
        );

        return {
          ...team,
          distance: distance.toFixed(1),
          responseTime: `${responseTime}分钟`,
          matchScore: totalScore,
          statusScore,
          skillScore,
          certScore,
          distanceScore,
          timeScore,
          teamSize,
          matchedSkills: teamSpecialties.filter(skill => requiredTypes.includes(skill)),
          matchedCerts: teamCerts.filter(cert => requiredCerts.includes(cert))
        };
      }).filter(Boolean);

      // 按匹配度排序
      results.sort((a, b) => b.matchScore - a.matchScore);

      setMatchResults(results);
    } catch (error) {
      message.error('匹配过程中发生错误');
    } finally {
      setMatchLoading(false);
    }
  };

  // 紧急调派功能 - 自动选择最优队伍
  const handleEmergencyDispatch = () => {
    Modal.confirm({
      title: '🚨 紧急调派确认',
      content: (
        <div>
          <Alert
            message="紧急调派模式"
            description="系统将自动选择最优救援队伍并立即调派，请确认当前情况确实紧急。"
            type="warning"
            style={{ marginBottom: 16 }}
          />
          <div>
            <p><strong>调派条件：</strong></p>
            <ul>
              <li>选择距离最近且状态为"值班中"的队伍</li>
              <li>优先考虑专业救援队</li>
              <li>确保队伍具备基本救援能力</li>
            </ul>
          </div>
        </div>
      ),
      okText: '确认紧急调派',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        // 自动匹配最优队伍
        const availableTeams = rescueTeams.filter(team =>
          team.status === '值班中' || team.status === '待命'
        );

        if (availableTeams.length === 0) {
          message.error('当前没有可用的救援队伍');
          return;
        }

        // 按优先级排序：专业队 > 志愿者 > 兼职
        const sortedTeams = availableTeams.sort((a, b) => {
          const priorityMap = { 'professional': 3, 'volunteer': 2, 'lifeguard': 1 };
          const priorityA = priorityMap[a.type] || 0;
          const priorityB = priorityMap[b.type] || 0;

          if (priorityA !== priorityB) return priorityB - priorityA;

          // 相同类型按状态排序
          if (a.status === '值班中' && b.status !== '值班中') return -1;
          if (b.status === '值班中' && a.status !== '值班中') return 1;

          return 0;
        });

        const selectedTeam = sortedTeams[0];

        message.success(
          `🚨 紧急调派成功！已调派"${selectedTeam.name}"执行救援任务`,
          5
        );

        // 这里可以添加实际的调派逻辑，比如发送通知、更新队伍状态等
        console.log('紧急调派队伍:', selectedTeam);
      }
    });
  };

  // 渲染救援队伍Tab
  const renderTeamsTab = () => (
    <div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索队伍名称"
            style={{ width: 200 }}
            value={teamSearchText}
            onChange={(e) => setTeamSearchText(e.target.value)}
          />
          <Select
            placeholder="队伍类型"
            style={{ width: 140 }}
            value={teamTypeFilter}
            onChange={setTeamTypeFilter}
          >
            <Option value="all">全部类型</Option>
            <Option value="professional">专业救援队</Option>
            <Option value="volunteer">志愿者队伍</Option>
            <Option value="lifeguard">兼职救生员</Option>
          </Select>
          <Select
            placeholder="技能认证"
            style={{ width: 140 }}
            value={skillFilter}
            onChange={setSkillFilter}
          >
            <Option value="all">全部技能</Option>
            <Option value="first_aid">急救证</Option>
            <Option value="lifeguard">救生员证</Option>
            <Option value="diving">潜水证</Option>
          </Select>
          <Button type="primary" ghost onClick={handleSmartMatch}>
            🎯 智能匹配救援队伍
          </Button>
          <Button type="primary" danger ghost onClick={handleEmergencyDispatch}>
            🚨 紧急调派
          </Button>
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedTeam(null);
              setIsEditingTeam(false);
              teamForm.resetFields();
              setMapLatitude('');
              setMapLongitude('');
              setRescueTeamModalVisible(true);
            }}
          >
            添加救援队伍
          </Button>
        </Space>
      </div>



      <Table
        key={tableRefreshKey}
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
            render: (_, record) => {
              // 直接从 allMembers 中实时查找，不依赖预计算
              const teamMembers = allMembers.filter(member => member.teamId === record.id);
              const leaders = teamMembers.filter(member => member.position === '队长');
              const actualMemberCount = teamMembers.length;
              const isCountMismatch = actualMemberCount !== record.memberCount;

              // 格式化队长显示
              const leadersDisplay = leaders.length === 0
                ? '暂无队长'
                : leaders.map(leader => leader.name).join('、');

              return (
                <div>
                  <div>
                    👥 {actualMemberCount}人 | 👨‍✈️ {leadersDisplay}
                    {isCountMismatch && (
                      <Tooltip title={`数据已同步：实际${actualMemberCount}人，记录${record.memberCount}人`}>
                        <Badge status="processing" style={{ marginLeft: 4 }} />
                      </Tooltip>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                    {(record.certifications || []).slice(0, 2).map((cert, index) => (
                      <Tag key={`${cert}-${index}`} size="small" color="cyan">{cert}</Tag>
                    ))}
                    {(record.certifications || []).length > 2 && <span>+{(record.certifications || []).length - 2}</span>}
                  </div>
                </div>
              );
            }
          },
          {
            title: '擅长领域',
            dataIndex: 'specialties',
            key: 'specialties',
            width: 120,
            render: (specialties) => (
              <div>
                {(specialties || []).map((specialty, index) => (
                  <Tag key={`${specialty}-${index}`} size="small" color="purple">{specialty}</Tag>
                ))}
              </div>
            )
          },
          {
            title: '队伍状态',
            key: 'status',
            width: 100,
            render: (_, record) => (
              <Tag color={
                record.status === '值班中' ? 'green' :
                record.status === '待命' ? 'orange' : 'red'
              }>
                {record.status}
              </Tag>
            )
          },
          {
            title: '联系方式',
            key: 'contact',
            width: 120,
            render: (_, record) => {
              // 直接从 allMembers 中实时查找队长
              const leaders = allMembers.filter(member => member.teamId === record.id && member.position === '队长');
              const contact = leaders.length === 0
                ? '暂无'
                : leaders.map(leader => leader.phone).join('、');





              return (
                <div>
                  <div>{contact}</div>
                  {contact !== '暂无' && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      队长手机
                    </div>
                  )}
                </div>
              );
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_, record) => (
              <Space direction="vertical" size="small">
                <Space>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedTeam(record);
                      setIsEditingTeam(false);
                      setMapLatitude(record.latitude || '');
                      setMapLongitude(record.longitude || '');
                      setRescueTeamModalVisible(true);
                    }}
                  >
                    查看详情
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedTeam(record);
                      setIsEditingTeam(true);
                      setMapLatitude(record.latitude || '');
                      setMapLongitude(record.longitude || '');
                      teamForm.setFieldsValue({
                        name: record.name,
                        type: record.type,
                        location: record.location,
                        certifications: record.certifications,
                        specialties: record.specialties,
                        status: record.status,
                        latitude: record.latitude || '',
                        longitude: record.longitude || ''
                      });
                      setRescueTeamModalVisible(true);
                    }}
                  >
                    编辑
                  </Button>
                </Space>
                <Space>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setCurrentTeamForMember(record);
                      setSelectedMember(null);
                      setIsEditingMember(false);
                      memberForm.resetFields();
                      setMemberModalVisible(true);
                    }}
                  >
                    队员管理
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedTeam(record);
                      setTrainingModalVisible(true);
                    }}
                  >
                    培训记录
                  </Button>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'dispatch',
                          label: '立即调派',
                          icon: <ThunderboltOutlined />,
                          onClick: () => {
                            Modal.confirm({
                              title: '确认调派',
                              content: `确定要调派救援队伍"${record.name}"吗？`,
                              okText: '确认调派',
                              cancelText: '取消',
                              onOk() {
                                message.success(`救援队伍"${record.name}"已调派`);
                              }
                            });
                          }
                        },
                        {
                          key: 'delete',
                          label: '删除队伍',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => {
                            Modal.confirm({
                              title: '确认删除',
                              content: `确定要删除救援队伍"${record.name}"吗？`,
                              okText: '确认',
                              cancelText: '取消',
                              onOk() {
                                message.success(`救援队伍"${record.name}"已删除`);
                              }
                            });
                          }
                        }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button type="link" size="small">
                      更多 <DownOutlined />
                    </Button>
                  </Dropdown>
                </Space>
              </Space>
            )
          }
        ]}
        dataSource={rescueTeamsData.filter(team => {
          const leader = team.leader; // 使用预计算的队长信息
          const matchesSearch = !teamSearchText ||
            team.name.toLowerCase().includes(teamSearchText.toLowerCase()) ||
            (leader && leader.name.toLowerCase().includes(teamSearchText.toLowerCase())) ||
            team.location.toLowerCase().includes(teamSearchText.toLowerCase());
          const matchesType = teamTypeFilter === 'all' || team.type === teamTypeFilter;
          const matchesSkill = skillFilter === 'all' || team.certifications.some(cert =>
            cert.includes(skillFilter === 'first_aid' ? '急救' : skillFilter === 'lifeguard' ? '救生员' : '潜水')
          );
          return matchesSearch && matchesType && matchesSkill;
        })}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );

  // 渲染设备台账Tab
  const renderEquipmentTab = () => (
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedEquipment(null);
              setIsEditingEquipment(false);
              equipmentForm.resetFields();
              setEquipmentModalVisible(true);
            }}
          >
            添加设备
          </Button>
        </Space>
      </div>

      <Table
        columns={[
          {
            title: '设备信息',
            key: 'equipmentInfo',
            width: 200,
            render: (_, record) => (
              <div>
                <div style={{ fontWeight: 500 }}>{record.name}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  型号: {record.model}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  📍 {record.location}
                </div>
              </div>
            )
          },
          {
            title: '设备类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => {
              const typeMap = {
                boat: { text: '🚤 救生艇', color: 'blue' },
                drone: { text: '🚁 无人机', color: 'purple' },
                medical: { text: '🏥 急救设备', color: 'red' },
                personal: { text: '🦺 个人装备', color: 'orange' }
              };
              const config = typeMap[type] || { text: type, color: 'default' };
              return <Tag color={config.color}>{config.text}</Tag>;
            }
          },
          {
            title: '状态信息',
            key: 'statusInfo',
            width: 150,
            render: (_, record) => (
              <div>
                <Tag color={
                  record.status === '闲置' ? 'green' :
                  record.status === '在用' ? 'orange' : 'red'
                }>
                  {record.status}
                </Tag>
                {record.operator && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                    操作员: {record.operator}
                  </div>
                )}
              </div>
            )
          },
          {
            title: '技术参数',
            key: 'specifications',
            width: 200,
            render: (_, record) => (
              <div style={{ fontSize: '12px' }}>
                {record.type === 'boat' && (
                  <>
                    <div>⛽ 燃油: {record.fuelLevel}</div>
                    <div>📏 规格: {record.specifications}</div>
                  </>
                )}
                {record.type === 'drone' && (
                  <>
                    <div>🔋 电量: {record.batteryLevel}</div>
                    <div>⏱️ 续航: {record.flightTime}</div>
                    <div>📷 摄像头: {record.cameraType}</div>
                  </>
                )}
                {record.type === 'medical' && (
                  <>
                    <div>🔋 电量: {record.batteryLevel}</div>
                    <div>✅ 检查: {record.lastCheck}</div>
                  </>
                )}
              </div>
            )
          },
          {
            title: '维护信息',
            key: 'maintenance',
            width: 150,
            render: (_, record) => (
              <div style={{ fontSize: '12px' }}>
                <div>上次: {record.lastMaintenance}</div>
                {record.nextMaintenance && (
                  <div>下次: {record.nextMaintenance}</div>
                )}
                <Tag
                  size="small"
                  color={record.condition === '优秀' ? 'green' : record.condition === '良好' ? 'blue' : 'orange'}
                >
                  {record.condition}
                </Tag>
              </div>
            )
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
              <Space direction="vertical" size="small">
                <Space>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedEquipment(record);
                      setIsEditingEquipment(false);
                      setEquipmentModalVisible(true);
                    }}
                  >
                    查看详情
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedEquipment(record);
                      setIsEditingEquipment(true);
                      equipmentForm.setFieldsValue({
                        name: record.name,
                        type: record.type,
                        model: record.model,
                        location: record.location,
                        status: record.status
                      });
                      setEquipmentModalVisible(true);
                    }}
                  >
                    编辑
                  </Button>
                </Space>
                <Space>
                  {record.status === '闲置' ? (
                    <Button
                      type="primary"
                      size="small"
                      ghost
                      onClick={() => {
                        setSelectedEquipment(record);
                        setEquipmentApplyModalVisible(true);
                      }}
                    >
                      申领使用
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => {
                        Modal.confirm({
                          title: '确认归还',
                          content: `确定要归还设备"${record.name}"吗？`,
                          okText: '确认归还',
                          cancelText: '取消',
                          onOk() {
                            message.success(`设备"${record.name}"已归还`);
                          }
                        });
                      }}
                    >
                      归还设备
                    </Button>
                  )}
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除设备"${record.name}"吗？`,
                        okText: '确认',
                        cancelText: '取消',
                        onOk() {
                          message.success(`设备"${record.name}"已删除`);
                        }
                      });
                    }}
                  >
                    删除
                  </Button>
                </Space>
              </Space>
            )
          }
        ]}
        dataSource={equipmentData}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );

  // 过滤物资数据
  const filteredSuppliesData = useMemo(() => {
    return suppliesData.filter(item => {
      const matchesSearch = !suppliesSearchText ||
        item.name.toLowerCase().includes(suppliesSearchText.toLowerCase()) ||
        item.category.toLowerCase().includes(suppliesSearchText.toLowerCase()) ||
        item.location.toLowerCase().includes(suppliesSearchText.toLowerCase());

      const matchesCategory = suppliesCategoryFilter === 'all' ||
        item.category === suppliesCategoryFilter;

      const matchesStatus = suppliesStatusFilter === 'all' ||
        (suppliesStatusFilter === 'warning' && item.status !== 'normal') ||
        item.status === suppliesStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliesData, suppliesSearchText, suppliesCategoryFilter, suppliesStatusFilter]);

  // 渲染物资储备Tab
  const renderSuppliesTab = () => (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索物资名称、类别、位置"
            style={{ width: 250 }}
            value={suppliesSearchText}
            onChange={(e) => setSuppliesSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="物资类别"
            style={{ width: 140 }}
            value={suppliesCategoryFilter}
            onChange={setSuppliesCategoryFilter}
          >
            <Option value="all">全部类别</Option>
            <Option value="救生设备">救生设备</Option>
            <Option value="应急物资">应急物资</Option>
            <Option value="照明设备">照明设备</Option>
            <Option value="医疗用品">医疗用品</Option>
          </Select>
          <Select
            placeholder="库存状态"
            style={{ width: 140 }}
            value={suppliesStatusFilter}
            onChange={setSuppliesStatusFilter}
          >
            <Option value="all">全部状态</Option>
            <Option value="normal">正常</Option>
            <Option value="low">偏低</Option>
            <Option value="critical">紧急</Option>
          </Select>
          <Button
            type={suppliesStatusFilter === 'warning' ? 'primary' : 'default'}
            danger={suppliesStatusFilter !== 'warning'}
            icon={<WarningOutlined />}
            onClick={() => {
              // 显示所有非正常状态的物资（包括偏低和紧急）
              if (suppliesStatusFilter === 'all') {
                // 如果当前显示全部，则筛选显示预警物资
                setSuppliesStatusFilter('warning');
                message.info('已筛选显示库存预警物资（包括偏低和紧急）');
              } else {
                // 如果已经在筛选状态，则恢复显示全部
                setSuppliesStatusFilter('all');
                message.info('已恢复显示全部物资');
              }
            }}
          >
            库存预警 ({suppliesData.filter(item => item.status !== 'normal').length})
          </Button>
        </Space>
        <Space>
          <Button
            type="default"
            icon={<FileTextOutlined />}
            onClick={() => setStockRecordsModalVisible(true)}
          >
            出入库记录
          </Button>
          <Button
            type="default"
            icon={<BarChartOutlined />}
            onClick={() => setInventoryModalVisible(true)}
          >
            库存盘点
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsEditingSupplies(false);
              suppliesForm.resetFields();
              setSuppliesModalVisible(true);
            }}
          >
            添加物资
          </Button>
        </Space>
      </div>

      {/* 批量操作工具栏 */}
      {selectedSuppliesItems.length > 0 && (
        <Alert
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>已选择 {selectedSuppliesItems.length} 项物资</span>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setStockOperation('in');
                    setBatchOperationModalVisible(true);
                  }}
                >
                  批量入库
                </Button>
                <Button
                  type="default"
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => {
                    setStockOperation('out');
                    setBatchOperationModalVisible(true);
                  }}
                >
                  批量出库
                </Button>
                <Button
                  type="default"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setSelectedSuppliesItems([])}
                >
                  取消选择
                </Button>
              </Space>
            </div>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={[
          {
            title: '物资信息',
            key: 'suppliesInfo',
            width: 180,
            render: (_, record) => (
              <div>
                <div style={{ fontWeight: 500 }}>{record.name}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  类别: {record.category}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  📍 {record.location}
                </div>
              </div>
            )
          },
          {
            title: '库存状态',
            key: 'stockStatus',
            width: 150,
            render: (_, record) => (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>
                  {record.currentStock} {record.unit}
                </div>
                <Progress
                  percent={Math.round((record.currentStock / record.maxStock) * 100)}
                  size="small"
                  status={record.status === 'critical' ? 'exception' : record.status === 'low' ? 'active' : 'success'}
                  showInfo={false}
                />
                <div style={{ fontSize: '12px', color: '#999' }}>
                  最低: {record.minStock} | 最高: {record.maxStock}
                </div>
              </div>
            )
          },
          {
            title: '预警状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
              const statusMap = {
                normal: { text: '正常', color: 'green', icon: '✅' },
                low: { text: '偏低', color: 'orange', icon: '⚠️' },
                critical: { text: '紧急', color: 'red', icon: '🚨' }
              };
              const config = statusMap[status] || { text: status, color: 'default', icon: '' };
              return (
                <Tag color={config.color}>
                  {config.icon} {config.text}
                </Tag>
              );
            }
          },
          {
            title: '供应商信息',
            key: 'supplierInfo',
            width: 150,
            render: (_, record) => (
              <div style={{ fontSize: '12px' }}>
                <div>{record.supplier}</div>
                <div style={{ color: '#999' }}>
                  更新: {record.lastUpdate}
                </div>
              </div>
            )
          },
          {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space size={4} wrap>
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    className={`${styles.suppliesActionBtn} ${styles.view}`}
                    onClick={() => {
                      setSelectedSuppliesDetail(record);
                      setSuppliesDetailModalVisible(true);
                    }}
                    style={{
                      color: '#1890ff',
                      padding: '2px 8px',
                      height: '24px',
                      fontSize: '12px'
                    }}
                  >
                    详情
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    className={`${styles.suppliesActionBtn} ${styles.edit}`}
                    onClick={() => {
                      setSelectedSuppliesItem(record);
                      setIsEditingSupplies(true);
                      suppliesForm.setFieldsValue({
                        name: record.name,
                        category: record.category,
                        currentStock: record.currentStock,
                        minStock: record.minStock,
                        maxStock: record.maxStock,
                        location: record.location,
                        unit: record.unit,
                        supplier: record.supplier,
                        price: record.price || 0,
                        specifications: record.specifications || ''
                      });
                      setSuppliesModalVisible(true);
                    }}
                    style={{
                      color: '#52c41a',
                      padding: '2px 8px',
                      height: '24px',
                      fontSize: '12px'
                    }}
                  >
                    编辑
                  </Button>
                </Space>
                <Space size={4} wrap>
                  <Button
                    type="text"
                    size="small"
                    icon={<MinusOutlined />}
                    className={`${styles.suppliesActionBtn} ${styles.out}`}
                    onClick={() => {
                      setSelectedSuppliesItem(record);
                      setStockOperation('out');
                      setStockInOutModalVisible(true);
                    }}
                    style={{
                      color: '#fa8c16',
                      padding: '2px 8px',
                      height: '24px',
                      fontSize: '12px'
                    }}
                  >
                    出库
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    className={`${styles.suppliesActionBtn} ${styles.in}`}
                    onClick={() => {
                      setSelectedSuppliesItem(record);
                      setStockOperation('in');
                      setStockInOutModalVisible(true);
                    }}
                    style={{
                      color: '#52c41a',
                      padding: '2px 8px',
                      height: '24px',
                      fontSize: '12px'
                    }}
                  >
                    入库
                  </Button>
                  {record.status !== 'normal' && (
                    <Button
                      type="text"
                      size="small"
                      icon={<WarningOutlined />}
                      className={`${styles.suppliesActionBtn} ${styles.warning}`}
                      onClick={() => {
                        Modal.confirm({
                          title: '紧急补充',
                          content: `${record.name}库存不足，是否立即联系供应商补充？`,
                          okText: '立即联系',
                          cancelText: '取消',
                          onOk() {
                            message.success(`已通知供应商紧急补充${record.name}`);
                          }
                        });
                      }}
                      style={{
                        color: '#ff4d4f',
                        padding: '2px 8px',
                        height: '24px',
                        fontSize: '12px'
                      }}
                    >
                      补充
                    </Button>
                  )}
                </Space>
              </Space>
            )
          }
        ]}
        dataSource={filteredSuppliesData}
        rowKey="id"
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
        }}
        scroll={{ x: 1000 }}
        rowClassName={(record) => {
          if (record.status === 'critical') return 'critical-row';
          if (record.status === 'low') return 'warning-row';
          return '';
        }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedSuppliesItems.map(item => item.id),
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedSuppliesItems(selectedRows);
          },
          onSelect: (record, selected, selectedRows) => {
            setSelectedSuppliesItems(selectedRows);
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            setSelectedSuppliesItems(selectedRows);
          },
          getCheckboxProps: (record) => ({
            disabled: false,
            name: record.name,
          }),
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
              key: 'warning',
              text: '选择预警物资',
              onSelect: () => {
                const warningItems = filteredSuppliesData.filter(item => item.status !== 'normal');
                setSelectedSuppliesItems(warningItems);
                message.success(`已选择 ${warningItems.length} 项预警物资`);
              },
            },
          ],
        }}
      />

    </div>
  );





  // 处理救援队伍表单提交
  const handleTeamSubmit = async () => {
    try {
      const values = await teamForm.validateFields();
      console.log('救援队伍表单数据:', values);

      if (isEditingTeam && selectedTeam) {
        // 更新现有队伍
        setRescueTeams(prevTeams =>
          prevTeams.map(team =>
            team.id === selectedTeam.id ? { ...team, ...values } : team
          )
        );
        message.success('救援队伍信息更新成功！');
      } else {
        // 添加新队伍
        const newTeam = {
          id: Date.now().toString(),
          ...values,
          memberCount: 0, // 初始人员数量为0，通过队员管理动态计算
          distance: '计算中...',
          responseTime: '评估中...',
          lastTraining: '待安排',
          certifications: values.certifications || [],
          specialties: values.specialties || [],
          equipment: [], // 添加设备属性，避免详情页面报错
          latitude: values.latitude || '', // 经纬度字段，支持空值
          longitude: values.longitude || ''
        };

        setRescueTeams(prevTeams => [...prevTeams, newTeam]);
        message.success('救援队伍添加成功！');
      }

      setRescueTeamModalVisible(false);
      setSelectedTeam(null);
      setIsEditingTeam(false);
      setMapLatitude('');
      setMapLongitude('');
      teamForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染救援队伍详情弹窗
  const renderTeamModal = () => (
    <Modal
      title={
        isEditingTeam ?
          `✏️ 编辑救援队伍 - ${selectedTeam?.name || ''}` :
          selectedTeam ?
            `🚑 ${selectedTeam.name} - 详细信息` :
            "➕ 新增救援队伍"
      }
      open={rescueTeamModalVisible}
      onCancel={() => {
        setRescueTeamModalVisible(false);
        setSelectedTeam(null);
        setIsEditingTeam(false);
        setMapLatitude('');
        setMapLongitude('');
        teamForm.resetFields();
      }}
      width={1200}
      zIndex={1010}
      destroyOnClose
      className={styles.teamModal}
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.footerTip}>
            {isEditingTeam || !selectedTeam ? (
              <span>💡 提示：标有 <span style={{ color: '#ff4d4f' }}>*</span> 的字段为必填项</span>
            ) : (
              <span>📋 查看救援队伍详细信息</span>
            )}
          </div>
          <div className={styles.footerButtons}>
            {isEditingTeam || !selectedTeam ? [
              <Button
                key="cancel"
                size="large"
                className={styles.cancelButton}
                onClick={() => {
                  setRescueTeamModalVisible(false);
                  setSelectedTeam(null);
                  setIsEditingTeam(false);
                  setMapLatitude('');
                  setMapLongitude('');
                  teamForm.resetFields();
                }}
              >
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                size="large"
                className={styles.submitButton}
                onClick={handleTeamSubmit}
              >
                {isEditingTeam ? '💾 保存修改' : '➕ 添加队伍'}
              </Button>
            ] : [
              <Button
                key="cancel"
                size="large"
                className={styles.cancelButton}
                onClick={() => setRescueTeamModalVisible(false)}
              >
                关闭
              </Button>,
              <Button
                key="edit"
                type="primary"
                size="large"
                className={styles.editButton}
                onClick={() => {
                  setIsEditingTeam(true);

                  // 安全地获取经纬度值
                  const lat = selectedTeam.latitude || '';
                  const lng = selectedTeam.longitude || '';

                  // 设置地图组件的状态
                  setMapLatitude(lat);
                  setMapLongitude(lng);

                  // 填充表单数据
                  teamForm.setFieldsValue({
                    name: selectedTeam.name,
                    type: selectedTeam.type,
                    responseTime: selectedTeam.responseTime || 30,
                    leader: selectedTeam.leader,
                    memberCount: selectedTeam.memberCount,
                    location: selectedTeam.location,
                    contact: selectedTeam.contact,
                    certifications: selectedTeam.certifications,
                    specialties: selectedTeam.specialties,
                    status: selectedTeam.status,
                    latitude: lat,
                    longitude: lng
                  });
                }}
              >
                ✏️ 编辑信息
              </Button>
            ]}
          </div>
        </div>
      }
    >
      {(isEditingTeam || !selectedTeam) ? (
        // 编辑/新增表单
        <div className={styles.teamFormContainer}>
          <Form
            form={teamForm}
            layout="vertical"
            initialValues={{
              type: 'professional',
              status: '待命',
              responseTime: 30,
              certifications: [],
              specialties: [],
              latitude: '',
              longitude: ''
            }}
            style={{ padding: '8px 0' }}
          >
            {/* 基本信息分组 */}
            <div className={`${styles.formSection} ${styles.basicInfoSection}`}>
              <div className={styles.sectionTitle}>
                📋 基本信息
              </div>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>队伍名称 <span className={styles.requiredMark}>*</span></span>}
                    name="name"
                    rules={[{ required: true, message: '请输入队伍名称' }]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input
                      placeholder="请输入队伍名称"
                      size="large"
                      className={styles.formInput}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>队伍类型 <span className={styles.requiredMark}>*</span></span>}
                    name="type"
                    rules={[{ required: true, message: '请选择队伍类型' }]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      placeholder="请选择队伍类型"
                      size="large"
                      className={styles.formInput}
                    >
                      <Option value="professional">🏆 专业救援队</Option>
                      <Option value="volunteer">🤝 志愿者队伍</Option>
                      <Option value="lifeguard">🏊 兼职救生员</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>响应时间 <span className={styles.requiredMark}>*</span></span>}
                    name="responseTime"
                    rules={[
                      { required: true, message: '请输入响应时间' },
                      { type: 'number', min: 5, max: 120, message: '响应时间必须在5-120分钟之间' }
                    ]}
                    style={{ marginBottom: '16px' }}
                    tooltip="该救援队伍的平均响应时间，将在智能匹配算法中作为重要评分依据"
                  >
                    <InputNumber
                      placeholder="请输入响应时间"
                      size="large"
                      className={styles.formInput}
                      min={5}
                      max={120}
                      precision={0}
                      addonAfter="分钟"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>值班状态</span>}
                    name="status"
                    style={{ marginBottom: '16px' }}
                  >
                    <Radio.Group size="large" className={styles.statusRadioGroup}>
                      <Radio.Button value="值班中">🟢 值班中</Radio.Button>
                      <Radio.Button value="待命">🟡 待命</Radio.Button>
                      <Radio.Button value="训练中">🔵 训练中</Radio.Button>
                      <Radio.Button value="休息">⚪ 休息</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>


            </div>

            {/* 地理位置分组 */}
            <div className={`${styles.formSection} ${styles.locationSection}`}>
              <div className={styles.sectionTitle}>
                📍 地理位置
              </div>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>所在位置 <span className={styles.requiredMark}>*</span></span>}
                    name="location"
                    rules={[{ required: true, message: '请输入所在位置' }]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input
                      placeholder="请输入详细的所在位置，如：东港区救援站、中央码头等"
                      size="large"
                      className={styles.formInput}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>纬度 (Latitude)</span>}
                    name="latitude"
                    tooltip="纬度范围：-90 到 90，正值表示北纬，负值表示南纬"
                    rules={[
                      {
                        pattern: /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
                        message: '请输入有效的纬度值（-90到90）'
                      }
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input
                      placeholder="例如：36.1234"
                      addonAfter="°N"
                      size="large"
                      className={`${styles.formInput} ${styles.coordinateInput}`}
                      value={mapLatitude}
                      onChange={(e) => {
                        setMapLatitude(e.target.value);
                        teamForm.setFieldsValue({ latitude: e.target.value });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>经度 (Longitude)</span>}
                    name="longitude"
                    tooltip="经度范围：-180 到 180，正值表示东经，负值表示西经"
                    rules={[
                      {
                        pattern: /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
                        message: '请输入有效的经度值（-180到180）'
                      }
                    ]}
                    style={{ marginBottom: '16px' }}
                  >
                    <Input
                      placeholder="例如：120.5678"
                      addonAfter="°E"
                      size="large"
                      className={`${styles.formInput} ${styles.coordinateInput}`}
                      value={mapLongitude}
                      onChange={(e) => {
                        setMapLongitude(e.target.value);
                        teamForm.setFieldsValue({ longitude: e.target.value });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item
                    label={<span style={{ fontWeight: '500', color: 'transparent' }}>操作</span>}
                    style={{ marginBottom: '16px' }}
                  >
                    <Button
                      type="dashed"
                      size="large"
                      block
                      icon={<span>🎯</span>}
                      className={styles.defaultCoordButton}
                      onClick={() => {
                        setMapLatitude('36.0986');
                        setMapLongitude('120.3719');
                        teamForm.setFieldsValue({
                          latitude: '36.0986',
                          longitude: '120.3719'
                        });
                        message.info('已设置为青岛港默认坐标');
                      }}
                    >
                      使用默认坐标
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <div className={styles.mapContainer}>
                    <MapSelector
                      latitude={mapLatitude}
                      longitude={mapLongitude}
                      onLocationChange={handleMapLocationChange}
                      height={280}
                      disabled={!isEditingTeam && selectedTeam}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* 专业能力分组 */}
            <div className={`${styles.formSection} ${styles.skillsSection}`}>
              <div className={styles.sectionTitle}>
                🏅 专业能力
              </div>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>技能认证</span>}
                    name="certifications"
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择已获得的技能认证"
                      size="large"
                      className={styles.multiSelectField}
                      maxTagCount="responsive"
                      allowClear
                    >
                      <Option value="急救证">🚑 急救证</Option>
                      <Option value="救生员证">🏊 救生员证</Option>
                      <Option value="潜水证">🤿 潜水证</Option>
                      <Option value="水下焊接证">🔧 水下焊接证</Option>
                      <Option value="船舶驾驶证">⛵ 船舶驾驶证</Option>
                      <Option value="无线电操作证">📻 无线电操作证</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label={<span className={styles.formFieldLabel}>擅长领域</span>}
                    name="specialties"
                    style={{ marginBottom: '16px' }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择擅长的救援领域"
                      size="large"
                      className={styles.multiSelectField}
                      maxTagCount="responsive"
                      allowClear
                    >
                      <Option value="静水救援">🏊 静水救援</Option>
                      <Option value="急流救援">🌊 急流救援</Option>
                      <Option value="水下救援">🤿 水下救援</Option>
                      <Option value="夜间救援">🌙 夜间救援</Option>
                      <Option value="医疗急救">🚑 医疗急救</Option>
                      <Option value="高空救援">🪂 高空救援</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        </div>
      ) : (
        // 详情展示
        selectedTeam && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="队伍名称">{selectedTeam.name}</Descriptions.Item>
              <Descriptions.Item label="队伍类型">
                <Tag color="blue">{selectedTeam.type === 'professional' ? '专业救援队' : '志愿者队伍'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="队长">
                {allMembers.find(member => member.teamId === selectedTeam.id && member.position === '队长')?.name || '暂无队长'}
                <Tag color="blue" style={{ marginLeft: 8 }}>动态获取</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="人员数量">
                {allMembers.filter(member => member.teamId === selectedTeam.id).length}人
                <Tag color="green" style={{ marginLeft: 8 }}>实时数据</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所在位置">{selectedTeam.location}</Descriptions.Item>
              <Descriptions.Item label="经纬度坐标">
                {selectedTeam.latitude && selectedTeam.longitude ? (
                  <span style={{ fontFamily: 'monospace' }}>
                    📍 {selectedTeam.latitude}°N, {selectedTeam.longitude}°E
                  </span>
                ) : (
                  <span style={{ color: '#999' }}>未设置坐标</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="距离">{selectedTeam.distance}</Descriptions.Item>
              <Descriptions.Item label="响应时间">{selectedTeam.responseTime}分钟</Descriptions.Item>
              <Descriptions.Item label="值班状态">
                <Tag color={selectedTeam.status === '值班中' ? 'green' : 'orange'}>
                  {selectedTeam.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {allMembers.find(member => member.teamId === selectedTeam.id && member.position === '队长')?.phone || '暂无'}
                <Tag color="blue" style={{ marginLeft: 8 }}>队长手机</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="最近培训">{selectedTeam.lastTraining}</Descriptions.Item>
            </Descriptions>

            <Divider>技能认证</Divider>
            <div style={{ marginBottom: 16 }}>
              {(selectedTeam.certifications || []).map((cert, index) => (
                <Tag key={`${cert}-${index}`} color="cyan" style={{ margin: '2px' }}>{cert}</Tag>
              ))}
            </div>

            <Divider>擅长领域</Divider>
            <div style={{ marginBottom: 16 }}>
              {(selectedTeam.specialties || []).map((specialty, index) => (
                <Tag key={`${specialty}-${index}`} color="purple" style={{ margin: '2px' }}>{specialty}</Tag>
              ))}
            </div>

            <Divider>地理位置</Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedTeam.latitude && selectedTeam.longitude ? (
                <div>
                  <div style={{ marginBottom: 8, color: '#666' }}>
                    📍 坐标位置：{selectedTeam.latitude}°N, {selectedTeam.longitude}°E
                  </div>
                  <MapSelector
                    latitude={selectedTeam.latitude}
                    longitude={selectedTeam.longitude}
                    height={300}
                    disabled={true}
                    showTitle={false}
                    showControls={false}
                  />
                </div>
              ) : (
                <div style={{
                  height: 300,
                  border: '1px dashed #d9d9d9',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa',
                  color: '#999'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📍</div>
                    <div>该救援队伍暂未设置地理坐标</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      可通过编辑功能添加经纬度信息
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Divider>队员信息</Divider>
            <Table
              size="small"
              columns={[
                { title: '姓名', dataIndex: 'name', key: 'name' },
                { title: '职位', dataIndex: 'position', key: 'position' },
                { title: '认证', dataIndex: 'certifications', key: 'certifications', render: (certs) => (
                  certs.map(cert => <Tag key={cert} size="small">{cert}</Tag>)
                )},
                { title: '经验', dataIndex: 'experience', key: 'experience' }
              ]}
              dataSource={getTeamMembers(selectedTeam.id)}
              pagination={false}
            />

            <Divider>配备设备</Divider>
            <div>
              {(selectedTeam.equipment || []).map((eq, index) => (
                <Tag key={index} color="blue" style={{ margin: '2px' }}>{eq}</Tag>
              ))}
              {(!selectedTeam.equipment || selectedTeam.equipment.length === 0) && (
                <span style={{ color: '#999' }}>暂无配备设备</span>
              )}
            </div>
          </div>
        )
      )}
    </Modal>
  );

  // 智能匹配相关状态
  const [matchForm] = Form.useForm();
  const [smartMatchResults, setSmartMatchResults] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchCriteria, setMatchCriteria] = useState({
    emergencyType: '',
    location: '',
    urgencyLevel: '',
    requiredSkills: [],
    maxResponseTime: 30,
    minTeamSize: 3
  });

  // 新的智能匹配函数（专门为智能匹配弹窗使用）
  const handleSmartMatchInternal = async (criteria) => {
    setIsMatching(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 确保rescueTeams存在且是数组
      if (!rescueTeams || !Array.isArray(rescueTeams)) {
        console.error('救援队伍数据不可用');
        message.error('救援队伍数据不可用，请刷新页面重试');
        return;
      }

      const results = rescueTeams.map(team => {
        // 1. 响应时间评分（30分）
        const baseResponseTime = team.responseTime || 30; // 使用队伍实际响应时间
        const responseTimeScore = Math.max(0, 30 - (baseResponseTime / criteria.maxResponseTime) * 30);

        // 2. 队伍规模评分（20分）
        const teamSize = allMembers ? allMembers.filter(member => member.teamId === team.id).length : Math.floor(Math.random() * 10) + 5;
        const sizeScore = teamSize >= criteria.minTeamSize ? 20 : (teamSize / criteria.minTeamSize) * 20;

        // 3. 专业技能匹配评分（30分）
        const teamSpecialties = team.specialties || [];
        const requiredSkills = criteria.requiredSkills || [];
        let skillScore = 15; // 基础分
        if (requiredSkills.length > 0) {
          const matchCount = requiredSkills.filter(skill => teamSpecialties.includes(skill)).length;
          skillScore = (matchCount / requiredSkills.length) * 30;
        }

        // 4. 地理位置评分（20分）
        const distance = Math.random() * 50 + 5; // 5-55公里
        const locationScore = Math.max(0, 20 - (distance / 50) * 20);

        // 5. 额外加分项
        let bonusScore = 0;
        if (team.status === '值班中') bonusScore += 5;
        if (team.equipment && team.equipment.length > 5) bonusScore += 3;
        if (team.certifications && team.certifications.length > 3) bonusScore += 2;

        // 总分计算
        const totalScore = Math.round(responseTimeScore + sizeScore + skillScore + locationScore + bonusScore);

        // 确定推荐等级
        let recommendation = '不推荐';
        let recommendationColor = '#ff4d4f';
        if (totalScore >= 80) {
          recommendation = '强烈推荐';
          recommendationColor = '#52c41a';
        } else if (totalScore >= 65) {
          recommendation = '推荐';
          recommendationColor = '#1890ff';
        } else if (totalScore >= 50) {
          recommendation = '可选';
          recommendationColor = '#faad14';
        }

        // 生成匹配原因
        const matchReasons = [];
        if (totalScore >= 80) {
          matchReasons.push('综合能力优秀，强烈推荐');
        }
        if (Math.round(responseTimeScore) >= 25) {
          matchReasons.push('响应时间快，能及时到达现场');
        }
        if (Math.round(skillScore) >= 25) {
          matchReasons.push('专业技能匹配度高');
        }
        if (Math.round(locationScore) >= 15) {
          matchReasons.push('地理位置优势明显');
        }
        if (bonusScore > 0) {
          matchReasons.push('队伍状态良好，装备齐全');
        }
        if (matchReasons.length === 0) {
          matchReasons.push('基本符合救援要求');
        }

        return {
          ...team,
          matchScore: totalScore,
          recommendation,
          recommendationColor,
          responseTime: Math.round(baseResponseTime),
          distance: distance.toFixed(1),
          teamSize,
          skillMatchRate: requiredSkills.length > 0 ?
            Math.round((requiredSkills.filter(skill => teamSpecialties.includes(skill)).length / requiredSkills.length) * 100) : 100,
          matchReasons,
          details: {
            responseTimeScore: Math.round(responseTimeScore),
            sizeScore: Math.round(sizeScore),
            skillScore: Math.round(skillScore),
            locationScore: Math.round(locationScore),
            bonusScore
          }
        };
      }).filter(result => result.matchScore >= 30) // 过滤掉分数太低的队伍
        .sort((a, b) => b.matchScore - a.matchScore); // 按分数降序排列

      setSmartMatchResults(results);
      message.success(`智能匹配完成，找到 ${results.length} 支符合条件的救援队伍`);

    } catch (error) {
      console.error('智能匹配失败:', error);
      message.error('智能匹配失败，请重试');
    } finally {
      setIsMatching(false);
    }
  };

  // 处理匹配表单提交
  const handleMatchSubmit = async () => {
    try {
      const values = await matchForm.validateFields();
      setMatchCriteria(values);
      await handleSmartMatchInternal(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染智能匹配弹窗
  const renderSmartMatchModal = () => {
    console.log('渲染智能匹配弹窗，状态:', smartMatchModalVisible);

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>🎯 智能匹配救援队伍</span>
            <Tooltip
              title={
                <div style={{ maxWidth: 300 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>💡 使用说明：</div>
                  <div style={{ lineHeight: '1.6' }}>
                    1. 填写紧急事件的基本信息<br/>
                    2. 选择所需的专业技能<br/>
                    3. 设置响应时间和队伍规模要求<br/>
                    4. 点击"开始匹配"进行智能分析<br/>
                    5. 系统将根据多维度评分推荐最佳队伍
                  </div>
                </div>
              }
              placement="bottomLeft"
            >
              <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
            </Tooltip>
          </div>
        }
        open={smartMatchModalVisible}
        onCancel={() => {
          console.log('关闭智能匹配弹窗');
          setSmartMatchModalVisible(false);
          setSmartMatchResults([]);
          matchForm.resetFields();
        }}
        width={1200}
        maskClosable={true}
        centered
        footer={[
          <Button key="cancel" onClick={() => {
            setSmartMatchModalVisible(false);
            setSmartMatchResults([]);
            matchForm.resetFields();
          }}>
            关闭
          </Button>,
          <Button
            key="match"
            type="primary"
            loading={isMatching}
            onClick={handleMatchSubmit}
            icon={<SearchOutlined />}
          >
            {isMatching ? '匹配中...' : '开始匹配'}
          </Button>
        ]}
      >
        {/* 使用说明 */}
        <Alert
          message="智能匹配系统使用指南"
          description={
            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: 8 }}>
                <strong>🎯 匹配原理：</strong>系统将根据响应时间(30%)、队伍规模(20%)、专业技能(30%)、地理位置(20%)四个维度进行综合评分
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <strong>📝 操作步骤：</strong><br/>
                  ① 选择事件类型和紧急程度<br/>
                  ② 输入事发地点<br/>
                  ③ 选择所需专业技能
                </div>
                <div>
                  <strong>⚙️ 高级设置：</strong><br/>
                  ④ 调整最大响应时间<br/>
                  ⑤ 设置最少队员数量<br/>
                  ⑥ 点击开始匹配
                </div>
                <div>
                  <strong>📊 结果说明：</strong><br/>
                  • 绿色边框：最佳匹配<br/>
                  • 分数≥70：强烈推荐<br/>
                  • 分数≥50：推荐选择
                </div>
              </div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />

        <Row gutter={[24, 24]}>
          {/* 左侧：匹配条件设置 */}
          <Col span={10}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📋 匹配条件设置</span>
                  <Tooltip title="请根据实际救援需求填写匹配条件，系统将智能推荐最适合的救援队伍">
                    <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                  </Tooltip>
                </div>
              }
              size="small"
            >
              <Form
                form={matchForm}
                layout="vertical"
                initialValues={{
                  urgencyLevel: 'medium',
                  maxResponseTime: 30,
                  minTeamSize: 3
                }}
              >
                <Form.Item
                  name="emergencyType"
                  label="紧急事件类型"
                  rules={[{ required: true, message: '请选择事件类型' }]}
                  extra="选择事件类型将影响专业技能匹配权重"
                >
                  <Select placeholder="请选择事件类型">
                    <Option value="water_rescue">水上救援</Option>
                    <Option value="fire_rescue">火灾救援</Option>
                    <Option value="medical_emergency">医疗急救</Option>
                    <Option value="natural_disaster">自然灾害</Option>
                    <Option value="industrial_accident">工业事故</Option>
                    <Option value="search_rescue">搜索救援</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="location"
                  label="事发地点"
                  rules={[{ required: true, message: '请输入事发地点' }]}
                  extra="地点越详细，距离计算越准确"
                >
                  <Input placeholder="请输入具体地点或区域" />
                </Form.Item>

                <Form.Item
                  name="urgencyLevel"
                  label="紧急程度"
                  rules={[{ required: true, message: '请选择紧急程度' }]}
                  extra="紧急程度影响响应时间权重"
                >
                  <Radio.Group>
                    <Radio.Button value="low">一般</Radio.Button>
                    <Radio.Button value="medium">紧急</Radio.Button>
                    <Radio.Button value="high">特急</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="requiredSkills"
                  label="所需专业技能"
                >
                  <Select
                    mode="multiple"
                    placeholder="选择所需的专业技能"
                    allowClear
                  >
                    <Option value="水上救援">水上救援</Option>
                    <Option value="医疗急救">医疗急救</Option>
                    <Option value="消防">消防</Option>
                    <Option value="潜水">潜水</Option>
                    <Option value="高空作业">高空作业</Option>
                    <Option value="化学防护">化学防护</Option>
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="maxResponseTime"
                      label="最大响应时间(分钟)"
                    >
                      <InputNumber
                        min={5}
                        max={120}
                        style={{ width: '100%' }}
                        placeholder="30"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="minTeamSize"
                      label="最少队员数量"
                    >
                      <InputNumber
                        min={1}
                        max={20}
                        style={{ width: '100%' }}
                        placeholder="3"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* 右侧：匹配结果 */}
          <Col span={14}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎯 匹配结果</span>
                  {smartMatchResults.length > 0 && (
                    <Tag color="blue">{smartMatchResults.length}支队伍</Tag>
                  )}
                  <Tooltip
                    title={
                      <div style={{ maxWidth: 250 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>评分说明：</div>
                        <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                          • 响应时间：距离越近分数越高<br/>
                          • 队伍规模：人员数量符合需求<br/>
                          • 专业技能：技能匹配度越高越好<br/>
                          • 地理位置：考虑交通便利性<br/>
                          • 绿色边框表示最佳匹配队伍
                        </div>
                      </div>
                    }
                    placement="bottomLeft"
                  >
                    <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                  </Tooltip>
                </div>
              }
              size="small"
              extra={
                isMatching && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Spin size="small" />
                    <span style={{ fontSize: '12px', color: '#666' }}>智能分析中...</span>
                  </div>
                )
              }
            >
              {isMatching ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16, color: '#666' }}>
                    正在分析队伍能力和匹配度...
                  </div>
                </div>
              ) : smartMatchResults.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {smartMatchResults.map((team, index) => (
                    <Card
                      key={team.id}
                      size="small"
                      style={{
                        marginBottom: 12,
                        border: index === 0 ? '2px solid #52c41a' : '1px solid #d9d9d9'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            {index === 0 && <Badge count="最佳" style={{ backgroundColor: '#52c41a' }} />}
                            <strong style={{ fontSize: '14px' }}>{team.name}</strong>
                            <Tag color={
                              team.recommendation === '强烈推荐' ? 'green' :
                              team.recommendation === '推荐' ? 'blue' :
                              team.recommendation === '可选' ? 'orange' : 'red'
                            }>
                              {team.recommendation}
                            </Tag>
                          </div>

                          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                            📍 {team.location} | 👥 {team.teamSize || team.actualMemberCount || 0}人 |
                            ⏱️ 预计{team.responseTime}分钟到达 |
                            📞 {team.contact || '联系中心调度'}
                          </div>

                          <div style={{ marginBottom: 8 }}>
                            <strong style={{ fontSize: '12px' }}>专业技能：</strong>
                            {(team.specialties || []).map(skill => (
                              <Tag key={skill} size="small" style={{ margin: '0 4px 4px 0' }}>
                                {skill}
                              </Tag>
                            ))}
                          </div>

                          <div style={{ fontSize: '11px', color: '#999' }}>
                            <strong>匹配原因：</strong>
                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                              {team.matchReasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: team.matchScore >= 70 ? '#52c41a' :
                                   team.matchScore >= 50 ? '#1890ff' :
                                   team.matchScore >= 30 ? '#fa8c16' : '#f5222d'
                          }}>
                            {team.matchScore}
                          </div>
                          <div style={{ fontSize: '10px', color: '#999' }}>匹配度</div>

                          <Button
                            type="primary"
                            size="small"
                            style={{ marginTop: 8, width: '100%' }}
                            onClick={() => {
                              message.success(`已选择${team.name}执行救援任务`);
                              setSmartMatchModalVisible(false);
                            }}
                          >
                            选择
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <SearchOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                  <div>请设置匹配条件并点击"开始匹配"</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  };

  // 处理设备表单提交
  const handleEquipmentSubmit = async () => {
    try {
      const values = await equipmentForm.validateFields();
      console.log('设备表单数据:', values);

      if (isEditingEquipment && selectedEquipment) {
        message.success('设备信息更新成功！');
      } else {
        message.success('设备添加成功！');
      }

      setEquipmentModalVisible(false);
      setSelectedEquipment(null);
      setIsEditingEquipment(false);
      equipmentForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染设备详情弹窗
  const renderEquipmentModal = () => (
    <Modal
      title={
        isEditingEquipment ?
          `✏️ 编辑设备 - ${selectedEquipment?.name || ''}` :
          selectedEquipment ?
            `🛠️ ${selectedEquipment.name} - 设备详情` :
            "➕ 新增设备"
      }
      open={equipmentModalVisible}
      onCancel={() => {
        setEquipmentModalVisible(false);
        setSelectedEquipment(null);
        setIsEditingEquipment(false);
        equipmentForm.resetFields();
      }}
      width={700}
      footer={
        isEditingEquipment || !selectedEquipment ? [
          <Button key="cancel" onClick={() => {
            setEquipmentModalVisible(false);
            setSelectedEquipment(null);
            setIsEditingEquipment(false);
            equipmentForm.resetFields();
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleEquipmentSubmit}>
            {isEditingEquipment ? '保存修改' : '添加设备'}
          </Button>
        ] : [
          <Button key="cancel" onClick={() => setEquipmentModalVisible(false)}>
            关闭
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setIsEditingEquipment(true);
            equipmentForm.setFieldsValue({
              name: selectedEquipment.name,
              type: selectedEquipment.type,
              model: selectedEquipment.model,
              location: selectedEquipment.location,
              status: selectedEquipment.status,
              condition: selectedEquipment.condition,
              fuelLevel: selectedEquipment.fuelLevel,
              batteryLevel: selectedEquipment.batteryLevel,
              specifications: selectedEquipment.specifications
            });
          }}>
            编辑信息
          </Button>
        ]
      }
    >
      {(isEditingEquipment || !selectedEquipment) ? (
        // 编辑/新增表单
        <Form
          form={equipmentForm}
          layout="vertical"
          initialValues={{
            type: 'boat',
            status: '闲置',
            condition: '良好'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="设备名称"
                name="name"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备类型"
                name="type"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select placeholder="请选择设备类型">
                  <Option value="boat">🚤 救生艇</Option>
                  <Option value="drone">🚁 无人机</Option>
                  <Option value="medical">🏥 急救设备</Option>
                  <Option value="personal">🦺 个人装备</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="设备型号"
                name="model"
                rules={[{ required: true, message: '请输入设备型号' }]}
              >
                <Input placeholder="请输入设备型号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="存放位置"
                name="location"
                rules={[{ required: true, message: '请输入存放位置' }]}
              >
                <Input placeholder="请输入存放位置" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="设备状态"
                name="status"
              >
                <Select placeholder="请选择设备状态">
                  <Option value="闲置">闲置</Option>
                  <Option value="在用">在用</Option>
                  <Option value="维修中">维修中</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备状况"
                name="condition"
              >
                <Select placeholder="请选择设备状况">
                  <Option value="优秀">优秀</Option>
                  <Option value="良好">良好</Option>
                  <Option value="一般">一般</Option>
                  <Option value="需维修">需维修</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const equipmentType = getFieldValue('type');

              if (equipmentType === 'boat') {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="燃油量"
                          name="fuelLevel"
                        >
                          <Input placeholder="如：85%" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="技术规格"
                          name="specifications"
                        >
                          <Input placeholder="如：长4.8米，载重8人" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }

              if (equipmentType === 'drone') {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="电池电量"
                          name="batteryLevel"
                        >
                          <Input placeholder="如：100%" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="续航时间"
                          name="flightTime"
                        >
                          <Input placeholder="如：45分钟" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label="摄像头类型"
                      name="cameraType"
                    >
                      <Input placeholder="如：热成像+可见光" />
                    </Form.Item>
                  </>
                );
              }

              return null;
            }}
          </Form.Item>
        </Form>
      ) : (
        // 详情展示
        selectedEquipment && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="设备名称">{selectedEquipment.name}</Descriptions.Item>
              <Descriptions.Item label="设备型号">{selectedEquipment.model}</Descriptions.Item>
              <Descriptions.Item label="设备类型">
                <Tag color="blue">
                  {selectedEquipment.type === 'boat' ? '🚤 救生艇' :
                   selectedEquipment.type === 'drone' ? '🚁 无人机' : '🏥 急救设备'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={selectedEquipment.status === '闲置' ? 'green' : 'orange'}>
                  {selectedEquipment.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="存放位置">{selectedEquipment.location}</Descriptions.Item>
              <Descriptions.Item label="设备状况">
                <Tag color={selectedEquipment.condition === '优秀' ? 'green' : 'blue'}>
                  {selectedEquipment.condition}
                </Tag>
              </Descriptions.Item>
              {selectedEquipment.operator && (
                <Descriptions.Item label="当前操作员">{selectedEquipment.operator}</Descriptions.Item>
              )}
              <Descriptions.Item label="上次维护">{selectedEquipment.lastMaintenance}</Descriptions.Item>
              {selectedEquipment.nextMaintenance && (
                <Descriptions.Item label="下次维护">{selectedEquipment.nextMaintenance}</Descriptions.Item>
              )}
            </Descriptions>

            {selectedEquipment.type === 'boat' && (
              <>
                <Divider>救生艇详细信息</Divider>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="燃油量">{selectedEquipment.fuelLevel}</Descriptions.Item>
                  <Descriptions.Item label="技术规格">{selectedEquipment.specifications}</Descriptions.Item>
                </Descriptions>
              </>
            )}

            {selectedEquipment.type === 'drone' && (
              <>
                <Divider>无人机详细信息</Divider>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="电池电量">{selectedEquipment.batteryLevel}</Descriptions.Item>
                  <Descriptions.Item label="续航时间">{selectedEquipment.flightTime}</Descriptions.Item>
                  <Descriptions.Item label="摄像头类型" span={2}>{selectedEquipment.cameraType}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )
      )}
    </Modal>
  );

  // 处理物资表单提交
  const handleSuppliesSubmit = async () => {
    try {
      const values = await suppliesForm.validateFields();
      console.log('物资表单数据:', values);

      if (isEditingSupplies) {
        message.success('物资信息更新成功！');
      } else {
        message.success('物资添加成功！');
      }

      setSuppliesModalVisible(false);
      setIsEditingSupplies(false);
      suppliesForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理出入库操作
  const handleStockOperation = async () => {
    try {
      const values = await stockForm.validateFields();
      const currentTime = new Date().toLocaleString('zh-CN');

      // 生成新的记录ID
      const newRecordId = `SR${String(stockRecordsData.length + 1).padStart(3, '0')}`;

      // 创建出入库记录
      const newRecord = {
        id: newRecordId,
        suppliesId: selectedSuppliesItem.id,
        suppliesName: selectedSuppliesItem.name,
        type: stockOperation,
        quantity: values.quantity,
        operationTime: currentTime,
        operator: values.operator || '当前用户',
        location: selectedSuppliesItem.location,
        remark: values.remark || '',
        status: 'completed',
        ...(stockOperation === 'in' ? {
          supplier: values.supplier,
          inspector: values.inspector,
          qualityStatus: values.qualityStatus || 'qualified'
        } : {
          reason: values.reason,
          recipient: values.recipient,
          approver: values.approver
        })
      };

      // 更新库存数量
      setSuppliesData(prevData =>
        prevData.map(item => {
          if (item.id === selectedSuppliesItem.id) {
            const newStock = stockOperation === 'in'
              ? item.currentStock + values.quantity
              : item.currentStock - values.quantity;

            // 更新库存状态
            let newStatus = 'normal';
            if (newStock <= item.minStock * 0.5) {
              newStatus = 'critical';
            } else if (newStock <= item.minStock) {
              newStatus = 'low';
            }

            return {
              ...item,
              currentStock: newStock,
              lastUpdate: new Date().toLocaleDateString('zh-CN'),
              status: newStatus
            };
          }
          return item;
        })
      );

      // 添加出入库记录
      setStockRecordsData(prevRecords => [newRecord, ...prevRecords]);

      message.success(`物资${stockOperation === 'in' ? '入库' : '出库'}成功！库存已自动更新`);
      setStockInOutModalVisible(false);
      setSelectedSuppliesItem(null);
      stockForm.resetFields();
    } catch (error) {
      console.error('出入库操作失败:', error);
      message.error('操作失败，请检查输入信息');
    }
  };

  // 批量出入库操作
  const handleBatchStockOperation = async () => {
    try {
      const values = await stockForm.validateFields();
      const currentTime = new Date().toLocaleString('zh-CN');

      const newRecords = [];
      const updatedSupplies = [...suppliesData];

      selectedSuppliesItems.forEach((item, index) => {
        const quantity = values[`quantity_${item.id}`] || 0;
        if (quantity > 0) {
          // 创建记录
          const newRecord = {
            id: `SR${String(stockRecordsData.length + newRecords.length + 1).padStart(3, '0')}`,
            suppliesId: item.id,
            suppliesName: item.name,
            type: stockOperation,
            quantity: quantity,
            operationTime: currentTime,
            operator: values.operator || '当前用户',
            location: item.location,
            remark: values.remark || `批量${stockOperation === 'in' ? '入库' : '出库'}`,
            status: 'completed'
          };
          newRecords.push(newRecord);

          // 更新库存
          const suppliesIndex = updatedSupplies.findIndex(s => s.id === item.id);
          if (suppliesIndex !== -1) {
            const newStock = stockOperation === 'in'
              ? updatedSupplies[suppliesIndex].currentStock + quantity
              : updatedSupplies[suppliesIndex].currentStock - quantity;

            let newStatus = 'normal';
            if (newStock <= updatedSupplies[suppliesIndex].minStock * 0.5) {
              newStatus = 'critical';
            } else if (newStock <= updatedSupplies[suppliesIndex].minStock) {
              newStatus = 'low';
            }

            updatedSupplies[suppliesIndex] = {
              ...updatedSupplies[suppliesIndex],
              currentStock: newStock,
              lastUpdate: new Date().toLocaleDateString('zh-CN'),
              status: newStatus
            };
          }
        }
      });

      setSuppliesData(updatedSupplies);
      setStockRecordsData(prevRecords => [...newRecords, ...prevRecords]);

      message.success(`批量${stockOperation === 'in' ? '入库' : '出库'}成功！共处理 ${newRecords.length} 项物资`);
      setBatchOperationModalVisible(false);
      setSelectedSuppliesItems([]);
      stockForm.resetFields();
    } catch (error) {
      console.error('批量操作失败:', error);
      message.error('批量操作失败，请检查输入信息');
    }
  };

  // 渲染物资详情弹窗
  const renderSuppliesModal = () => (
    <Modal
      title={
        isEditingSupplies ?
          "✏️ 编辑物资信息" :
          "➕ 新增物资"
      }
      open={suppliesModalVisible}
      onCancel={() => {
        setSuppliesModalVisible(false);
        setIsEditingSupplies(false);
        suppliesForm.resetFields();
      }}
      width={600}
      footer={[
        <Button key="cancel" onClick={() => {
          setSuppliesModalVisible(false);
          setIsEditingSupplies(false);
          suppliesForm.resetFields();
        }}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSuppliesSubmit}>
          {isEditingSupplies ? '保存修改' : '添加物资'}
        </Button>
      ]}
    >
      <Form
        form={suppliesForm}
        layout="vertical"
        initialValues={{
          category: '救生设备',
          unit: '个',
          currentStock: 0,
          minStock: 10,
          maxStock: 100
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="物资名称"
              name="name"
              rules={[{ required: true, message: '请输入物资名称' }]}
            >
              <Input placeholder="请输入物资名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="物资类别"
              name="category"
              rules={[{ required: true, message: '请选择物资类别' }]}
            >
              <Select placeholder="请选择物资类别">
                <Option value="救生设备">救生设备</Option>
                <Option value="应急物资">应急物资</Option>
                <Option value="照明设备">照明设备</Option>
                <Option value="医疗用品">医疗用品</Option>
                <Option value="通讯设备">通讯设备</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="当前库存"
              name="currentStock"
              rules={[{ required: true, message: '请输入当前库存' }]}
            >
              <InputNumber min={0} placeholder="当前库存" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="最低库存"
              name="minStock"
              rules={[{ required: true, message: '请输入最低库存' }]}
            >
              <InputNumber min={0} placeholder="最低库存" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="最高库存"
              name="maxStock"
              rules={[{ required: true, message: '请输入最高库存' }]}
            >
              <InputNumber min={0} placeholder="最高库存" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="存放位置"
              name="location"
              rules={[{ required: true, message: '请输入存放位置' }]}
            >
              <Input placeholder="请输入存放位置" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="计量单位"
              name="unit"
              rules={[{ required: true, message: '请输入计量单位' }]}
            >
              <Select placeholder="请选择计量单位">
                <Option value="个">个</Option>
                <Option value="件">件</Option>
                <Option value="条">条</Option>
                <Option value="台">台</Option>
                <Option value="套">套</Option>
                <Option value="箱">箱</Option>
                <Option value="包">包</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="供应商"
              name="supplier"
              rules={[{ required: true, message: '请输入供应商' }]}
            >
              <Input placeholder="请输入供应商名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="单价（元）"
              name="price"
              rules={[{ required: true, message: '请输入单价' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                placeholder="请输入单价"
                style={{ width: '100%' }}
                addonAfter="元"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="规格说明"
          name="specifications"
          rules={[{ required: true, message: '请输入规格说明' }]}
        >
          <TextArea
            rows={2}
            placeholder="请输入物资规格、型号、技术参数等详细信息"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="备注说明"
          name="remark"
        >
          <TextArea rows={2} placeholder="请输入备注说明（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );

  // 渲染物资详情弹窗
  const renderSuppliesDetailModal = () => {
    if (!selectedSuppliesDetail) return null;

    // 模拟库存历史数据
    const stockHistory = [
      { date: '2024-01-15', type: '入库', quantity: 50, operator: '张三', reason: '采购补充' },
      { date: '2024-01-10', type: '出库', quantity: 15, operator: '李四', reason: '救援任务使用' },
      { date: '2024-01-05', type: '入库', quantity: 30, operator: '王五', reason: '紧急采购' },
      { date: '2023-12-28', type: '出库', quantity: 8, operator: '赵六', reason: '演练消耗' },
      { date: '2023-12-20', type: '入库', quantity: 25, operator: '张三', reason: '定期补充' }
    ];

    // 模拟使用记录数据
    const usageRecords = [
      { date: '2024-01-10', task: '海上救援-001', quantity: 15, location: '东海海域', status: '已完成' },
      { date: '2023-12-28', task: '应急演练-冬季', quantity: 8, location: '训练基地', status: '已完成' },
      { date: '2023-12-15', task: '海上救援-002', quantity: 12, location: '南海海域', status: '已完成' },
      { date: '2023-11-30', task: '设备检修', quantity: 5, location: '维修车间', status: '已完成' }
    ];

    const getStatusColor = (status) => {
      switch (status) {
        case 'normal': return '#52c41a';
        case 'low': return '#faad14';
        case 'critical': return '#ff4d4f';
        default: return '#d9d9d9';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'normal': return '正常';
        case 'low': return '偏低';
        case 'critical': return '紧急';
        default: return '未知';
      }
    };

    return (
      <Modal
        title={`📦 物资详情 - ${selectedSuppliesDetail.name}`}
        open={suppliesDetailModalVisible}
        onCancel={() => {
          setSuppliesDetailModalVisible(false);
          setSelectedSuppliesDetail(null);
        }}
        width={900}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            // 切换到编辑模式
            setSelectedSuppliesItem(selectedSuppliesDetail);
            setIsEditingSupplies(true);
            suppliesForm.setFieldsValue({
              name: selectedSuppliesDetail.name,
              category: selectedSuppliesDetail.category,
              currentStock: selectedSuppliesDetail.currentStock,
              minStock: selectedSuppliesDetail.minStock,
              maxStock: selectedSuppliesDetail.maxStock,
              location: selectedSuppliesDetail.location,
              unit: selectedSuppliesDetail.unit,
              supplier: selectedSuppliesDetail.supplier,
              price: selectedSuppliesDetail.price || 0,
              specifications: selectedSuppliesDetail.specifications || ''
            });
            setSuppliesDetailModalVisible(false);
            setSuppliesModalVisible(true);
          }}>
            编辑物资
          </Button>,
          <Button key="close" onClick={() => {
            setSuppliesDetailModalVisible(false);
            setSelectedSuppliesDetail(null);
          }}>
            关闭
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="basic" items={[
          {
            key: 'basic',
            label: '📋 基本信息',
            children: (
              <div>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="物资名称">{selectedSuppliesDetail.name}</Descriptions.Item>
                  <Descriptions.Item label="物资类别">{selectedSuppliesDetail.category}</Descriptions.Item>
                  <Descriptions.Item label="当前库存">
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {selectedSuppliesDetail.currentStock} {selectedSuppliesDetail.unit}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="库存状态">
                    <Tag color={getStatusColor(selectedSuppliesDetail.status)}>
                      {getStatusText(selectedSuppliesDetail.status)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="最低库存">{selectedSuppliesDetail.minStock} {selectedSuppliesDetail.unit}</Descriptions.Item>
                  <Descriptions.Item label="最高库存">{selectedSuppliesDetail.maxStock} {selectedSuppliesDetail.unit}</Descriptions.Item>
                  <Descriptions.Item label="存放位置">{selectedSuppliesDetail.location}</Descriptions.Item>
                  <Descriptions.Item label="供应商">{selectedSuppliesDetail.supplier}</Descriptions.Item>
                  <Descriptions.Item label="单价">¥{selectedSuppliesDetail.price || 0}</Descriptions.Item>
                  <Descriptions.Item label="最后更新">{selectedSuppliesDetail.lastUpdate}</Descriptions.Item>
                  <Descriptions.Item label="规格说明" span={2}>
                    {selectedSuppliesDetail.specifications || '暂无规格说明'}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 16 }}>
                  <Alert
                    message="库存状态分析"
                    description={
                      <div>
                        <Progress
                          percent={Math.round((selectedSuppliesDetail.currentStock / selectedSuppliesDetail.maxStock) * 100)}
                          strokeColor={getStatusColor(selectedSuppliesDetail.status)}
                          format={() => `${selectedSuppliesDetail.currentStock}/${selectedSuppliesDetail.maxStock}`}
                        />
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                          库存利用率：{Math.round((selectedSuppliesDetail.currentStock / selectedSuppliesDetail.maxStock) * 100)}%
                          {selectedSuppliesDetail.status !== 'normal' && (
                            <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                              ⚠️ 建议及时补充库存
                            </span>
                          )}
                        </div>
                      </div>
                    }
                    type="info"
                  />
                </div>
              </div>
            )
          },
          {
            key: 'history',
            label: '📈 库存历史',
            children: (
              <Table
                dataSource={stockHistory}
                pagination={false}
                size="small"
                columns={[
                  { title: '日期', dataIndex: 'date', key: 'date' },
                  {
                    title: '操作类型',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type) => (
                      <Tag color={type === '入库' ? 'green' : 'orange'}>
                        {type}
                      </Tag>
                    )
                  },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (qty) => `${qty} ${selectedSuppliesDetail.unit}` },
                  { title: '操作人', dataIndex: 'operator', key: 'operator' },
                  { title: '原因', dataIndex: 'reason', key: 'reason' }
                ]}
              />
            )
          },
          {
            key: 'usage',
            label: '🚨 使用记录',
            children: (
              <Table
                dataSource={usageRecords}
                pagination={false}
                size="small"
                columns={[
                  { title: '使用日期', dataIndex: 'date', key: 'date' },
                  { title: '任务名称', dataIndex: 'task', key: 'task' },
                  { title: '使用数量', dataIndex: 'quantity', key: 'quantity', render: (qty) => `${qty} ${selectedSuppliesDetail.unit}` },
                  { title: '使用地点', dataIndex: 'location', key: 'location' },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color="green">{status}</Tag>
                    )
                  }
                ]}
              />
            )
          }
        ]} />
      </Modal>
    );
  };

  // 处理队员表单提交
  const handleMemberSubmit = (values) => {
    try {
      console.log('队员表单数据:', values);

      // 处理日期字段
      const processedValues = {
        ...values,
        joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        certExpiry: values.certExpiry ? Object.fromEntries(
          Object.entries(values.certExpiry).map(([cert, date]) => [
            cert,
            date ? date.format('YYYY-MM-DD') : null
          ]).filter(([cert, date]) => date)
        ) : {},
        certifications: Array.isArray(values.certifications) ? values.certifications : []
      };

      if (isEditingMember && selectedMember) {
        // 更新队员信息
        updateMember(selectedMember.id, processedValues);
        message.success(`队员"${values.name}"信息更新成功！`);
      } else if (currentTeamForMember) {
        // 添加新队员
        const newMember = addMember(currentTeamForMember.id, processedValues);
        message.success(`队员"${values.name}"添加成功！队伍人员数量已自动更新`);
      } else {
        message.error('未选择队伍，无法添加队员');
        return;
      }

      // 保持弹窗打开，返回到队员列表视图
      setSelectedMember(null);
      setIsEditingMember(false);
      memberForm.resetFields();
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('提交失败，请检查表单数据');
    }
  };

  // 渲染队员管理弹窗
  const renderMemberModal = () => (
    <Modal
      title={
        isEditingMember ?
          selectedMember ?
            `✏️ 编辑队员 - ${selectedMember.name}` :
            `➕ 添加队员 - ${currentTeamForMember?.name || ''}` :
          selectedMember && !isEditingMember ?
            `👤 ${selectedMember.name} - 队员详情` :
            `👥 ${currentTeamForMember?.name || ''} - 队员管理`
      }
      open={memberModalVisible}
      onCancel={() => {
        setMemberModalVisible(false);
        setCurrentTeamForMember(null);
        setSelectedMember(null);
        setIsEditingMember(false);
        memberForm.resetFields();
      }}
      width={isEditingMember ? 800 : 1200}
      zIndex={1020}
      destroyOnClose
      className={styles.memberModal}
      footer={
        isEditingMember ? [
          <Button key="cancel" onClick={() => {
            setIsEditingMember(false);
            setSelectedMember(null);
            memberForm.resetFields();
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" htmlType="submit" form="memberForm">
            {selectedMember ? '保存修改' : '添加队员'}
          </Button>
        ] : [
          <Button key="cancel" onClick={() => setMemberModalVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" onClick={() => {
            setSelectedMember(null);
            setIsEditingMember(true);
            memberForm.resetFields();
          }}>
            添加队员
          </Button>,
          <Button key="test" onClick={() => {
            const currentMembers = getTeamMembers(currentTeamForMember.id);
            const currentTeam = rescueTeams.find(t => t.id === currentTeamForMember.id);
            message.info(`实时数据：队员${currentMembers.length}人，队伍记录${currentTeam?.memberCount}人`);
          }}>
            🔍 验证数据同步
          </Button>
        ]
      }
    >
      {isEditingMember ? (
        // 编辑/新增表单
        <Form
          id="memberForm"
          form={memberForm}
          layout="vertical"
          initialValues={{
            position: '队员',
            gender: '男',
            certifications: [],
            certExpiry: {}
          }}
          onFinish={handleMemberSubmit}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="姓名"
                name="name"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { min: 2, max: 10, message: '姓名长度应在2-10个字符之间' }
                ]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="职位"
                name="position"
                rules={[{ required: true, message: '请选择职位' }]}
              >
                <Select placeholder="请选择职位">
                  <Option value="队长">队长</Option>
                  <Option value="副队长">副队长</Option>
                  <Option value="队员">队员</Option>
                  <Option value="见习队员">见习队员</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="年龄"
                name="age"
                rules={[
                  { required: true, message: '请输入年龄' },
                  { type: 'number', min: 18, max: 65, message: '年龄应在18-65岁之间' }
                ]}
              >
                <InputNumber min={18} max={65} placeholder="请输入年龄" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="性别"
                name="gender"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Radio.Group>
                  <Radio value="男">男</Radio>
                  <Radio value="女">女</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="联系方式"
                name="phone"
                rules={[
                  { required: true, message: '请输入联系方式' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入手机号码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="工作经验"
                name="experience"
                rules={[{ required: true, message: '请输入工作经验' }]}
              >
                <Input placeholder="如：3年" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="技能认证"
                name="certifications"
                rules={[{ required: true, message: '请选择至少一项技能认证' }]}
              >
                <Select mode="multiple" placeholder="请选择技能认证">
                  <Option value="急救证">急救证</Option>
                  <Option value="救生员证">救生员证</Option>
                  <Option value="潜水证">潜水证</Option>
                  <Option value="水下焊接证">水下焊接证</Option>
                  <Option value="船舶驾驶证">船舶驾驶证</Option>
                  <Option value="无线电操作证">无线电操作证</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="入队时间"
                name="joinDate"
                rules={[{ required: true, message: '请选择入队时间' }]}
              >
                <DatePicker placeholder="请选择入队时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="证书到期时间"
            tooltip="为选中的技能认证设置到期时间，系统将自动提醒续证"
          >
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.certifications !== currentValues.certifications
              }
            >
              {({ getFieldValue }) => {
                const certifications = getFieldValue('certifications') || [];
                return certifications.length > 0 ? (
                  <Row gutter={[16, 8]}>
                    {certifications.map((cert, index) => (
                      <Col span={12} key={`${cert}-${index}`}>
                        <Form.Item
                          name={['certExpiry', cert]}
                          label={cert}
                          rules={[{ required: true, message: `请设置${cert}到期时间` }]}
                        >
                          <DatePicker placeholder={`${cert}到期时间`} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                    请先选择技能认证
                  </div>
                );
              }}
            </Form.Item>
          </Form.Item>

          <Form.Item
            label="备注信息"
            name="remark"
          >
            <TextArea rows={3} placeholder="请输入备注信息（可选）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      ) : selectedMember && !isEditingMember ? (
        // 队员详情展示
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setSelectedMember(null)}
              style={{ marginBottom: 16 }}
            >
              返回队员列表
            </Button>
          </div>

          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="姓名">{selectedMember.name || '未知'}</Descriptions.Item>
            <Descriptions.Item label="职位">
              <Tag color="blue">{selectedMember.position || '未知'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="年龄">{selectedMember.age || '未知'}岁</Descriptions.Item>
            <Descriptions.Item label="性别">{selectedMember.gender || '未知'}</Descriptions.Item>
            <Descriptions.Item label="联系方式">{selectedMember.contact || '未填写'}</Descriptions.Item>
            <Descriptions.Item label="入队时间">{selectedMember.joinDate || '未知'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedMember.status === '值班中' ? 'green' :
                         selectedMember.status === '待命' ? 'blue' :
                         selectedMember.status === '训练中' ? 'orange' : 'default'}>
                {selectedMember.status || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="紧急联系人">{selectedMember.emergencyContact || '未填写'}</Descriptions.Item>
            <Descriptions.Item label="证书" span={2}>
              {selectedMember.certifications && selectedMember.certifications.length > 0 ? (
                <Space wrap>
                  {selectedMember.certifications.map(cert => (
                    <Tag key={cert} color="green">{cert}</Tag>
                  ))}
                </Space>
              ) : (
                <span style={{ color: '#999' }}>暂无证书</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {selectedMember.notes || '无备注'}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setIsEditingMember(true);
                  memberForm.setFieldsValue({
                    ...selectedMember,
                    joinDate: selectedMember.joinDate ? moment(selectedMember.joinDate) : null,
                    certExpiry: Object.fromEntries(
                      Object.entries(selectedMember.certExpiry || {}).map(([cert, date]) => [
                        cert,
                        moment(date)
                      ])
                    )
                  });
                }}
              >
                编辑队员信息
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        // 队员列表展示
        currentTeamForMember && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Alert
                message={`当前队伍：${currentTeamForMember.name} | 队长：${allMembers.find(member => member.teamId === currentTeamForMember.id && member.position === '队长')?.name || '暂无队长'} | 总人数：${allMembers.filter(member => member.teamId === currentTeamForMember.id).length}人`}
                type="info"
              />
            </div>

            {/* 搜索筛选区域 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Input.Search
                    placeholder="搜索队员姓名"
                    value={memberSearchText}
                    onChange={(e) => setMemberSearchText(e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="职位筛选"
                    style={{ width: '100%' }}
                    value={memberPositionFilter}
                    onChange={setMemberPositionFilter}
                  >
                    <Option value="all">全部职位</Option>
                    <Option value="队长">队长</Option>
                    <Option value="副队长">副队长</Option>
                    <Option value="队员">队员</Option>
                    <Option value="见习队员">见习队员</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="证书状态筛选"
                    style={{ width: '100%' }}
                    value={memberCertFilter}
                    onChange={setMemberCertFilter}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="expiring">即将到期</Option>
                    <Option value="expired">已到期</Option>
                    <Option value="normal">正常</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Table
              columns={[
                { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
                { title: '职位', dataIndex: 'position', key: 'position', width: 100 },
                { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
                { title: '性别', dataIndex: 'gender', key: 'gender', width: 80 },
                { title: '联系方式', dataIndex: 'phone', key: 'phone', width: 120 },
                {
                  title: '技能认证',
                  dataIndex: 'certifications',
                  key: 'certifications',
                  width: 200,
                  render: (certs) => (
                    <div>
                      {(Array.isArray(certs) ? certs : []).map(cert => (
                        <Tag key={cert} size="small" color="blue">{cert}</Tag>
                      ))}
                    </div>
                  )
                },
                {
                  title: '证书到期',
                  key: 'certExpiry',
                  width: 150,
                  render: (_, record) => (
                    <div>
                      {Object.entries(record.certExpiry || {}).map(([cert, expiry], index) => {
                        if (!expiry) return null;

                        const expiryDate = new Date(expiry);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                        const isExpired = daysUntilExpiry < 0;
                        const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

                        return (
                          <div key={`${cert}-${index}`} style={{ fontSize: '12px', marginBottom: 2 }}>
                            <Tag
                              size="small"
                              color={isExpired ? 'red' : isExpiringSoon ? 'orange' : 'green'}
                            >
                              {cert}: {expiry}
                              {isExpired && ' (已过期)'}
                              {isExpiringSoon && !isExpired && ` (${daysUntilExpiry}天后到期)`}
                            </Tag>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )
                },
                { title: '工作经验', dataIndex: 'experience', key: 'experience', width: 100 },
                { title: '入队时间', dataIndex: 'joinDate', key: 'joinDate', width: 120 },
                {
                  title: '操作',
                  key: 'action',
                  width: 150,
                  render: (_, record) => (
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setSelectedMember(record);
                          setIsEditingMember(false);
                        }}
                      >
                        查看详情
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setSelectedMember(record);
                          setIsEditingMember(true);
                          memberForm.setFieldsValue({
                            ...record,
                            joinDate: record.joinDate ? moment(record.joinDate) : null,
                            certExpiry: Object.fromEntries(
                              Object.entries(record.certExpiry || {}).map(([cert, date]) => [
                                cert,
                                moment(date)
                              ])
                            )
                          });
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          Modal.confirm({
                            title: '确认移除',
                            content: `确定要从队伍中移除队员"${record.name}"吗？`,
                            okText: '确认移除',
                            cancelText: '取消',
                            onOk() {
                              deleteMember(record.id);
                              message.success(`队员"${record.name}"已从队伍中移除，队伍人员数量已自动更新`);
                            }
                          });
                        }}
                      >
                        移除
                      </Button>
                    </Space>
                  )
                }
              ]}
              dataSource={currentTeamForMember ? getTeamMembers(currentTeamForMember.id).filter(member => {
                const matchesSearch = !memberSearchText ||
                  member.name.toLowerCase().includes(memberSearchText.toLowerCase());
                const matchesPosition = memberPositionFilter === 'all' ||
                  member.position === memberPositionFilter;

                let matchesCertStatus = true;
                if (memberCertFilter !== 'all') {
                  const hasExpiredCert = Object.values(member.certExpiry || {}).some(expiry => {
                    const daysUntilExpiry = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
                    if (memberCertFilter === 'expired') return daysUntilExpiry < 0;
                    if (memberCertFilter === 'expiring') return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
                    if (memberCertFilter === 'normal') return daysUntilExpiry > 30;
                    return false;
                  });
                  matchesCertStatus = hasExpiredCert;
                }

                return matchesSearch && matchesPosition && matchesCertStatus;
              }) : []}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1200 }}
              size="small"
            />
          </div>
        )
      )}
    </Modal>
  );

  // 统计数据计算函数
  const calculateTeamStatistics = () => {
    const teams = rescueTeamsData;

    // 队伍数量统计
    const teamsByRegion = teams.reduce((acc, team) => {
      const region = team.location.split('区')[0] + '区';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    const teamsByType = teams.reduce((acc, team) => {
      acc[team.type] = (acc[team.type] || 0) + 1;
      return acc;
    }, {});

    const teamsByStatus = teams.reduce((acc, team) => {
      acc[team.status] = (acc[team.status] || 0) + 1;
      return acc;
    }, {});

    // 人员配置分析 - 使用实际的队员数据
    const totalMembers = allMembers.length;
    const averageAge = totalMembers > 0 ?
      Math.round(allMembers.reduce((sum, member) => sum + member.age, 0) / totalMembers) : 0;

    const genderRatio = allMembers.reduce((acc, member) => {
      acc[member.gender] = (acc[member.gender] || 0) + 1;
      return acc;
    }, {});

    // 技能认证分布
    const certificationStats = allMembers.reduce((acc, member) => {
      member.certifications.forEach(cert => {
        acc[cert] = (acc[cert] || 0) + 1;
      });
      return acc;
    }, {});

    // 证书到期统计
    const certExpiryStats = { expired: 0, expiring: 0, normal: 0 };
    allMembers.forEach(member => {
      Object.values(member.certExpiry || {}).forEach(expiry => {
        const daysUntilExpiry = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) certExpiryStats.expired++;
        else if (daysUntilExpiry <= 30) certExpiryStats.expiring++;
        else certExpiryStats.normal++;
      });
    });

    return {
      teamsByRegion,
      teamsByType,
      teamsByStatus,
      totalMembers,
      averageAge,
      genderRatio,
      certificationStats,
      certExpiryStats
    };
  };

  const calculateEquipmentStatistics = () => {
    const equipment = equipmentData;

    // 设备总览
    const equipmentByType = equipment.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const equipmentByStatus = equipment.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // 设备利用率
    const totalEquipment = equipment.length;
    const idleEquipment = equipment.filter(item => item.status === '闲置').length;
    const inUseEquipment = equipment.filter(item => item.status === '使用中').length;
    const maintenanceEquipment = equipment.filter(item => item.status === '维修中').length;

    const utilizationRate = totalEquipment > 0 ?
      Math.round((inUseEquipment / totalEquipment) * 100) : 0;
    const idleRate = totalEquipment > 0 ?
      Math.round((idleEquipment / totalEquipment) * 100) : 0;

    // 设备价值统计（模拟数据）
    const totalValue = equipment.reduce((sum, item) => {
      const baseValue = item.type === '救生艇' ? 50000 :
                       item.type === '无人机' ? 30000 :
                       item.type === '潜水设备' ? 15000 : 5000;
      return sum + baseValue;
    }, 0);

    return {
      equipmentByType,
      equipmentByStatus,
      totalEquipment,
      utilizationRate,
      idleRate,
      maintenanceRate: Math.round((maintenanceEquipment / totalEquipment) * 100),
      totalValue
    };
  };

  const calculateSuppliesStatistics = () => {
    const supplies = suppliesData;

    // 库存状态分析
    const suppliesByStatus = supplies.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // 库存价值和数量
    const totalItems = supplies.reduce((sum, item) => sum + item.currentStock, 0);
    const lowStockItems = supplies.filter(item => item.status !== 'normal').length;
    const criticalItems = supplies.filter(item => item.status === 'critical').length;

    // 库存周转率（模拟数据）
    const turnoverRate = 75; // 模拟75%的周转率

    return {
      suppliesByStatus,
      totalItems,
      lowStockItems,
      criticalItems,
      turnoverRate,
      totalSuppliesTypes: supplies.length
    };
  };

  // 图表配置函数
  const getTeamDistributionChartOption = () => {
    const teamStats = calculateTeamStatistics();
    return {
      title: {
        text: '救援队伍类型分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: Object.keys(teamStats.teamsByType)
      },
      series: [
        {
          name: '队伍类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: Object.entries(teamStats.teamsByType).map(([type, count]) => ({
            value: count,
            name: type,
            itemStyle: {
              color: type === '水上救援' ? '#1890ff' :
                     type === '陆地救援' ? '#52c41a' :
                     type === '医疗救援' ? '#fa8c16' : '#722ed1'
            }
          }))
        }
      ]
    };
  };

  const getEquipmentStatusChartOption = () => {
    const equipmentStats = calculateEquipmentStatistics();
    return {
      title: {
        text: '设备状态统计',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['设备数量'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: Object.keys(equipmentStats.equipmentByStatus),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '数量'
      },
      series: [
        {
          name: '设备数量',
          type: 'bar',
          data: Object.entries(equipmentStats.equipmentByStatus).map(([status, count]) => ({
            value: count,
            itemStyle: {
              color: status === '正常' ? '#52c41a' :
                     status === '维修中' ? '#fa8c16' : '#f5222d'
            }
          })),
          barWidth: '60%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  };

  const getSuppliesInventoryChartOption = () => {
    const suppliesStats = calculateSuppliesStatistics();
    // 模拟月度库存趋势数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const categories = ['救生设备', '医疗用品', '通讯设备', '工具器材'];

    return {
      title: {
        text: '物资库存趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: categories,
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months
      },
      yAxis: {
        type: 'value',
        name: '库存数量'
      },
      series: categories.map((category, index) => ({
        name: category,
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: months.map(() => Math.floor(Math.random() * 100) + 50),
        itemStyle: {
          color: ['#1890ff', '#52c41a', '#fa8c16', '#722ed1'][index]
        },
        areaStyle: {
          opacity: 0.3
        }
      }))
    };
  };

  const getRescueTaskChartOption = () => {
    // 模拟救援任务数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const taskData = [
      { name: '已完成', data: [12, 15, 18, 22, 19, 25] },
      { name: '进行中', data: [3, 2, 4, 3, 5, 2] },
      { name: '待分配', data: [1, 1, 2, 1, 1, 3] }
    ];

    return {
      title: {
        text: '月度救援任务统计',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: taskData.map(item => item.name),
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: months
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '任务数量'
        }
      ],
      series: taskData.map((item, index) => ({
        name: item.name,
        type: 'line',
        stack: 'Total',
        areaStyle: {
          opacity: 0.6
        },
        emphasis: {
          focus: 'series'
        },
        data: item.data,
        itemStyle: {
          color: index === 0 ? '#52c41a' : index === 1 ? '#1890ff' : '#fa8c16'
        }
      }))
    };
  };

  // 自动刷新功能
  useEffect(() => {
    if (autoRefresh && statisticsModalVisible) {
      const interval = setInterval(() => {
        // 这里可以添加数据刷新逻辑
        console.log('自动刷新统计数据');
      }, 30000); // 30秒刷新一次

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, statisticsModalVisible]);

  // 数据导出功能
  const handleExportStatistics = (format) => {
    const teamStats = calculateTeamStatistics();
    const equipmentStats = calculateEquipmentStatistics();
    const suppliesStats = calculateSuppliesStatistics();

    if (format === 'excel') {
      // 模拟Excel导出
      message.success('统计报表已导出为Excel文件');
    } else if (format === 'pdf') {
      // 模拟PDF导出
      message.success('统计报表已导出为PDF文件');
    }
  };

  // 处理培训记录表单提交
  const handleTrainingSubmit = async () => {
    try {
      const values = await trainingForm.validateFields();
      console.log('培训记录表单数据:', values);

      if (isEditingTraining && selectedTraining) {
        message.success('培训记录更新成功！');
      } else {
        message.success('培训记录添加成功！');
      }

      setTrainingModalVisible(false);
      setSelectedTraining(null);
      setIsEditingTraining(false);
      trainingForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染培训记录弹窗
  const renderTrainingModal = () => (
    <Modal
      title={
        isEditingTraining ?
          `✏️ 编辑培训记录` :
          selectedTraining ?
            `📚 培训记录详情` :
            `📚 ${selectedTeam?.name || ''} - 培训记录管理`
      }
      open={trainingModalVisible}
      onCancel={() => {
        setTrainingModalVisible(false);
        setSelectedTeam(null);
        setSelectedTraining(null);
        setIsEditingTraining(false);
        trainingForm.resetFields();
      }}
      width={isEditingTraining || selectedTraining ? 800 : 1000}
      zIndex={2000}
      destroyOnClose
      className={styles.trainingModal}
      footer={
        isEditingTraining ? [
          <Button key="cancel" onClick={() => {
            setIsEditingTraining(false);
            setSelectedTraining(null);
            trainingForm.resetFields();
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleTrainingSubmit}>
            保存修改
          </Button>
        ] : selectedTraining ? [
          <Button key="cancel" onClick={() => {
            setSelectedTraining(null);
          }}>
            返回列表
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setIsEditingTraining(true);
            trainingForm.setFieldsValue({
              ...selectedTraining,
              date: moment(selectedTraining.date),
              nextTraining: selectedTraining.nextTraining ? moment(selectedTraining.nextTraining) : null
            });
          }}>
            编辑记录
          </Button>
        ] : [
          <Button key="cancel" onClick={() => setTrainingModalVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" onClick={() => {
            setSelectedTraining(null);
            setIsEditingTraining(true);
            trainingForm.resetFields();
          }}>
            添加培训记录
          </Button>
        ]
      }
    >
      {isEditingTraining ? (
        // 编辑/新增培训记录表单
        <Form
          form={trainingForm}
          layout="vertical"
          initialValues={{
            result: '合格',
            participants: []
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="培训日期"
                name="date"
                rules={[{ required: true, message: '请选择培训日期' }]}
              >
                <DatePicker placeholder="请选择培训日期" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="培训类型"
                name="type"
                rules={[{ required: true, message: '请输入培训类型' }]}
              >
                <Select placeholder="请选择培训类型">
                  <Option value="水上救援技能培训">水上救援技能培训</Option>
                  <Option value="急救技能复训">急救技能复训</Option>
                  <Option value="潜水技能培训">潜水技能培训</Option>
                  <Option value="设备操作培训">设备操作培训</Option>
                  <Option value="安全知识培训">安全知识培训</Option>
                  <Option value="团队协作训练">团队协作训练</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="培训讲师"
                name="instructor"
                rules={[{ required: true, message: '请输入培训讲师' }]}
              >
                <Input placeholder="请输入培训讲师姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="培训时长"
                name="duration"
                rules={[{ required: true, message: '请输入培训时长' }]}
              >
                <Input placeholder="如：8小时" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="参训人员"
            name="participants"
            rules={[{ required: true, message: '请选择参训人员' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择参训人员"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {selectedTeam?.members?.map(member => (
                <Option key={member.id} value={member.name}>
                  {member.name} - {member.position}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="培训结果"
                name="result"
                rules={[{ required: true, message: '请选择培训结果' }]}
              >
                <Select placeholder="请选择培训结果">
                  <Option value="优秀">优秀</Option>
                  <Option value="合格">合格</Option>
                  <Option value="不合格">不合格</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="下次培训时间"
                name="nextTraining"
                tooltip="可选，设置下次培训提醒时间"
              >
                <DatePicker placeholder="请选择下次培训时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="培训内容"
            name="content"
            rules={[{ required: true, message: '请输入培训内容' }]}
          >
            <TextArea rows={4} placeholder="请详细描述培训内容和要点..." maxLength={500} showCount />
          </Form.Item>

          <Form.Item
            label="培训总结"
            name="summary"
          >
            <TextArea rows={3} placeholder="请输入培训总结和改进建议（可选）" maxLength={300} showCount />
          </Form.Item>
        </Form>
      ) : selectedTraining ? (
        // 培训记录详情展示
        <div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="培训日期">{selectedTraining.date}</Descriptions.Item>
            <Descriptions.Item label="培训类型">{selectedTraining.type}</Descriptions.Item>
            <Descriptions.Item label="培训讲师">{selectedTraining.instructor}</Descriptions.Item>
            <Descriptions.Item label="培训时长">{selectedTraining.duration}</Descriptions.Item>
            <Descriptions.Item label="培训结果">
              <Tag color={selectedTraining.result === '优秀' ? 'green' : selectedTraining.result === '合格' ? 'blue' : 'red'}>
                {selectedTraining.result}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下次培训">{selectedTraining.nextTraining || '未设置'}</Descriptions.Item>
          </Descriptions>

          <Divider>参训人员</Divider>
          <div style={{ marginBottom: 16 }}>
            {selectedTraining.participants?.map(name => (
              <Tag key={name} color="blue" style={{ margin: '2px' }}>{name}</Tag>
            ))}
          </div>

          {selectedTraining.content && (
            <>
              <Divider>培训内容</Divider>
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedTraining.content}
              </div>
            </>
          )}

          {selectedTraining.summary && (
            <>
              <Divider>培训总结</Divider>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedTraining.summary}
              </div>
            </>
          )}
        </div>
      ) : (
        // 培训记录列表
        selectedTeam && (
          <div>
            <Tabs defaultActiveKey="records" items={[
              {
                key: 'records',
                label: '培训历史',
                children: (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Alert
                        message={`队伍：${selectedTeam.name} | 总培训次数：${selectedTeam.trainingRecords?.length || 0}次`}
                        type="info"
                      />
                    </div>

                    <Table
                      columns={[
                        { title: '培训日期', dataIndex: 'date', key: 'date', width: 120 },
                        { title: '培训类型', dataIndex: 'type', key: 'type', width: 180 },
                        { title: '培训讲师', dataIndex: 'instructor', key: 'instructor', width: 120 },
                        { title: '培训时长', dataIndex: 'duration', key: 'duration', width: 100 },
                        {
                          title: '参训人员',
                          dataIndex: 'participants',
                          key: 'participants',
                          width: 200,
                          render: (participants) => (
                            <div>
                              {participants.slice(0, 2).map(name => (
                                <Tag key={name} size="small">{name}</Tag>
                              ))}
                              {participants.length > 2 && <span>等{participants.length}人</span>}
                            </div>
                          )
                        },
                        {
                          title: '培训结果',
                          dataIndex: 'result',
                          key: 'result',
                          width: 100,
                          render: (result) => (
                            <Tag color={result === '优秀' ? 'green' : result === '合格' ? 'blue' : 'red'}>
                              {result}
                            </Tag>
                          )
                        },
                        { title: '下次培训', dataIndex: 'nextTraining', key: 'nextTraining', width: 120 },
                        {
                          title: '操作',
                          key: 'action',
                          width: 150,
                          render: (_, record) => (
                            <Space>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => setSelectedTraining(record)}
                              >
                                查看
                              </Button>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                  setSelectedTraining(record);
                                  setIsEditingTraining(true);
                                  trainingForm.setFieldsValue({
                                    ...record,
                                    date: moment(record.date),
                                    nextTraining: record.nextTraining ? moment(record.nextTraining) : null
                                  });
                                }}
                              >
                                编辑
                              </Button>
                              <Button
                                type="link"
                                size="small"
                                danger
                                onClick={() => {
                                  Modal.confirm({
                                    title: '确认删除',
                                    content: '确定要删除这条培训记录吗？',
                                    okText: '确认删除',
                                    cancelText: '取消',
                                    onOk() {
                                      message.success('培训记录已删除');
                                    }
                                  });
                                }}
                              >
                                删除
                              </Button>
                            </Space>
                          )
                        }
                      ]}
                      dataSource={selectedTeam.trainingRecords || []}
                      pagination={{ pageSize: 8 }}
                      size="small"
                    />
                  </div>
                )
              },
              {
                key: 'schedule',
                label: '培训计划',
                children: (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Alert
                        message="培训提醒：基于培训记录自动生成复训提醒"
                        type="warning"
                      />
                    </div>

                    <Table
                      columns={[
                        { title: '培训项目', dataIndex: 'project', key: 'project' },
                        { title: '上次培训', dataIndex: 'lastTraining', key: 'lastTraining' },
                        { title: '建议复训时间', dataIndex: 'suggestedDate', key: 'suggestedDate' },
                        { title: '状态', dataIndex: 'status', key: 'status', render: (status) => (
                          <Tag color={status === '需要复训' ? 'red' : status === '即将到期' ? 'orange' : 'green'}>
                            {status}
                          </Tag>
                        )},
                        { title: '操作', key: 'action', render: () => (
                          <Button type="link" size="small">安排培训</Button>
                        )}
                      ]}
                      dataSource={[
                        {
                          key: '1',
                          project: '急救技能复训',
                          lastTraining: '2024-01-10',
                          suggestedDate: '2024-07-10',
                          status: '即将到期'
                        },
                        {
                          key: '2',
                          project: '水上救援技能',
                          lastTraining: '2023-12-05',
                          suggestedDate: '2024-06-05',
                          status: '需要复训'
                        }
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </div>
                )
              }
            ]} />
          </div>
        )
      )}
    </Modal>
  );

  // 渲染设备申领弹窗
  const renderEquipmentApplyModal = () => (
    <Modal
      title="📋 设备申领申请"
      open={equipmentApplyModalVisible}
      onCancel={() => {
        setEquipmentApplyModalVisible(false);
        applyForm.resetFields();
      }}
      width={600}
      footer={[
        <Button key="cancel" onClick={() => setEquipmentApplyModalVisible(false)}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => {
          message.success('申领申请已提交，等待审批');
          setEquipmentApplyModalVisible(false);
        }}>
          提交申请
        </Button>
      ]}
    >
      <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
        <p>设备申领功能开发中...</p>
        <p>将包含申请表单、审批流程、归还确认等功能</p>
      </div>
    </Modal>
  );

  // 渲染出入库弹窗
  const renderStockInOutModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{stockOperation === 'in' ? '📥' : '📤'}</span>
          <span>物资{stockOperation === 'in' ? '入库' : '出库'}</span>
          {selectedSuppliesItem && (
            <Tag color="blue">{selectedSuppliesItem.name}</Tag>
          )}
        </div>
      }
      open={stockInOutModalVisible}
      onCancel={() => {
        setStockInOutModalVisible(false);
        setSelectedSuppliesItem(null);
        stockForm.resetFields();
      }}
      width={600}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setStockInOutModalVisible(false);
            setSelectedSuppliesItem(null);
            stockForm.resetFields();
          }}
        >
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleStockOperation}
          loading={false}
        >
          确认{stockOperation === 'in' ? '入库' : '出库'}
        </Button>
      ]}
    >
      {selectedSuppliesItem && (
        <div>
          {/* 物资信息展示 */}
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div><strong>物资名称：</strong>{selectedSuppliesItem.name}</div>
                <div><strong>物资类别：</strong>{selectedSuppliesItem.category}</div>
              </Col>
              <Col span={12}>
                <div><strong>当前库存：</strong>{selectedSuppliesItem.currentStock} {selectedSuppliesItem.unit}</div>
                <div><strong>存放位置：</strong>{selectedSuppliesItem.location}</div>
              </Col>
            </Row>
          </Card>

          <Form
            form={stockForm}
            layout="vertical"
            initialValues={{
              operationTime: new Date().toLocaleString('zh-CN'),
              operator: '当前用户'
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="操作数量"
                  name="quantity"
                  rules={[
                    { required: true, message: '请输入操作数量' },
                    { type: 'number', min: 1, message: '数量必须大于0' },
                    ...(stockOperation === 'out' ? [{
                      validator: (_, value) => {
                        if (value > selectedSuppliesItem.currentStock) {
                          return Promise.reject(new Error(`出库数量不能超过当前库存(${selectedSuppliesItem.currentStock})`));
                        }
                        return Promise.resolve();
                      }
                    }] : [])
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入数量"
                    min={1}
                    max={stockOperation === 'out' ? selectedSuppliesItem.currentStock : 9999}
                    addonAfter={selectedSuppliesItem.unit}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="操作时间"
                  name="operationTime"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="操作人员"
                  name="operator"
                  rules={[{ required: true, message: '请输入操作人员' }]}
                >
                  <Input placeholder="请输入操作人员姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                {stockOperation === 'in' ? (
                  <Form.Item
                    label="验收人员"
                    name="inspector"
                    rules={[{ required: true, message: '请输入验收人员' }]}
                  >
                    <Input placeholder="请输入验收人员姓名" />
                  </Form.Item>
                ) : (
                  <Form.Item
                    label="领用人员"
                    name="recipient"
                    rules={[{ required: true, message: '请输入领用人员' }]}
                  >
                    <Input placeholder="请输入领用人员姓名" />
                  </Form.Item>
                )}
              </Col>
            </Row>

            {stockOperation === 'in' ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="供应商"
                    name="supplier"
                    initialValue={selectedSuppliesItem.supplier}
                  >
                    <Input placeholder="请输入供应商名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="质量状态"
                    name="qualityStatus"
                    initialValue="qualified"
                  >
                    <Select>
                      <Option value="qualified">✅ 合格</Option>
                      <Option value="unqualified">❌ 不合格</Option>
                      <Option value="pending">⏳ 待检验</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="出库原因"
                    name="reason"
                    rules={[{ required: true, message: '请选择出库原因' }]}
                  >
                    <Select placeholder="请选择出库原因">
                      <Option value="应急救援任务">🚨 应急救援任务</Option>
                      <Option value="日常训练">🏃 日常训练</Option>
                      <Option value="设备维护">🔧 设备维护</Option>
                      <Option value="物资调拨">📦 物资调拨</Option>
                      <Option value="其他">📝 其他</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="审批人员"
                    name="approver"
                    rules={[{ required: true, message: '请输入审批人员' }]}
                  >
                    <Input placeholder="请输入审批人员姓名" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Form.Item
              label="备注信息"
              name="remark"
            >
              <TextArea
                rows={3}
                placeholder="请输入备注信息（可选）"
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );

  // 渲染出入库记录弹窗
  const renderStockRecordsModal = () => (
    <Modal
      title="📋 出入库记录"
      open={stockRecordsModalVisible}
      onCancel={() => setStockRecordsModalVisible(false)}
      width={1200}
      footer={[
        <Button key="close" onClick={() => setStockRecordsModalVisible(false)}>
          关闭
        </Button>,
        <Button key="export" type="primary" icon={<DownloadOutlined />}>
          导出记录
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索物资名称、操作人员"
            style={{ width: 250 }}
            allowClear
          />
          <Select placeholder="操作类型" style={{ width: 120 }}>
            <Option value="all">全部类型</Option>
            <Option value="in">入库</Option>
            <Option value="out">出库</Option>
          </Select>
          <DatePicker.RangePicker
            placeholder={['开始时间', '结束时间']}
            style={{ width: 280 }}
            showTime
          />
          <Button icon={<ReloadOutlined />}>刷新</Button>
        </Space>
      </div>

      <Table
        columns={[
          {
            title: '记录编号',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (text) => <Tag color="blue">{text}</Tag>
          },
          {
            title: '操作类型',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (type) => (
              <Tag color={type === 'in' ? 'green' : 'orange'}>
                {type === 'in' ? '📥 入库' : '📤 出库'}
              </Tag>
            )
          },
          {
            title: '物资信息',
            key: 'suppliesInfo',
            width: 150,
            render: (_, record) => (
              <div>
                <div style={{ fontWeight: 500 }}>{record.suppliesName}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  数量: {record.quantity}
                </div>
              </div>
            )
          },
          {
            title: '操作人员',
            dataIndex: 'operator',
            key: 'operator',
            width: 100
          },
          {
            title: '相关人员',
            key: 'relatedPerson',
            width: 100,
            render: (_, record) => (
              <div style={{ fontSize: '12px' }}>
                {record.type === 'in' ? (
                  <div>
                    <div>验收: {record.inspector}</div>
                    <div>供应商: {record.supplier}</div>
                  </div>
                ) : (
                  <div>
                    <div>领用: {record.recipient}</div>
                    <div>审批: {record.approver}</div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: '操作时间',
            dataIndex: 'operationTime',
            key: 'operationTime',
            width: 150,
            render: (time) => (
              <div style={{ fontSize: '12px' }}>
                {time}
              </div>
            )
          },
          {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            ellipsis: true,
            render: (text) => (
              <Tooltip title={text}>
                <span>{text}</span>
              </Tooltip>
            )
          },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status) => (
              <Tag color={status === 'completed' ? 'green' : 'orange'}>
                {status === 'completed' ? '已完成' : '进行中'}
              </Tag>
            )
          }
        ]}
        dataSource={stockRecordsData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
        }}
        scroll={{ x: 1000 }}
      />
    </Modal>
  );

  // 渲染批量操作弹窗
  const renderBatchOperationModal = () => (
    <Modal
      title={`📦 批量${stockOperation === 'in' ? '入库' : '出库'}`}
      open={batchOperationModalVisible}
      onCancel={() => {
        setBatchOperationModalVisible(false);
        stockForm.resetFields();
      }}
      width={800}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setBatchOperationModalVisible(false);
            stockForm.resetFields();
          }}
        >
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleBatchStockOperation}
        >
          确认批量{stockOperation === 'in' ? '入库' : '出库'}
        </Button>
      ]}
    >
      <Alert
        message={`已选择 ${selectedSuppliesItems.length} 项物资进行批量${stockOperation === 'in' ? '入库' : '出库'}`}
        type="info"
        style={{ marginBottom: 16 }}
      />

      <Form
        form={stockForm}
        layout="vertical"
        initialValues={{
          operator: '当前用户'
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="操作人员"
              name="operator"
              rules={[{ required: true, message: '请输入操作人员' }]}
            >
              <Input placeholder="请输入操作人员姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="备注信息"
              name="remark"
            >
              <Input placeholder="批量操作备注（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>
          <Space>
            物资数量设置
            <Button
              type="link"
              size="small"
              onClick={() => {
                const fields = {};
                selectedSuppliesItems.forEach(item => {
                  fields[`quantity_${item.id}`] = 1;
                });
                stockForm.setFieldsValue(fields);
                message.success('已为所有物资设置数量为1');
              }}
            >
              批量设置为1
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                const fields = {};
                selectedSuppliesItems.forEach(item => {
                  fields[`quantity_${item.id}`] = stockOperation === 'out' ?
                    Math.min(10, item.currentStock) : 10;
                });
                stockForm.setFieldsValue(fields);
                message.success('已为所有物资设置数量为10（或最大库存）');
              }}
            >
              批量设置为10
            </Button>
          </Space>
        </Divider>

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {selectedSuppliesItems.map((item) => (
            <Row key={item.id} gutter={16} style={{ marginBottom: 8 }}>
              <Col span={8}>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    当前库存: {item.currentStock} {item.unit}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={`quantity_${item.id}`}
                  rules={[
                    { required: true, message: '请输入数量' },
                    { type: 'number', min: 1, message: '数量必须大于0' },
                    ...(stockOperation === 'out' ? [{
                      validator: (_, value) => {
                        if (value > item.currentStock) {
                          return Promise.reject(new Error(`不能超过库存(${item.currentStock})`));
                        }
                        return Promise.resolve();
                      }
                    }] : [])
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="数量"
                    min={1}
                    max={stockOperation === 'out' ? item.currentStock : 9999}
                    addonAfter={item.unit}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div style={{ padding: '8px 0', fontSize: '12px', color: '#666' }}>
                  {item.location}
                </div>
              </Col>
            </Row>
          ))}
        </div>
      </Form>
    </Modal>
  );

  // 渲染库存盘点弹窗
  const renderInventoryModal = () => (
    <Modal
      title="📊 库存盘点"
      open={inventoryModalVisible}
      onCancel={() => setInventoryModalVisible(false)}
      width={1000}
      footer={[
        <Button key="close" onClick={() => setInventoryModalVisible(false)}>
          关闭
        </Button>,
        <Button key="export" type="primary" icon={<DownloadOutlined />}>
          导出盘点报告
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="库存盘点统计"
          description={
            <div>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="总物资种类" value={suppliesData.length} suffix="种" />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="正常库存"
                    value={suppliesData.filter(item => item.status === 'normal').length}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="种"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="库存偏低"
                    value={suppliesData.filter(item => item.status === 'low').length}
                    valueStyle={{ color: '#cf1322' }}
                    suffix="种"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="紧急补充"
                    value={suppliesData.filter(item => item.status === 'critical').length}
                    valueStyle={{ color: '#cf1322' }}
                    suffix="种"
                  />
                </Col>
              </Row>
            </div>
          }
          type="info"
        />
      </div>

      <Table
        columns={[
          {
            title: '物资名称',
            dataIndex: 'name',
            key: 'name',
            width: 120
          },
          {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            width: 100
          },
          {
            title: '当前库存',
            dataIndex: 'currentStock',
            key: 'currentStock',
            width: 100,
            render: (stock, record) => (
              <span style={{
                color: record.status === 'critical' ? '#ff4d4f' :
                       record.status === 'low' ? '#fa8c16' : '#52c41a'
              }}>
                {stock} {record.unit}
              </span>
            )
          },
          {
            title: '库存状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
              const statusMap = {
                normal: { text: '正常', color: 'green' },
                low: { text: '偏低', color: 'orange' },
                critical: { text: '紧急', color: 'red' }
              };
              const config = statusMap[status];
              return <Tag color={config.color}>{config.text}</Tag>;
            }
          },
          {
            title: '库存占用率',
            key: 'stockRate',
            width: 150,
            render: (_, record) => {
              const rate = Math.round((record.currentStock / record.maxStock) * 100);
              return (
                <div>
                  <Progress
                    percent={rate}
                    size="small"
                    status={record.status === 'critical' ? 'exception' : 'normal'}
                  />
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {record.minStock} - {record.maxStock} {record.unit}
                  </div>
                </div>
              );
            }
          },
          {
            title: '存放位置',
            dataIndex: 'location',
            key: 'location',
            width: 120
          },
          {
            title: '最后更新',
            dataIndex: 'lastUpdate',
            key: 'lastUpdate',
            width: 100
          }
        ]}
        dataSource={suppliesData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true
        }}
        scroll={{ x: 800 }}
      />
    </Modal>
  );

  // 渲染统计报表弹窗
  const renderStatisticsModal = () => {
    const teamStats = calculateTeamStatistics();
    const equipmentStats = calculateEquipmentStatistics();
    const suppliesStats = calculateSuppliesStatistics();

    return (
      <Modal
        title="📊 救援资源统计报表"
        open={statisticsModalVisible}
        onCancel={() => {
          setStatisticsModalVisible(false);
          if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
          }
          setAutoRefresh(false);
        }}
        width={1500}
        style={{
          top: 80,
          paddingBottom: 0
        }}
        className={styles.statisticsModal}
        bodyStyle={{
          padding: '20px 24px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        destroyOnClose={false}
        maskClosable={false}
        footer={[
          <Space key="actions">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'excel',
                    label: 'Excel格式',
                    icon: <DownloadOutlined />,
                    onClick: () => handleExportStatistics('excel')
                  },
                  {
                    key: 'pdf',
                    label: 'PDF格式',
                    icon: <DownloadOutlined />,
                    onClick: () => handleExportStatistics('pdf')
                  }
                ]
              }}
            >
              <Button type="primary" icon={<DownloadOutlined />}>
                导出报表
              </Button>
            </Dropdown>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                message.success('数据已刷新');
              }}
            >
              刷新数据
            </Button>
            <Button onClick={() => setStatisticsModalVisible(false)}>
              关闭
            </Button>
          </Space>
        ]}
      >
        {/* 筛选和控制栏 */}
        <div style={{ marginBottom: 16, padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <DatePicker.RangePicker
                placeholder={['开始日期', '结束日期']}
                value={statisticsDateRange}
                onChange={setStatisticsDateRange}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="队伍类型"
                value={statisticsFilters.teamType}
                onChange={(value) => setStatisticsFilters(prev => ({ ...prev, teamType: value }))}
                style={{ width: '100%' }}
              >
                <Option value="all">全部类型</Option>
                <Option value="水上救援">水上救援</Option>
                <Option value="陆地救援">陆地救援</Option>
                <Option value="医疗救援">医疗救援</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="设备类型"
                value={statisticsFilters.equipmentType}
                onChange={(value) => setStatisticsFilters(prev => ({ ...prev, equipmentType: value }))}
                style={{ width: '100%' }}
              >
                <Option value="all">全部设备</Option>
                <Option value="救生设备">救生设备</Option>
                <Option value="通讯设备">通讯设备</Option>
                <Option value="医疗设备">医疗设备</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="物资类别"
                value={statisticsFilters.suppliesCategory}
                onChange={(value) => setStatisticsFilters(prev => ({ ...prev, suppliesCategory: value }))}
                style={{ width: '100%' }}
              >
                <Option value="all">全部物资</Option>
                <Option value="救生设备">救生设备</Option>
                <Option value="医疗用品">医疗用品</Option>
                <Option value="工具器材">工具器材</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Space>
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  checkedChildren="自动刷新"
                  unCheckedChildren="手动刷新"
                />
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => message.success('数据已刷新')}
                >
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs
          activeKey={statisticsActiveTab}
          onChange={setStatisticsActiveTab}
          items={[
          {
            key: 'overview',
            label: '📈 综合概览',
            children: (
              <div>
                {/* 关键指标卡片 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card
                      size="small"
                      hoverable
                      className={`${styles.statisticsCard} ${styles.gradientCard}`}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>救援队伍</span>}
                        value={rescueTeamsData.length}
                        valueStyle={{ color: 'white', fontSize: '28px' }}
                        suffix={<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>支</span>}
                      />
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        ↑ 较上月 +2
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>救援人员</span>}
                        value={teamStats.totalMembers}
                        valueStyle={{ color: 'white', fontSize: '28px' }}
                        suffix={<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>人</span>}
                      />
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        ↑ 较上月 +5
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>救援设备</span>}
                        value={equipmentStats.totalEquipment}
                        valueStyle={{ color: 'white', fontSize: '28px' }}
                        suffix={<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>台</span>}
                      />
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        → 与上月持平
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>预警物资</span>}
                        value={suppliesStats.criticalItems}
                        valueStyle={{ color: 'white', fontSize: '28px' }}
                        suffix={<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>项</span>}
                      />
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        ↓ 较上月 -1
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 数据可视化图表 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card
                      title="救援队伍类型分布"
                      size="small"
                      extra={
                        <Tooltip title="点击图表区域查看详细信息">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <ReactECharts
                        option={getTeamDistributionChartOption()}
                        style={{ height: '300px' }}
                        onEvents={{
                          'click': (params) => {
                            message.info(`${params.name}: ${params.value}支队伍`);
                          }
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title="设备状态统计"
                      size="small"
                      extra={
                        <Tooltip title="点击柱状图查看设备详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <ReactECharts
                        option={getEquipmentStatusChartOption()}
                        style={{ height: '300px' }}
                        onEvents={{
                          'click': (params) => {
                            message.info(`${params.name}设备: ${params.value}台`);
                          }
                        }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 第二行图表 */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      title="物资库存趋势"
                      size="small"
                      extra={
                        <Space>
                          <Select size="small" defaultValue="month" style={{ width: 80 }}>
                            <Option value="week">周</Option>
                            <Option value="month">月</Option>
                            <Option value="quarter">季</Option>
                          </Select>
                          <Tooltip title="查看库存详情">
                            <Button type="text" size="small" icon={<EyeOutlined />} />
                          </Tooltip>
                        </Space>
                      }
                    >
                      <ReactECharts
                        option={getSuppliesInventoryChartOption()}
                        style={{ height: '300px' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title="救援任务完成情况"
                      size="small"
                      extra={
                        <Tooltip title="查看任务详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <ReactECharts
                        option={getRescueTaskChartOption()}
                        style={{ height: '300px' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: 'teams',
            label: '👥 队伍统计',
            children: (
              <div>
                {/* 队伍概览统计 */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'flex', alignItems: 'stretch' }}>
                  <Col span={8} style={{ display: 'flex' }}>
                    <Card
                      title="人员配置分析"
                      size="small"
                      className={styles.statisticsCard}
                      extra={<Badge count={teamStats.totalMembers} style={{ backgroundColor: '#52c41a' }} />}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Statistic
                          title="总人数"
                          value={teamStats.totalMembers}
                          suffix="人"
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Statistic
                          title="平均年龄"
                          value={teamStats.averageAge}
                          suffix="岁"
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div>
                        <Text strong>性别比例：</Text>
                        <div style={{ marginTop: 8 }}>
                          <Progress
                            percent={Math.round(((teamStats.genderRatio['男'] || 0) / teamStats.totalMembers) * 100)}
                            format={() => `男性 ${teamStats.genderRatio['男'] || 0}人`}
                            strokeColor="#1890ff"
                            style={{ marginBottom: 8 }}
                          />
                          <Progress
                            percent={Math.round(((teamStats.genderRatio['女'] || 0) / teamStats.totalMembers) * 100)}
                            format={() => `女性 ${teamStats.genderRatio['女'] || 0}人`}
                            strokeColor="#f759ab"
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8} style={{ display: 'flex' }}>
                    <Card
                      title="技能认证分布"
                      size="small"
                      className={styles.statisticsCard}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                      extra={
                        <Tooltip title="查看详细认证信息">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {Object.entries(teamStats.certificationStats || {}).map(([cert, count], index) => {
                          const percentage = Math.round((count / teamStats.totalMembers) * 100);
                          const colors = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'];
                          return (
                            <div key={`${cert}-${index}`} style={{
                              marginBottom: 12,
                              padding: '8px 12px',
                              backgroundColor: '#fafafa',
                              borderRadius: '6px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 6
                              }}>
                                <Text strong style={{ fontSize: '13px' }}>{cert}</Text>
                                <Badge
                                  count={count}
                                  style={{
                                    backgroundColor: colors[index % colors.length],
                                    fontSize: '11px'
                                  }}
                                />
                              </div>
                              <Progress
                                percent={percentage}
                                size="small"
                                strokeColor={colors[index % colors.length]}
                                format={() => `${percentage}%`}
                                strokeWidth={6}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </Col>
                  <Col span={8} style={{ display: 'flex' }}>
                    <Card
                      title="证书到期统计"
                      size="small"
                      className={styles.statisticsCard}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                      extra={
                        <Tooltip title="查看证书详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Alert
                          message={`${teamStats.certExpiryStats.expired}个证书已过期`}
                          type="error"
                          showIcon
                          style={{ marginBottom: 8, fontSize: '12px' }}
                        />
                        <Alert
                          message={`${teamStats.certExpiryStats.expiring}个证书即将到期`}
                          type="warning"
                          showIcon
                          style={{ marginBottom: 8, fontSize: '12px' }}
                        />
                        <Alert
                          message={`${teamStats.certExpiryStats.normal}个证书状态正常`}
                          type="success"
                          showIcon
                          style={{ fontSize: '12px' }}
                        />
                      </div>

                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: '#f6ffed',
                        borderRadius: '6px',
                        border: '1px solid #b7eb8f'
                      }}>
                        <Statistic
                          title="证书合规率"
                          value={Math.round((teamStats.certExpiryStats.normal / (teamStats.certExpiryStats.normal + teamStats.certExpiryStats.expiring + teamStats.certExpiryStats.expired)) * 100)}
                          suffix="%"
                          valueStyle={{
                            color: teamStats.certExpiryStats.expired > 0 ? '#ff4d4f' : '#52c41a',
                            fontSize: '20px'
                          }}
                        />
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 队伍类型分布和详细分析 */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      title="队伍类型分布"
                      size="small"
                      extra={
                        <Button
                          type="text"
                          size="small"
                          onClick={() => message.info('查看队伍详细信息')}
                        >
                          详细信息
                        </Button>
                      }
                    >
                      <Row gutter={16}>
                        {Object.entries(teamStats.teamsByType).map(([type, count], index) => {
                          const colors = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1'];
                          const icons = ['🚤', '🚑', '🛟', '🔧'];
                          return (
                            <Col span={12} key={type} style={{ marginBottom: 16 }}>
                              <div style={{
                                textAlign: 'center',
                                padding: '16px 12px',
                                backgroundColor: '#fafafa',
                                borderRadius: '8px',
                                border: `2px solid ${colors[index % colors.length]}20`,
                                transition: 'all 0.3s ease'
                              }}>
                                <div style={{ fontSize: '24px', marginBottom: 8 }}>
                                  {icons[index % icons.length]}
                                </div>
                                <div style={{
                                  fontSize: '24px',
                                  fontWeight: 'bold',
                                  color: colors[index % colors.length],
                                  marginBottom: 4
                                }}>
                                  {count}
                                </div>
                                <div style={{
                                  color: '#666',
                                  fontSize: '13px',
                                  fontWeight: '500'
                                }}>
                                  {type}
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="队伍区域分布" size="small">
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {Object.entries(teamStats.teamsByRegion).map(([region, count], index) => {
                          const percentage = Math.round((count / rescueTeamsData.length) * 100);
                          return (
                            <div key={region} style={{
                              marginBottom: 12,
                              padding: '8px 12px',
                              backgroundColor: '#fafafa',
                              borderRadius: '6px'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 6
                              }}>
                                <Text strong>{region}</Text>
                                <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
                              </div>
                              <Progress
                                percent={percentage}
                                size="small"
                                strokeColor="#1890ff"
                                format={() => `${percentage}%`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: 'equipment',
            label: '🛠️ 设备统计',
            children: (
              <div>
                {/* 设备概览统计卡片 */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'flex', alignItems: 'stretch' }}>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="设备总数"
                        value={equipmentStats.totalEquipment}
                        suffix="台"
                        valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>🔧</span>}
                      />
                    </Card>
                  </Col>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="使用中"
                        value={equipmentStats.equipmentByStatus['使用中'] || 0}
                        suffix="台"
                        valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>✅</span>}
                      />
                    </Card>
                  </Col>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="维修中"
                        value={equipmentStats.equipmentByStatus['维修中'] || 0}
                        suffix="台"
                        valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>🔧</span>}
                      />
                    </Card>
                  </Col>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="设备价值"
                        value={(equipmentStats.totalValue / 10000).toFixed(1)}
                        suffix="万元"
                        valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>💰</span>}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 设备详细分析 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card
                      title="设备类型分布"
                      size="small"
                      extra={
                        <Tooltip title="查看设备详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {Object.entries(equipmentStats.equipmentByType).map(([type, count], index) => {
                          const percentage = Math.round((count / equipmentStats.totalEquipment) * 100);
                          const colors = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'];
                          const icons = ['🚤', '📡', '🏥', '🔧', '🛟'];
                          return (
                            <div key={type} style={{
                              marginBottom: 16,
                              padding: '12px',
                              backgroundColor: '#fafafa',
                              borderRadius: '8px',
                              border: `2px solid ${colors[index % colors.length]}20`
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: '18px' }}>{icons[index % icons.length]}</span>
                                  <Text strong>{type}</Text>
                                </div>
                                <Badge
                                  count={count}
                                  style={{
                                    backgroundColor: colors[index % colors.length],
                                    fontSize: '12px'
                                  }}
                                />
                              </div>
                              <Progress
                                percent={percentage}
                                strokeColor={colors[index % colors.length]}
                                format={() => `${percentage}% (${count}台)`}
                                strokeWidth={8}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title="设备状态分析"
                      size="small"
                      extra={
                        <Tooltip title="查看状态详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <div style={{ marginBottom: 20 }}>
                        {Object.entries(equipmentStats.equipmentByStatus).map(([status, count]) => {
                          const statusConfig = {
                            '使用中': { color: '#52c41a', icon: '✅', bgColor: '#f6ffed' },
                            '闲置': { color: '#1890ff', icon: '⏸️', bgColor: '#f0f9ff' },
                            '维修中': { color: '#fa8c16', icon: '🔧', bgColor: '#fff7e6' },
                            '故障': { color: '#f5222d', icon: '❌', bgColor: '#fff2f0' }
                          };
                          const config = statusConfig[status] || { color: '#666', icon: '❓', bgColor: '#fafafa' };

                          return (
                            <div key={status} style={{
                              marginBottom: 12,
                              padding: '12px',
                              backgroundColor: config.bgColor,
                              borderRadius: '8px',
                              border: `1px solid ${config.color}30`
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: '16px' }}>{config.icon}</span>
                                  <Text strong>{status}</Text>
                                </div>
                                <div style={{
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  color: config.color
                                }}>
                                  {count}台
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #91d5ff'
                      }}>
                        <Statistic
                          title="设备利用率"
                          value={equipmentStats.utilizationRate}
                          suffix="%"
                          valueStyle={{
                            color: equipmentStats.utilizationRate > 70 ? '#52c41a' : '#fa8c16',
                            fontSize: '20px'
                          }}
                        />
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Card title="设备维护统计" size="small">
                  <Table
                    columns={[
                      { title: '设备类型', dataIndex: 'type', key: 'type' },
                      { title: '总数量', dataIndex: 'total', key: 'total' },
                      { title: '使用中', dataIndex: 'inUse', key: 'inUse' },
                      { title: '闲置', dataIndex: 'idle', key: 'idle' },
                      { title: '维修中', dataIndex: 'maintenance', key: 'maintenance' },
                      { title: '利用率', dataIndex: 'rate', key: 'rate', render: (rate) => `${rate}%` }
                    ]}
                    dataSource={Object.entries(equipmentStats.equipmentByType).map(([type, total]) => ({
                      key: type,
                      type,
                      total,
                      inUse: Math.floor(total * 0.6),
                      idle: Math.floor(total * 0.3),
                      maintenance: Math.floor(total * 0.1),
                      rate: Math.round((Math.floor(total * 0.6) / total) * 100)
                    }))}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </div>
            )
          },
          {
            key: 'supplies',
            label: '📦 物资统计',
            children: (
              <div>
                {/* 物资概览统计卡片 */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'flex', alignItems: 'stretch' }}>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="物资种类"
                        value={suppliesStats.totalSuppliesTypes}
                        suffix="种"
                        valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>📦</span>}
                      />
                    </Card>
                  </Col>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="库存总量"
                        value={suppliesStats.totalItems}
                        suffix="件"
                        valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>📊</span>}
                      />
                    </Card>
                  </Col>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="预警物资"
                        value={suppliesStats.lowStockItems}
                        suffix="种"
                        valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>⚠️</span>}
                      />
                    </Card>
                  </Col>
                  <Col span={6} style={{ display: 'flex' }}>
                    <Card className={styles.statisticsCard} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Statistic
                        title="周转率"
                        value={suppliesStats.turnoverRate}
                        suffix="%"
                        valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                        prefix={<span style={{ fontSize: '20px' }}>🔄</span>}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 物资详细分析 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card
                      title="库存状态分析"
                      size="small"
                      extra={
                        <Tooltip title="查看库存详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Alert
                          message={`${suppliesStats.suppliesByStatus.normal || 0}种物资库存正常`}
                          type="success"
                          showIcon
                          style={{ marginBottom: 8, fontSize: '12px' }}
                        />
                        <Alert
                          message={`${suppliesStats.suppliesByStatus.low || 0}种物资库存偏低`}
                          type="warning"
                          showIcon
                          style={{ marginBottom: 8, fontSize: '12px' }}
                        />
                        <Alert
                          message={`${suppliesStats.suppliesByStatus.critical || 0}种物资紧急缺货`}
                          type="error"
                          showIcon
                          style={{ fontSize: '12px' }}
                        />
                      </div>

                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: '#f6ffed',
                        borderRadius: '6px',
                        border: '1px solid #b7eb8f'
                      }}>
                        <Statistic
                          title="库存健康度"
                          value={Math.round(((suppliesStats.suppliesByStatus.normal || 0) / suppliesStats.totalSuppliesTypes) * 100)}
                          suffix="%"
                          valueStyle={{
                            color: suppliesStats.criticalItems > 0 ? '#ff4d4f' : '#52c41a',
                            fontSize: '18px'
                          }}
                        />
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      title="补充建议"
                      size="small"
                      extra={
                        <Button
                          type="text"
                          size="small"
                          onClick={() => message.info('生成补充计划')}
                        >
                          生成计划
                        </Button>
                      }
                    >
                      <div style={{ marginBottom: 16 }}>
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#fff2f0',
                          borderRadius: '6px',
                          border: '1px solid #ffccc7',
                          marginBottom: 8
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '16px' }}>🚨</span>
                            <Text strong style={{ color: '#f5222d' }}>紧急补充</Text>
                          </div>
                          <div style={{ marginTop: 4, fontSize: '20px', fontWeight: 'bold', color: '#f5222d' }}>
                            {suppliesStats.criticalItems}种物资
                          </div>
                        </div>

                        <div style={{
                          padding: '12px',
                          backgroundColor: '#fff7e6',
                          borderRadius: '6px',
                          border: '1px solid #ffd591',
                          marginBottom: 8
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '16px' }}>⚠️</span>
                            <Text strong style={{ color: '#fa8c16' }}>关注库存</Text>
                          </div>
                          <div style={{ marginTop: 4, fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                            {suppliesStats.lowStockItems - suppliesStats.criticalItems}种物资
                          </div>
                        </div>

                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f6ffed',
                          borderRadius: '6px',
                          border: '1px solid #b7eb8f'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '16px' }}>✅</span>
                            <Text strong style={{ color: '#52c41a' }}>库存充足</Text>
                          </div>
                          <div style={{ marginTop: 4, fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                            {suppliesStats.totalSuppliesTypes - suppliesStats.lowStockItems}种物资
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      title="库存分类统计"
                      size="small"
                      extra={
                        <Tooltip title="查看分类详情">
                          <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                      }
                    >
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {['救生设备', '医疗用品', '通讯设备', '工具器材'].map((category, index) => {
                          const count = Math.floor(Math.random() * 20) + 5; // 模拟数据
                          const colors = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1'];
                          const icons = ['🛟', '🏥', '📡', '🔧'];

                          return (
                            <div key={category} style={{
                              marginBottom: 12,
                              padding: '10px',
                              backgroundColor: '#fafafa',
                              borderRadius: '6px',
                              border: `1px solid ${colors[index]}30`
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 6
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: '14px' }}>{icons[index]}</span>
                                  <Text strong style={{ fontSize: '13px' }}>{category}</Text>
                                </div>
                                <Badge
                                  count={count}
                                  style={{
                                    backgroundColor: colors[index],
                                    fontSize: '10px'
                                  }}
                                />
                              </div>
                              <Progress
                                percent={Math.round((count / 100) * 100)}
                                size="small"
                                strokeColor={colors[index]}
                                format={() => `${count}种`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Card
                  title="物资库存趋势分析"
                  size="small"
                  extra={
                    <Space>
                      <Button size="small" type="text" onClick={() => message.info('切换到详细视图')}>
                        详细视图
                      </Button>
                      <Button size="small" type="text" icon={<DownloadOutlined />} onClick={() => message.success('图表已导出')}>
                        导出
                      </Button>
                    </Space>
                  }
                >
                  <ReactECharts
                    option={getSuppliesInventoryChartOption()}
                    style={{ height: '300px' }}
                    onEvents={{
                      'click': (params) => {
                        message.info(`${params.seriesName} - ${params.name}: ${params.value}`);
                      }
                    }}
                  />
                </Card>
              </div>
            )
          },
          {
            key: 'analysis',
            label: '📋 综合分析',
            children: (
              <div>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Card title="资源配置效率评估" size="small">
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>人员配置效率</span>
                          <Tag color="green">优秀</Tag>
                        </div>
                        <Progress percent={85} size="small" strokeColor="#52c41a" />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>设备配置效率</span>
                          <Tag color="blue">良好</Tag>
                        </div>
                        <Progress percent={75} size="small" strokeColor="#1890ff" />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>物资配置效率</span>
                          <Tag color="orange">一般</Tag>
                        </div>
                        <Progress percent={65} size="small" strokeColor="#fa8c16" />
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="成本效益分析" size="small">
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>总投入成本：</Text>¥{((equipmentStats.totalValue + 500000) / 10000).toFixed(1)}万
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>年度维护成本：</Text>¥{(equipmentStats.totalValue * 0.1 / 10000).toFixed(1)}万
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>救援成功率：</Text>95.2%
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>队伍覆盖率：</Text>98.5%
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Card title="改进建议" size="small">
                  <div style={{ padding: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ color: '#f5222d' }}>🚨 紧急改进：</Text>
                      <ul style={{ marginTop: 8, marginLeft: 16 }}>
                        <li>立即补充{suppliesStats.criticalItems}种紧急库存物资</li>
                        <li>安排{teamStats.certExpiryStats.expired}个已过期证书的续证培训</li>
                      </ul>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ color: '#fa8c16' }}>⚠️ 中期优化：</Text>
                      <ul style={{ marginTop: 8, marginLeft: 16 }}>
                        <li>提高设备利用率，当前仅{equipmentStats.utilizationRate}%</li>
                        <li>优化{teamStats.certExpiryStats.expiring}个即将到期证书的培训计划</li>
                        <li>建立物资自动补充机制，提高库存周转率</li>
                      </ul>
                    </div>
                    <div>
                      <Text strong style={{ color: '#52c41a' }}>✅ 长期规划：</Text>
                      <ul style={{ marginTop: 8, marginLeft: 16 }}>
                        <li>建立智能调度系统，提升资源配置效率</li>
                        <li>完善培训体系，提高人员专业技能水平</li>
                        <li>引入预测性维护，降低设备故障率</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )
          },
          {
            key: 'export',
            label: '📤 数据导出',
            children: (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card title="快速导出" size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                          block
                          icon={<DownloadOutlined />}
                          className={styles.exportButton}
                          onClick={() => handleExportStatistics('excel')}
                        >
                          导出完整统计报表 (Excel)
                        </Button>
                        <Button
                          block
                          icon={<DownloadOutlined />}
                          onClick={() => handleExportStatistics('pdf')}
                        >
                          导出统计报表 (PDF)
                        </Button>
                        <Button
                          block
                          icon={<DownloadOutlined />}
                          onClick={() => message.success('队伍信息已导出')}
                        >
                          导出队伍信息
                        </Button>
                        <Button
                          block
                          icon={<DownloadOutlined />}
                          onClick={() => message.success('设备清单已导出')}
                        >
                          导出设备清单
                        </Button>
                        <Button
                          block
                          icon={<DownloadOutlined />}
                          onClick={() => message.success('物资清单已导出')}
                        >
                          导出物资清单
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="自定义导出" size="small">
                      <Form layout="vertical">
                        <Form.Item label="导出内容">
                          <Checkbox.Group style={{ width: '100%' }}>
                            <Row>
                              <Col span={24}><Checkbox value="teams">救援队伍信息</Checkbox></Col>
                              <Col span={24}><Checkbox value="equipment">设备状态信息</Checkbox></Col>
                              <Col span={24}><Checkbox value="supplies">物资库存信息</Checkbox></Col>
                              <Col span={24}><Checkbox value="statistics">统计分析数据</Checkbox></Col>
                              <Col span={24}><Checkbox value="charts">图表数据</Checkbox></Col>
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                        <Form.Item label="导出格式">
                          <Radio.Group defaultValue="excel">
                            <Radio value="excel">Excel格式</Radio>
                            <Radio value="pdf">PDF格式</Radio>
                            <Radio value="csv">CSV格式</Radio>
                          </Radio.Group>
                        </Form.Item>
                        <Form.Item label="时间范围">
                          <DatePicker.RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            block
                            icon={<DownloadOutlined />}
                            onClick={() => message.success('自定义报表已生成并导出')}
                          >
                            生成并导出
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                </Row>

                <Card title="导出历史" size="small">
                  <Table
                    columns={[
                      { title: '导出时间', dataIndex: 'time', key: 'time' },
                      { title: '报表类型', dataIndex: 'type', key: 'type' },
                      { title: '文件格式', dataIndex: 'format', key: 'format' },
                      { title: '文件大小', dataIndex: 'size', key: 'size' },
                      {
                        title: '操作',
                        key: 'action',
                        render: () => (
                          <Space>
                            <Button type="link" size="small">下载</Button>
                            <Button type="link" size="small" danger>删除</Button>
                          </Space>
                        )
                      }
                    ]}
                    dataSource={[
                      { key: 1, time: '2024-01-15 14:30', type: '完整统计报表', format: 'Excel', size: '2.3MB' },
                      { key: 2, time: '2024-01-15 10:15', type: '队伍信息', format: 'PDF', size: '1.1MB' },
                      { key: 3, time: '2024-01-14 16:45', type: '设备清单', format: 'Excel', size: '856KB' }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </div>
            )
          }
        ]} />
      </Modal>
    );
  };

  // 处理救援方案表单提交
  const handlePlanSubmit = async () => {
    try {
      const values = await planForm.validateFields();
      console.log('救援方案表单数据:', values);

      // 数据处理和验证
      const processedData = {
        ...values,
        id: selectedPlan?.id || `plan${Date.now()}`,
        successRate: selectedPlan?.successRate || 0,
        executionCount: selectedPlan?.executionCount || 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'active',
        // 确保步骤有正确的ID
        steps: values.steps?.map((step, index) => ({
          ...step,
          id: index + 1
        })) || [],
        // 确保人员配置数据完整
        requiredPersonnel: values.requiredPersonnel || [],
        // 确保环境参数数据完整
        environmentParams: values.environmentParams || {}
      };

      console.log('处理后的方案数据:', processedData);

      if (isEditingPlan && selectedPlan) {
        message.success(`方案"${values.name}"更新成功！`);
      } else {
        message.success(`方案"${values.name}"创建成功！`);
        // 这里可以添加到rescuePlansData数组中（实际项目中应该调用API）
      }

      setPlanModalVisible(false);
      setSelectedPlan(null);
      setIsEditingPlan(false);
      planForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('表单验证失败，请检查必填项');
    }
  };

  // 处理应急手册表单提交
  const handleManualSubmit = async () => {
    try {
      const values = await manualForm.validateFields();
      console.log('应急手册表单数据:', values);

      if (isEditingManual && selectedManual) {
        message.success(`手册"${values.title}"更新成功！`);
      } else {
        message.success(`手册"${values.title}"创建成功！`);
      }

      setManualModalVisible(false);
      setSelectedManual(null);
      setIsEditingManual(false);
      manualForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 计算执行时长的辅助函数
  const calculateTotalExecutionTime = (executionSteps) => {
    try {
      // 只有当所有步骤都完成时才计算总时长
      const allStepsCompleted = executionSteps.every(step =>
        step.status === 'completed' || step.status === 'partial_success' || step.status === 'failed'
      );

      if (!allStepsCompleted) {
        return ''; // 未全部完成时不显示总时长
      }

      // 获取有开始和结束时间的步骤
      const stepsWithTime = executionSteps.filter(step => step.startTime && step.endTime);

      if (stepsWithTime.length === 0) {
        return '';
      }

      // 找到最早的开始时间和最晚的结束时间
      const startTimes = stepsWithTime.map(step => step.startTime).filter(time => time);
      const endTimes = stepsWithTime.map(step => step.endTime).filter(time => time);

      if (startTimes.length === 0 || endTimes.length === 0) {
        return '';
      }

      // 解析时间并排序
      const parseTime = (timeStr) => {
        const [hour, min, sec] = timeStr.split(':').map(Number);
        return hour * 3600 + min * 60 + sec;
      };

      const startTimesInSeconds = startTimes.map(parseTime).sort((a, b) => a - b);
      const endTimesInSeconds = endTimes.map(parseTime).sort((a, b) => b - a);

      const earliestStartSeconds = startTimesInSeconds[0];
      const latestEndSeconds = endTimesInSeconds[0];

      let diffSeconds = latestEndSeconds - earliestStartSeconds;

      // 处理跨天的情况
      if (diffSeconds < 0) {
        diffSeconds += 24 * 3600;
      }

      // 格式化时长显示
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      if (hours > 0) {
        return `${hours}小时${minutes}分钟${seconds}秒`;
      } else if (minutes > 0) {
        return `${minutes}分钟${seconds}秒`;
      } else {
        return `${seconds}秒`;
      }
    } catch (error) {
      console.error('计算执行时长失败:', error, {
        executionSteps: executionSteps.map(step => ({
          stepId: step.stepId,
          status: step.status,
          startTime: step.startTime,
          endTime: step.endTime
        }))
      });
      return '';
    }
  };

  // 更新执行记录步骤状态
  const updateExecutionStep = (executionId, stepId, updates) => {
    setExecutionRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record => {
        if (record.id === executionId) {
          const updatedSteps = record.executionSteps.map(step =>
            step.stepId === stepId ? { ...step, ...updates } : step
          );

          // 计算总体进度和成功率
          const totalSteps = updatedSteps.length;
          const completedSteps = updatedSteps.filter(step => step.status === 'completed').length;
          const partialSuccessSteps = updatedSteps.filter(step => step.status === 'partial_success').length;
          const failedSteps = updatedSteps.filter(step => step.status === 'failed').length;
          const finishedSteps = completedSteps + partialSuccessSteps + failedSteps;

          // 计算成功率：完全成功步骤得100%分数，部分成功得50%分数，失败得0%分数
          let successRate = 0;
          if (totalSteps > 0) {
            successRate = Math.round(((completedSteps * 100 + partialSuccessSteps * 50) / (totalSteps * 100)) * 100);
          }

          // 判断整体执行状态
          let overallResult = 'executing';
          if (finishedSteps === totalSteps) {
            if (failedSteps === 0 && partialSuccessSteps === 0) {
              overallResult = 'success';
            } else if (completedSteps > 0) {
              overallResult = 'partial';
            } else {
              overallResult = 'failed';
            }
          } else if (failedSteps > 0) {
            overallResult = 'partial';
          }

          // 计算总执行时长
          const totalTime = calculateTotalExecutionTime(updatedSteps);

          const updatedRecord = {
            ...record,
            executionSteps: updatedSteps,
            totalTime,
            result: overallResult,
            successRate,
            status: finishedSteps === totalSteps ? 'completed' : 'executing'
          };

          // 如果当前选中的执行记录是被更新的记录，同步更新selectedExecution
          if (selectedExecution && selectedExecution.id === executionId) {
            setSelectedExecution(updatedRecord);
          }

          return updatedRecord;
        }
        return record;
      });

      return updatedRecords;
    });
  };

  // 模拟自动进度更新（实际应用中应该通过WebSocket或定时器从后端获取）
  const simulateProgressUpdate = (executionId) => {
    const execution = executionRecords.find(record => record.id === executionId);
    if (!execution || execution.status === 'completed') return;

    const pendingSteps = execution.executionSteps.filter(step => step.status === 'pending');
    if (pendingSteps.length > 0) {
      const nextStep = pendingSteps[0];
      const currentTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });

      // 模拟步骤开始
      updateExecutionStep(executionId, nextStep.stepId, {
        status: 'in_progress',
        startTime: currentTime,
        notes: `步骤${nextStep.stepId}开始执行...`
      });

      // 模拟步骤完成（3-8秒后）
      setTimeout(() => {
        const endTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        updateExecutionStep(executionId, nextStep.stepId, {
          status: 'completed',
          endTime: endTime,
          notes: `步骤${nextStep.stepId}执行完成`
        });
      }, Math.random() * 5000 + 3000);
    }
  };

  // 手动开始执行步骤
  const handleStartStep = (executionId, stepId) => {
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    updateExecutionStep(executionId, stepId, {
      status: 'in_progress',
      startTime: currentTime,
      notes: '手动开始执行'
    });
    message.success('步骤已开始执行');
  };

  // 手动完成步骤
  const handleCompleteStep = (executionId, stepId) => {
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    updateExecutionStep(executionId, stepId, {
      status: 'completed',
      endTime: currentTime,
      notes: '手动标记完成',
      statusChangedBy: '当前用户',
      statusChangedTime: new Date().toLocaleString('zh-CN')
    });
    message.success('步骤已标记为完成');
  };

  // 标记步骤为部分成功
  const handlePartialSuccessStep = (executionId, stepId, reason = '') => {
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    updateExecutionStep(executionId, stepId, {
      status: 'partial_success',
      endTime: currentTime,
      notes: reason ? `部分成功：${reason}` : '标记为部分成功',
      statusChangedBy: '当前用户',
      statusChangedTime: new Date().toLocaleString('zh-CN')
    });
    message.success('步骤已标记为部分成功');
  };

  // 标记步骤为失败
  const handleFailStep = (executionId, stepId, reason = '') => {
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    updateExecutionStep(executionId, stepId, {
      status: 'failed',
      endTime: currentTime,
      notes: reason ? `执行失败：${reason}` : '标记为失败',
      statusChangedBy: '当前用户',
      statusChangedTime: new Date().toLocaleString('zh-CN')
    });
    message.warning('步骤已标记为失败');
  };

  // 重置步骤状态
  const handleResetStep = (executionId, stepId) => {
    updateExecutionStep(executionId, stepId, {
      status: 'pending',
      startTime: null,
      endTime: null,
      notes: '重置为待执行状态',
      statusChangedBy: '当前用户',
      statusChangedTime: new Date().toLocaleString('zh-CN')
    });
    message.info('步骤状态已重置');
  };

  // 更新步骤备注
  const handleUpdateStepNote = async (executionId, stepId) => {
    try {
      const values = await stepNoteForm.validateFields();
      updateExecutionStep(executionId, stepId, {
        notes: values.notes
      });
      setEditingStepId(null);
      stepNoteForm.resetFields();
      message.success('备注已更新');
    } catch (error) {
      console.error('更新备注失败:', error);
    }
  };

  // 检查是否可编辑
  const isEditable = (execution) => {
    return execution && (execution.status === 'executing' || execution.result === 'executing');
  };

  // 获取权限状态信息
  const getPermissionInfo = (execution) => {
    if (!execution) return { editable: false, message: '无执行记录' };

    if (execution.status === 'completed' || execution.result === 'success') {
      return {
        editable: false,
        message: '该执行记录已完成，处于只读状态',
        type: 'success'
      };
    }

    if (execution.status === 'executing' || execution.result === 'executing') {
      return {
        editable: true,
        message: '该执行记录正在进行中，可以编辑和更新',
        type: 'info'
      };
    }

    return {
      editable: false,
      message: '该执行记录状态异常，无法编辑',
      type: 'warning'
    };
  };

  // 改进建议管理函数
  const addImprovement = async (executionId) => {
    try {
      const values = await improvementForm.validateFields();
      const newImprovement = {
        id: Date.now().toString(),
        content: values.content,
        priority: values.priority,
        category: values.category,
        addedBy: '当前用户',
        addedTime: new Date().toLocaleString('zh-CN'),
        status: 'active'
      };

      setExecutionRecords(prevRecords => {
        const updatedRecords = prevRecords.map(record => {
          if (record.id === executionId) {
            const updatedRecord = {
              ...record,
              improvements: [...(record.improvements || []), newImprovement]
            };

            // 同步更新selectedExecution
            if (selectedExecution && selectedExecution.id === executionId) {
              setSelectedExecution(updatedRecord);
            }

            return updatedRecord;
          }
          return record;
        });
        return updatedRecords;
      });

      improvementForm.resetFields();
      message.success('改进建议已添加');
    } catch (error) {
      console.error('添加建议失败:', error);
    }
  };

  const updateImprovement = (executionId, improvementId, updates) => {
    setExecutionRecords(prevRecords =>
      prevRecords.map(record => {
        if (record.id === executionId) {
          return {
            ...record,
            improvements: record.improvements?.map(improvement =>
              improvement.id === improvementId ? { ...improvement, ...updates } : improvement
            ) || []
          };
        }
        return record;
      })
    );
  };

  const deleteImprovement = (executionId, improvementId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条改进建议吗？',
      onOk: () => {
        setExecutionRecords(prevRecords =>
          prevRecords.map(record => {
            if (record.id === executionId) {
              return {
                ...record,
                improvements: record.improvements?.filter(improvement => improvement.id !== improvementId) || []
              };
            }
            return record;
          })
        );
        message.success('改进建议已删除');
      }
    });
  };

  // 反馈管理函数
  const addFeedback = async (executionId) => {
    try {
      const values = await feedbackForm.validateFields();
      const newFeedback = {
        id: Date.now().toString(),
        content: values.content,
        rating: values.rating,
        feedbackBy: '当前用户',
        feedbackTime: new Date().toLocaleString('zh-CN'),
        status: 'submitted'
      };

      setExecutionRecords(prevRecords => {
        const updatedRecords = prevRecords.map(record => {
          if (record.id === executionId) {
            const feedbacks = Array.isArray(record.feedbacks) ? record.feedbacks :
                             record.feedback ? [{
                               id: 'legacy',
                               content: record.feedback,
                               rating: 5,
                               feedbackBy: record.reportedBy || '系统',
                               feedbackTime: record.executionDate,
                               status: 'reviewed'
                             }] : [];

            const updatedRecord = {
              ...record,
              feedbacks: [...feedbacks, newFeedback]
            };

            // 同步更新selectedExecution
            if (selectedExecution && selectedExecution.id === executionId) {
              setSelectedExecution(updatedRecord);
            }

            return updatedRecord;
          }
          return record;
        });
        return updatedRecords;
      });

      feedbackForm.resetFields();
      message.success('反馈已提交');
    } catch (error) {
      console.error('提交反馈失败:', error);
    }
  };

  const updateFeedbackStatus = (executionId, feedbackId, status) => {
    setExecutionRecords(prevRecords =>
      prevRecords.map(record => {
        if (record.id === executionId) {
          return {
            ...record,
            feedbacks: record.feedbacks?.map(feedback =>
              feedback.id === feedbackId ? { ...feedback, status } : feedback
            ) || []
          };
        }
        return record;
      })
    );
    message.success(`反馈状态已更新为${status === 'reviewed' ? '已审核' : '草稿'}`);
  };

  // 媒体文件管理函数
  const handleFileUpload = (executionId, fileInfo) => {
    const newFile = {
      id: Date.now().toString(),
      name: fileInfo.name,
      type: fileInfo.type,
      size: fileInfo.size,
      url: URL.createObjectURL(fileInfo.file), // 模拟文件URL
      description: fileInfo.description || '',
      tags: fileInfo.tags || [],
      uploadedBy: '当前用户',
      uploadedTime: new Date().toLocaleString('zh-CN')
    };

    setExecutionRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record => {
        if (record.id === executionId) {
          const mediaFiles = Array.isArray(record.mediaFiles) ? record.mediaFiles :
                           record.mediaFiles ? record.mediaFiles.map((file, index) => ({
                             id: `legacy_${index}`,
                             name: file,
                             type: file.includes('视频') || file.includes('.mp4') ? 'video' : 'image',
                             url: '#',
                             description: '历史文件',
                             tags: [],
                             uploadedBy: '系统',
                             uploadedTime: record.executionDate
                           })) : [];

          const updatedRecord = {
            ...record,
            mediaFiles: [...mediaFiles, newFile]
          };

          // 同步更新selectedExecution
          if (selectedExecution && selectedExecution.id === executionId) {
            setSelectedExecution(updatedRecord);
          }

          return updatedRecord;
        }
        return record;
      });
      return updatedRecords;
    });

    message.success('文件上传成功');
  };

  const deleteMediaFile = (executionId, fileId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个文件吗？',
      onOk: () => {
        setExecutionRecords(prevRecords =>
          prevRecords.map(record => {
            if (record.id === executionId) {
              return {
                ...record,
                mediaFiles: record.mediaFiles?.filter(file => file.id !== fileId) || []
              };
            }
            return record;
          })
        );
        message.success('文件已删除');
      }
    });
  };

  const handlePreviewFile = (file) => {
    if (file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
      setPreviewFileModal({
        visible: true,
        type: 'image',
        src: file.url,
        title: file.name
      });
    } else if (file.type?.startsWith('video/') || file.name?.match(/\.(mp4|avi|mov|wmv)$/i)) {
      setPreviewFileModal({
        visible: true,
        type: 'video',
        src: file.url,
        title: file.name
      });
    } else {
      message.info('该文件类型不支持预览');
    }
  };

  const downloadFile = (file) => {
    // 模拟文件下载
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('文件下载已开始');
  };

  // 获取可用救援队伍列表
  const getAvailableRescueTeams = () => {
    return rescueTeamsData.map(team => ({
      ...team,
      isAvailable: team.status === '值班中' || team.status === '待命',
      memberCount: team.actualMemberCount || team.memberCount,
      leaderName: allMembers.find(member =>
        member.teamId === team.id && member.position === '队长'
      )?.name || '暂无队长'
    }));
  };

  // 验证救援队伍是否可用
  const validateRescueTeam = (teamId) => {
    const team = rescueTeamsData.find(t => t.id === teamId);
    if (!team) {
      return { valid: false, message: '队伍不存在' };
    }
    if (team.status !== '值班中' && team.status !== '待命') {
      return { valid: false, message: `队伍当前状态为"${team.status}"，无法执行救援任务` };
    }
    if (team.actualMemberCount === 0) {
      return { valid: false, message: '队伍当前无可用人员' };
    }
    return { valid: true, message: '队伍可用' };
  };

  // 处理救援队伍选择变化
  const handleRescueTeamChange = (teamId) => {
    const team = rescueTeamsData.find(t => t.id === teamId);
    if (team) {
      const leader = allMembers.find(member =>
        member.teamId === teamId && member.position === '队长'
      );

      // 自动填充队长信息
      executePlanForm.setFieldsValue({
        teamLeader: leader?.name || '',
        rescueTeamId: teamId,
        rescueTeam: team.name
      });

      // 验证队伍可用性
      const validation = validateRescueTeam(teamId);
      if (!validation.valid) {
        message.warning(validation.message);
      }
    }
  };

  // 处理执行方案表单提交
  const handleExecutePlanSubmit = async () => {
    try {
      console.log('开始验证表单...');
      const values = await executePlanForm.validateFields();
      console.log('表单验证成功，数据:', values);
      console.log('参与人员数据类型:', typeof values.participants);
      console.log('参与人员数据内容:', values.participants);

      // 验证选择的救援队伍
      if (values.rescueTeamId) {
        const validation = validateRescueTeam(values.rescueTeamId);
        if (!validation.valid) {
          message.error(`无法执行救援任务：${validation.message}`);
          return;
        }
      }

      // 处理参与人员数据
      const processedParticipants = values.participants ?
        (Array.isArray(values.participants) ? values.participants : [values.participants]) : [];

      console.log('原始参与人员数据:', values.participants);
      console.log('处理后参与人员数据:', processedParticipants);

      // 生成执行记录数据
      const executionRecord = {
        id: `exec${Date.now()}`,
        planId: selectedPlanForExecution.id,
        planName: selectedPlanForExecution.name,
        executionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        location: values.location,
        weather: values.weather,
        waterConditions: values.waterConditions,
        rescueTeam: values.rescueTeam,
        rescueTeamId: values.rescueTeamId,
        teamLeader: values.teamLeader,
        participants: processedParticipants,
        victim: {
          age: values.victimAge,
          gender: values.victimGender,
          condition: values.victimCondition,
          cause: values.victimCause
        },
        executionSteps: selectedPlanForExecution.steps?.map(step => ({
          stepId: step.id,
          title: step.title,
          content: step.content,
          duration: step.duration,
          startTime: '',
          endTime: '',
          status: 'pending',
          notes: ''
        })) || [],
        totalTime: '',
        result: 'executing',
        improvements: [],
        feedback: '',
        mediaFiles: [],
        reportedBy: values.teamLeader,
        reviewedBy: '',
        status: 'executing'
      };

      console.log('生成的执行记录:', executionRecord);

      // 验证参与人员数据
      if (processedParticipants.length === 0) {
        console.warn('警告：执行记录中没有参与人员数据');
        message.warning('注意：当前执行记录中没有参与人员信息，建议检查表单数据');
      } else {
        console.log(`成功保存 ${processedParticipants.length} 名参与人员信息`);
      }

      // 🔥 关键修复：将执行记录添加到状态中，而不是仅仅console.log
      setExecutionRecords(prevRecords => [executionRecord, ...prevRecords]);

      // 🚀 启动模拟进度更新
      setTimeout(() => simulateProgressUpdate(executionRecord.id), 2000);

      message.success(`方案"${selectedPlanForExecution.name}"执行记录已创建！${processedParticipants.length > 0 ? `包含${processedParticipants.length}名参与人员。` : ''}请切换到"方案执行记录"标签页查看进度。`);

      setExecutePlanModalVisible(false);
      setSelectedPlanForExecution(null);
      executePlanForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
      console.error('错误详情:', error.errorFields);

      // 检查是否是参与人员验证失败
      if (error.errorFields && error.errorFields.some(field => field.name.includes('participants'))) {
        message.error('请选择参与救援的人员！');
      } else {
        message.error('表单验证失败，请检查必填项');
      }
    }
  };

  // 计算方案平均用时
  const calculateAverageExecutionTime = (planId) => {
    // 筛选出与当前方案相关且已完成的执行记录
    const completedRecords = executionRecords.filter(record =>
      record.planId === planId &&
      record.result === 'success' &&
      record.totalTime
    );

    if (completedRecords.length === 0) {
      return '暂无数据';
    }

    // 将时间字符串转换为秒数
    const parseTimeToSeconds = (timeStr) => {
      if (!timeStr) return 0;

      let totalSeconds = 0;

      // 匹配小时
      const hourMatch = timeStr.match(/(\d+)小时/);
      if (hourMatch) {
        totalSeconds += parseInt(hourMatch[1]) * 3600;
      }

      // 匹配分钟
      const minuteMatch = timeStr.match(/(\d+)分钟/);
      if (minuteMatch) {
        totalSeconds += parseInt(minuteMatch[1]) * 60;
      }

      // 匹配秒
      const secondMatch = timeStr.match(/(\d+)秒/);
      if (secondMatch) {
        totalSeconds += parseInt(secondMatch[1]);
      }

      return totalSeconds;
    };

    // 将秒数转换为格式化时间字符串
    const formatSecondsToTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
      } else if (minutes > 0) {
        return `${minutes}分钟${remainingSeconds > 0 ? remainingSeconds + '秒' : ''}`;
      } else {
        return `${remainingSeconds}秒`;
      }
    };

    // 计算平均时间
    const totalSeconds = completedRecords.reduce((sum, record) => {
      return sum + parseTimeToSeconds(record.totalTime);
    }, 0);

    const averageSeconds = Math.round(totalSeconds / completedRecords.length);
    return formatSecondsToTime(averageSeconds);
  };

  // 渲染救援方案管理页面
  const renderRescuePlans = () => (
    <div className={styles.dashboardContent}>
      <Card title="📋 救援方案管理" extra={
        <Space>
          <Button icon={<DownloadOutlined />}>导出方案库</Button>
        </Space>
      }>
        <Tabs defaultActiveKey="standard" items={[
          {
            key: 'standard',
            label: '📚 标准化流程库',
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space wrap>
                    <Input.Search
                      placeholder="搜索方案名称"
                      style={{ width: 200 }}
                      value={planSearchText}
                      onChange={(e) => setPlanSearchText(e.target.value)}
                    />
                    <Select
                      placeholder="救援场景"
                      style={{ width: 140 }}
                      value={planScenarioFilter}
                      onChange={setPlanScenarioFilter}
                    >
                      <Option value="all">全部场景</Option>
                      <Option value="offshore">离岸救援</Option>
                      <Option value="rapid_current">急流救援</Option>
                      <Option value="night">夜间救援</Option>
                      <Option value="deep_water">深水救援</Option>
                    </Select>
                    <Select
                      placeholder="难度等级"
                      style={{ width: 140 }}
                      value={planDifficultyFilter}
                      onChange={setPlanDifficultyFilter}
                    >
                      <Option value="all">全部难度</Option>
                      <Option value="easy">简单</Option>
                      <Option value="medium">中等</Option>
                      <Option value="hard">困难</Option>
                    </Select>
                    <Button icon={<ReloadOutlined />}>刷新</Button>
                  </Space>
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedPlan(null);
                        setIsEditingPlan(true);
                        planForm.resetFields();
                        setPlanModalVisible(true);
                      }}
                    >
                      新建方案
                    </Button>
                  </Space>
                </div>
                <Table
                  columns={[
                    {
                      title: '方案名称',
                      dataIndex: 'name',
                      key: 'name',
                      render: (text, record) => (
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{text}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.description.substring(0, 50)}...
                          </div>
                        </div>
                      )
                    },
                    {
                      title: '救援场景',
                      dataIndex: 'scenario',
                      key: 'scenario',
                      render: (scenario) => {
                        const scenarioMap = {
                          'offshore': { text: '离岸救援', color: 'blue' },
                          'rapid_current': { text: '急流救援', color: 'red' },
                          'night': { text: '夜间救援', color: 'purple' },
                          'deep_water': { text: '深水救援', color: 'orange' }
                        };
                        const config = scenarioMap[scenario] || { text: scenario, color: 'default' };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    },
                    {
                      title: '难度等级',
                      dataIndex: 'difficulty',
                      key: 'difficulty',
                      render: (difficulty) => {
                        const difficultyMap = {
                          'easy': { text: '简单', color: 'green' },
                          'medium': { text: '中等', color: 'orange' },
                          'hard': { text: '困难', color: 'red' }
                        };
                        const config = difficultyMap[difficulty] || { text: difficulty, color: 'default' };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    },
                    {
                      title: '成功率',
                      dataIndex: 'successRate',
                      key: 'successRate',
                      render: (rate) => (
                        <div>
                          <div>{rate}%</div>
                          <Progress
                            percent={rate}
                            size="small"
                            strokeColor={rate >= 90 ? '#52c41a' : rate >= 70 ? '#fa8c16' : '#f5222d'}
                            showInfo={false}
                          />
                        </div>
                      )
                    },
                    {
                      title: '执行次数',
                      dataIndex: 'executionCount',
                      key: 'executionCount',
                      render: (count) => <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
                    },
                    {
                      title: '平均用时',
                      dataIndex: 'avgExecutionTime',
                      key: 'avgExecutionTime',
                      render: (_, record) => {
                        const calculatedTime = calculateAverageExecutionTime(record.id);
                        return (
                          <span style={{
                            color: calculatedTime === '暂无数据' ? '#999' : '#333',
                            fontStyle: calculatedTime === '暂无数据' ? 'italic' : 'normal'
                          }}>
                            {calculatedTime}
                          </span>
                        );
                      }
                    },
                    {
                      title: '更新时间',
                      dataIndex: 'lastUpdated',
                      key: 'lastUpdated'
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 200,
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedPlan(record);
                              setIsEditingPlan(false);
                              setPlanModalVisible(true);
                            }}
                          >
                            查看
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedPlan(record);
                              setIsEditingPlan(true);
                              // 处理复杂数据结构的回填
                              const formData = {
                                ...record,
                                steps: record.steps || [],
                                requiredPersonnel: record.requiredPersonnel || [],
                                environmentParams: record.environmentParams || {}
                              };
                              planForm.setFieldsValue(formData);
                              setPlanModalVisible(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedPlanForExecution(record);
                              executePlanForm.resetFields();
                              setExecutePlanModalVisible(true);
                            }}
                          >
                            执行
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => {
                              Modal.confirm({
                                title: '确认删除',
                                content: `确定要删除方案"${record.name}"吗？`,
                                okText: '确认删除',
                                cancelText: '取消',
                                onOk() {
                                  message.success(`方案"${record.name}"已删除`);
                                }
                              });
                            }}
                          >
                            删除
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  dataSource={rescuePlansData.filter(plan => {
                    const matchesSearch = !planSearchText ||
                      plan.name.toLowerCase().includes(planSearchText.toLowerCase()) ||
                      plan.description.toLowerCase().includes(planSearchText.toLowerCase());
                    const matchesScenario = planScenarioFilter === 'all' || plan.scenario === planScenarioFilter;
                    const matchesDifficulty = planDifficultyFilter === 'all' || plan.difficulty === planDifficultyFilter;
                    return matchesSearch && matchesScenario && matchesDifficulty;
                  })}
                  pagination={{ pageSize: 8 }}
                  rowKey="id"
                />
              </div>
            )
          },
          {
            key: 'guidance',
            label: '🛠️ 临场指导工具',
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space wrap>
                    <Input.Search placeholder="搜索手册标题" style={{ width: 200 }} />
                    <Select placeholder="手册类型" style={{ width: 140 }}>
                      <Option value="all">全部类型</Option>
                      <Option value="medical">医疗急救</Option>
                      <Option value="rescue">救援技巧</Option>
                      <Option value="safety">安全防护</Option>
                    </Select>
                  </Space>
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedManual(null);
                        setIsEditingManual(true);
                        manualForm.resetFields();
                        setManualModalVisible(true);
                      }}
                    >
                      新建手册
                    </Button>
                  </Space>
                </div>

                <Table
                  columns={[
                    {
                      title: '手册标题',
                      dataIndex: 'title',
                      key: 'title',
                      render: (text, record) => (
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{text}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.tags.map(tag => (
                              <Tag key={tag} size="small">{tag}</Tag>
                            ))}
                          </div>
                        </div>
                      )
                    },
                    {
                      title: '类型',
                      dataIndex: 'category',
                      key: 'category',
                      render: (category) => {
                        const categoryMap = {
                          'medical': { text: '医疗急救', color: 'red' },
                          'rescue': { text: '救援技巧', color: 'blue' },
                          'safety': { text: '安全防护', color: 'green' }
                        };
                        const config = categoryMap[category] || { text: category, color: 'default' };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    },
                    {
                      title: '优先级',
                      dataIndex: 'priority',
                      key: 'priority',
                      render: (priority) => {
                        const priorityMap = {
                          'high': { text: '高', color: 'red' },
                          'medium': { text: '中', color: 'orange' },
                          'low': { text: '低', color: 'green' }
                        };
                        const config = priorityMap[priority] || { text: priority, color: 'default' };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    },
                    {
                      title: '查看次数',
                      dataIndex: 'viewCount',
                      key: 'viewCount',
                      render: (count) => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
                    },
                    {
                      title: '下载次数',
                      dataIndex: 'downloadCount',
                      key: 'downloadCount',
                      render: (count) => <Badge count={count} style={{ backgroundColor: '#fa8c16' }} />
                    },
                    {
                      title: '更新时间',
                      dataIndex: 'lastUpdated',
                      key: 'lastUpdated'
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 180,
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedManual(record);
                              setIsEditingManual(false);
                              setManualModalVisible(true);
                            }}
                          >
                            查看
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedManual(record);
                              setIsEditingManual(true);
                              manualForm.setFieldsValue(record);
                              setManualModalVisible(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => message.success('手册下载成功')}
                          >
                            下载
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  dataSource={emergencyManualsData}
                  pagination={{ pageSize: 8 }}
                  rowKey="id"
                />
              </div>
            )
          },
          {
            key: 'execution',
            label: '📊 方案执行记录',
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} />
                    <Select placeholder="执行结果" style={{ width: 140 }}>
                      <Option value="all">全部结果</Option>
                      <Option value="success">成功</Option>
                      <Option value="partial">部分成功</Option>
                      <Option value="failed">失败</Option>
                    </Select>
                    <Select placeholder="救援队伍" style={{ width: 140 }}>
                      <Option value="all">全部队伍</Option>
                      <Option value="team1">东港救援队</Option>
                      <Option value="team2">专业救援队</Option>
                    </Select>
                    <Button icon={<ReloadOutlined />}>刷新</Button>
                  </Space>
                </div>

                <Table
                  columns={[
                    {
                      title: '执行时间',
                      dataIndex: 'executionDate',
                      key: 'executionDate',
                      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
                    },
                    {
                      title: '方案名称',
                      dataIndex: 'planName',
                      key: 'planName'
                    },
                    {
                      title: '执行地点',
                      dataIndex: 'location',
                      key: 'location'
                    },
                    {
                      title: '救援队伍',
                      dataIndex: 'rescueTeam',
                      key: 'rescueTeam'
                    },
                    {
                      title: '执行时长',
                      dataIndex: 'totalTime',
                      key: 'totalTime'
                    },
                    {
                      title: '执行结果',
                      dataIndex: 'result',
                      key: 'result',
                      render: (result) => {
                        const resultMap = {
                          'success': { text: '成功', color: 'green' },
                          'partial': { text: '部分成功', color: 'orange' },
                          'executing': { text: '执行中', color: 'blue' },
                          'failed': { text: '失败', color: 'red' }
                        };
                        const config = resultMap[result] || { text: result, color: 'default' };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 150,
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedExecution(record);
                              setExecutionRecordModalVisible(true);
                            }}
                          >
                            查看详情
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => message.info('导出报告功能开发中...')}
                          >
                            导出
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  dataSource={executionRecords}
                  pagination={{ pageSize: 8 }}
                  rowKey="id"
                />
              </div>
            )
          },
          {
            key: 'optimization',
            label: '🔧 方案优化建议',
            children: (
              <div>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Card title="方案效果统计" size="small">
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>总执行次数</span>
                          <span style={{ fontWeight: 'bold' }}>294次</span>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>平均成功率</span>
                          <span style={{ fontWeight: 'bold', color: '#52c41a' }}>81.1%</span>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>平均执行时间</span>
                          <span style={{ fontWeight: 'bold' }}>18.5分钟</span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="热门方案排行" size="small">
                      {rescuePlansData.sort((a, b) => b.executionCount - a.executionCount).slice(0, 3).map((plan, index) => (
                        <div key={plan.id} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                              <Badge count={index + 1} style={{ backgroundColor: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : '#52c41a' }} />
                              <span style={{ marginLeft: 8 }}>{plan.name}</span>
                            </span>
                            <span style={{ color: '#666' }}>{plan.executionCount}次</span>
                          </div>
                        </div>
                      ))}
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="改进建议" size="small">
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="red">🚨 紧急</Tag>
                        <span style={{ fontSize: '12px' }}>深水救援方案成功率偏低</span>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="orange">⚠️ 关注</Tag>
                        <span style={{ fontSize: '12px' }}>急流救援执行时间过长</span>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="green">✅ 优化</Tag>
                        <span style={{ fontSize: '12px' }}>离岸救援可增加备用设备</span>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Card title="方案优化分析" size="small">
                  <Table
                    columns={[
                      { title: '方案名称', dataIndex: 'name', key: 'name' },
                      {
                        title: '当前成功率',
                        dataIndex: 'successRate',
                        key: 'successRate',
                        render: (rate) => (
                          <Progress
                            percent={rate}
                            size="small"
                            strokeColor={rate >= 90 ? '#52c41a' : rate >= 70 ? '#fa8c16' : '#f5222d'}
                          />
                        )
                      },
                      {
                        title: '优化建议',
                        key: 'suggestion',
                        render: (_, record) => {
                          if (record.successRate >= 90) return <Tag color="green">表现优秀</Tag>;
                          if (record.successRate >= 70) return <Tag color="orange">需要改进</Tag>;
                          return <Tag color="red">急需优化</Tag>;
                        }
                      },
                      {
                        title: '改进措施',
                        key: 'improvement',
                        render: (_, record) => {
                          const improvements = {
                            'plan001': '增加备用抛投手',
                            'plan002': '改进抛投浮具设计',
                            'plan003': '加强照明设备配置',
                            'plan004': '增加专业潜水员培训'
                          };
                          return improvements[record.id] || '持续监控';
                        }
                      },
                      {
                        title: '操作',
                        key: 'action',
                        render: () => (
                          <Button type="link" size="small">查看详情</Button>
                        )
                      }
                    ]}
                    dataSource={rescuePlansData}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </div>
            )
          }
        ]} />
      </Card>
    </div>
  );

  // 渲染救援方案弹窗
  const renderPlanModal = () => (
    <Modal
      title={isEditingPlan ? (selectedPlan ? '编辑救援方案' : '新建救援方案') : '查看救援方案'}
      open={planModalVisible}
      onCancel={() => {
        setPlanModalVisible(false);
        setSelectedPlan(null);
        setIsEditingPlan(false);
        planForm.resetFields();
      }}
      width={1000}
      footer={isEditingPlan ? [
        <Button key="cancel" onClick={() => {
          setPlanModalVisible(false);
          setSelectedPlan(null);
          setIsEditingPlan(false);
          planForm.resetFields();
        }}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handlePlanSubmit}>
          {selectedPlan ? '更新' : '创建'}
        </Button>
      ] : [
        <Button key="edit" type="primary" onClick={() => setIsEditingPlan(true)}>
          编辑方案
        </Button>,
        <Button key="close" onClick={() => {
          setPlanModalVisible(false);
          setSelectedPlan(null);
        }}>
          关闭
        </Button>
      ]}
    >
      {isEditingPlan ? (
        <Form form={planForm} layout="vertical">
          <Tabs defaultActiveKey="basic" items={[
            {
              key: 'basic',
              label: '📋 基本信息',
              children: (
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="name" label="方案名称" rules={[{ required: true, message: '请输入方案名称' }]}>
                        <Input placeholder="请输入方案名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="scenario" label="救援场景" rules={[{ required: true, message: '请选择救援场景' }]}>
                        <Select placeholder="请选择救援场景">
                          <Option value="offshore">离岸救援</Option>
                          <Option value="rapid_current">急流救援</Option>
                          <Option value="night">夜间救援</Option>
                          <Option value="deep_water">深水救援</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="difficulty" label="难度等级" rules={[{ required: true, message: '请选择难度等级' }]}>
                        <Select placeholder="请选择难度等级">
                          <Option value="easy">简单</Option>
                          <Option value="medium">中等</Option>
                          <Option value="hard">困难</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="tags" label="方案标签">
                        <Select mode="tags" placeholder="请输入或选择标签">
                          <Option value="标准方案">标准方案</Option>
                          <Option value="高成功率">高成功率</Option>
                          <Option value="快速响应">快速响应</Option>
                          <Option value="复杂方案">复杂方案</Option>
                          <Option value="设备密集">设备密集</Option>
                          <Option value="专业技能">专业技能</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="description" label="方案描述" rules={[{ required: true, message: '请输入方案描述' }]}>
                    <TextArea rows={3} placeholder="请输入方案描述" />
                  </Form.Item>
                </div>
              )
            },
            {
              key: 'steps',
              label: '📝 执行步骤',
              children: (
                <div>
                  <Form.List name="steps">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Card
                            key={key}
                            size="small"
                            style={{ marginBottom: 16 }}
                            title={`步骤 ${name + 1}`}
                            extra={
                              <Button
                                type="link"
                                danger
                                onClick={() => remove(name)}
                                icon={<DeleteOutlined />}
                              >
                                删除
                              </Button>
                            }
                          >
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'title']}
                                  label="步骤标题"
                                  rules={[{ required: true, message: '请输入步骤标题' }]}
                                >
                                  <Input placeholder="请输入步骤标题" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'duration']}
                                  label="执行时长"
                                  rules={[{ required: true, message: '请输入执行时长' }]}
                                >
                                  <Input placeholder="如：2-3分钟" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Form.Item
                              {...restField}
                              name={[name, 'content']}
                              label="步骤内容"
                              rules={[{ required: true, message: '请输入步骤内容' }]}
                            >
                              <TextArea rows={2} placeholder="请输入详细的执行内容" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'equipment']}
                              label="所需设备"
                            >
                              <Select mode="tags" placeholder="请选择或输入所需设备">
                                <Option value="救生圈">救生圈</Option>
                                <Option value="抛投绳">抛投绳</Option>
                                <Option value="救生艇">救生艇</Option>
                                <Option value="无人机">无人机</Option>
                                <Option value="急救包">急救包</Option>
                                <Option value="对讲机">对讲机</Option>
                                <Option value="望远镜">望远镜</Option>
                                <Option value="保暖毯">保暖毯</Option>
                                <Option value="照明设备">照明设备</Option>
                                <Option value="潜水设备">潜水设备</Option>
                              </Select>
                            </Form.Item>
                          </Card>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          添加执行步骤
                        </Button>
                      </>
                    )}
                  </Form.List>
                </div>
              )
            },
            {
              key: 'personnel',
              label: '👥 人员配置',
              children: (
                <div>
                  <Form.List name="requiredPersonnel">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Card
                            key={key}
                            size="small"
                            style={{ marginBottom: 16 }}
                            title={`角色 ${name + 1}`}
                            extra={
                              <Button
                                type="link"
                                danger
                                onClick={() => remove(name)}
                                icon={<DeleteOutlined />}
                              >
                                删除
                              </Button>
                            }
                          >
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'role']}
                                  label="角色名称"
                                  rules={[{ required: true, message: '请输入角色名称' }]}
                                >
                                  <Input placeholder="如：现场指挥、救生员等" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'count']}
                                  label="人数要求"
                                  rules={[{ required: true, message: '请输入人数要求' }]}
                                >
                                  <InputNumber min={1} placeholder="人数" style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Form.Item
                              {...restField}
                              name={[name, 'skills']}
                              label="技能要求"
                            >
                              <Select mode="tags" placeholder="请选择或输入技能要求">
                                <Option value="指挥协调">指挥协调</Option>
                                <Option value="现场评估">现场评估</Option>
                                <Option value="抛投技能">抛投技能</Option>
                                <Option value="游泳救生">游泳救生</Option>
                                <Option value="急救证">急救证</Option>
                                <Option value="医疗救护">医疗救护</Option>
                                <Option value="救生员证">救生员证</Option>
                                <Option value="潜水证">潜水证</Option>
                                <Option value="船舶驾驶证">船舶驾驶证</Option>
                                <Option value="无人机操作证">无人机操作证</Option>
                                <Option value="夜间救援">夜间救援</Option>
                                <Option value="急流救援">急流救援</Option>
                                <Option value="水下救援">水下救援</Option>
                              </Select>
                            </Form.Item>
                          </Card>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          添加人员角色
                        </Button>
                      </>
                    )}
                  </Form.List>
                </div>
              )
            },
            {
              key: 'environment',
              label: '🌊 环境参数',
              children: (
                <div>
                  <Card title="适用环境条件" size="small">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['environmentParams', 'waterDepth']} label="水深范围">
                          <Input placeholder="如：1-3米" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['environmentParams', 'currentSpeed']} label="流速要求">
                          <Input placeholder="如：< 0.5m/s" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['environmentParams', 'visibility']} label="能见度要求">
                          <Input placeholder="如：> 100米" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['environmentParams', 'waveHeight']} label="浪高限制">
                          <Input placeholder="如：< 0.5米" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name={['environmentParams', 'weather']} label="适用天气">
                      <Select mode="multiple" placeholder="请选择适用天气条件">
                        <Option value="晴天">晴天</Option>
                        <Option value="多云">多云</Option>
                        <Option value="小雨">小雨</Option>
                        <Option value="中雨">中雨</Option>
                        <Option value="雾天">雾天</Option>
                        <Option value="微风">微风</Option>
                        <Option value="大风">大风</Option>
                      </Select>
                    </Form.Item>
                    <Alert
                      message="环境参数说明"
                      description="这些参数将用于系统自动推荐适配的救援方案，请根据实际救援场景填写合理的数值范围。"
                      type="info"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  </Card>
                </div>
              )
            }
          ]} />
        </Form>
      ) : selectedPlan ? (
        <div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="方案名称">{selectedPlan.name}</Descriptions.Item>
            <Descriptions.Item label="救援场景">
              <Tag color="blue">{selectedPlan.scenario}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="难度等级">
              <Tag color={selectedPlan.difficulty === 'easy' ? 'green' : selectedPlan.difficulty === 'medium' ? 'orange' : 'red'}>
                {selectedPlan.difficulty === 'easy' ? '简单' : selectedPlan.difficulty === 'medium' ? '中等' : '困难'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="成功率">
              <Progress percent={selectedPlan.successRate} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="执行次数">{selectedPlan.executionCount}次</Descriptions.Item>
            <Descriptions.Item label="平均用时">
              <span style={{
                color: calculateAverageExecutionTime(selectedPlan.id) === '暂无数据' ? '#999' : '#333',
                fontStyle: calculateAverageExecutionTime(selectedPlan.id) === '暂无数据' ? 'italic' : 'normal'
              }}>
                {calculateAverageExecutionTime(selectedPlan.id)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>{selectedPlan.lastUpdated}</Descriptions.Item>
          </Descriptions>

          <Divider>方案描述</Divider>
          <p>{selectedPlan.description}</p>

          <Divider>执行步骤</Divider>
          <div>
            {selectedPlan.steps?.map((step, index) => (
              <Card key={step.id} size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                    <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{step.title}</span>
                  </div>
                  <Tag color="blue">{step.duration}</Tag>
                </div>
                <p style={{ margin: '8px 0', color: '#666' }}>{step.content}</p>
                <div>
                  <Text strong>所需设备：</Text>
                  {step.equipment?.map(eq => (
                    <Tag key={eq} size="small">{eq}</Tag>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Divider>人员配置</Divider>
          <Table
            columns={[
              { title: '角色', dataIndex: 'role', key: 'role' },
              { title: '人数', dataIndex: 'count', key: 'count' },
              {
                title: '技能要求',
                dataIndex: 'skills',
                key: 'skills',
                render: (skills) => skills?.map(skill => <Tag key={skill} size="small">{skill}</Tag>)
              }
            ]}
            dataSource={selectedPlan.requiredPersonnel}
            pagination={false}
            size="small"
          />

          <Divider>环境参数</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="水深">{selectedPlan.environmentParams?.waterDepth}</Descriptions.Item>
            <Descriptions.Item label="流速">{selectedPlan.environmentParams?.currentSpeed}</Descriptions.Item>
            <Descriptions.Item label="能见度">{selectedPlan.environmentParams?.visibility}</Descriptions.Item>
            <Descriptions.Item label="浪高">{selectedPlan.environmentParams?.waveHeight}</Descriptions.Item>
            <Descriptions.Item label="适用天气" span={2}>
              {selectedPlan.environmentParams?.weather?.map(w => <Tag key={w}>{w}</Tag>)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : null}
    </Modal>
  );

  // 渲染应急手册弹窗
  const renderManualModal = () => (
    <Modal
      title={isEditingManual ? (selectedManual ? '编辑应急手册' : '新建应急手册') : '查看应急手册'}
      open={manualModalVisible}
      onCancel={() => {
        setManualModalVisible(false);
        setSelectedManual(null);
        setIsEditingManual(false);
        manualForm.resetFields();
      }}
      width={1000}
      footer={isEditingManual ? [
        <Button key="cancel" onClick={() => {
          setManualModalVisible(false);
          setSelectedManual(null);
          setIsEditingManual(false);
          manualForm.resetFields();
        }}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleManualSubmit}>
          {selectedManual ? '更新' : '创建'}
        </Button>
      ] : [
        <Button key="edit" type="primary" onClick={() => setIsEditingManual(true)}>
          编辑手册
        </Button>,
        <Button key="download" icon={<DownloadOutlined />} onClick={() => message.success('手册下载成功')}>
          下载
        </Button>,
        <Button key="close" onClick={() => {
          setManualModalVisible(false);
          setSelectedManual(null);
        }}>
          关闭
        </Button>
      ]}
    >
      {isEditingManual ? (
        <Form form={manualForm} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="手册标题" rules={[{ required: true, message: '请输入手册标题' }]}>
                <Input placeholder="请输入手册标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="手册类型" rules={[{ required: true, message: '请选择手册类型' }]}>
                <Select placeholder="请选择手册类型">
                  <Option value="medical">医疗急救</Option>
                  <Option value="rescue">救援技巧</Option>
                  <Option value="safety">安全防护</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请选择优先级' }]}>
                <Select placeholder="请选择优先级">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="标签">
                <Select mode="tags" placeholder="请输入或选择标签">
                  <Option value="急救">急救</Option>
                  <Option value="溺水">溺水</Option>
                  <Option value="医疗">医疗</Option>
                  <Option value="技巧">技巧</Option>
                  <Option value="安全">安全</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="手册内容" rules={[{ required: true, message: '请输入手册内容' }]}>
            <TextArea rows={10} placeholder="请输入手册内容，支持Markdown格式" />
          </Form.Item>
          <Form.Item name="attachments" label="附件">
            <Upload>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      ) : selectedManual ? (
        <div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="手册标题">{selectedManual.title}</Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="blue">{selectedManual.category === 'medical' ? '医疗急救' : selectedManual.category === 'rescue' ? '救援技巧' : '安全防护'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={selectedManual.priority === 'high' ? 'red' : selectedManual.priority === 'medium' ? 'orange' : 'green'}>
                {selectedManual.priority === 'high' ? '高' : selectedManual.priority === 'medium' ? '中' : '低'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="查看次数">{selectedManual.viewCount}次</Descriptions.Item>
            <Descriptions.Item label="下载次数">{selectedManual.downloadCount}次</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedManual.lastUpdated}</Descriptions.Item>
          </Descriptions>

          <Divider>手册内容</Divider>
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '6px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedManual.content}</pre>
          </div>

          {selectedManual.attachments && selectedManual.attachments.length > 0 && (
            <>
              <Divider>附件</Divider>
              <div>
                {selectedManual.attachments.map(file => (
                  <Tag key={file} icon={<FileTextOutlined />} style={{ margin: '4px' }}>
                    {file}
                  </Tag>
                ))}
              </div>
            </>
          )}

          <Divider>标签</Divider>
          <div>
            {selectedManual.tags?.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );

  // 渲染执行记录弹窗
  const renderExecutionRecordModal = () => (
    <Modal
      title="方案执行记录详情"
      open={executionRecordModalVisible}
      onCancel={() => {
        setExecutionRecordModalVisible(false);
        setSelectedExecution(null);
      }}
      width={1200}
      footer={[
        selectedExecution?.status === 'executing' && (
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => {
              // 保存当前的执行记录状态，不修改数据
              message.success('执行记录已保存');
            }}
          >
            保存记录
          </Button>
        ),
        <Button key="export" type="default" icon={<DownloadOutlined />}>
          导出报告
        </Button>,
        <Button key="close" onClick={() => {
          setExecutionRecordModalVisible(false);
          setSelectedExecution(null);
        }}>
          关闭
        </Button>
      ].filter(Boolean)}
    >
      {selectedExecution ? (
        <div>
          {/* 权限状态提示 */}
          {(() => {
            const permissionInfo = getPermissionInfo(selectedExecution);
            return (
              <Alert
                message={permissionInfo.message}
                type={permissionInfo.type}
                showIcon
                style={{ marginBottom: 16 }}
                action={
                  permissionInfo.editable && (
                    <Button size="small" type="primary">
                      可编辑
                    </Button>
                  )
                }
              />
            );
          })()}

          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="执行时间">{moment(selectedExecution.executionDate).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="方案名称">{selectedExecution.planName}</Descriptions.Item>
            <Descriptions.Item label="执行地点">{selectedExecution.location}</Descriptions.Item>
            <Descriptions.Item label="救援队伍">{selectedExecution.rescueTeam}</Descriptions.Item>
            <Descriptions.Item label="队长">{selectedExecution.teamLeader}</Descriptions.Item>
            <Descriptions.Item label="总用时">{selectedExecution.totalTime}</Descriptions.Item>
            <Descriptions.Item label="天气条件">{selectedExecution.weather}</Descriptions.Item>
            <Descriptions.Item label="水域条件">{selectedExecution.waterConditions}</Descriptions.Item>
            <Descriptions.Item label="执行结果">
              <Tag color={
                selectedExecution.result === 'success' ? 'green' :
                selectedExecution.result === 'partial' ? 'orange' :
                selectedExecution.result === 'executing' ? 'blue' : 'red'
              }>
                {selectedExecution.result === 'success' ? '成功' :
                 selectedExecution.result === 'partial' ? '部分成功' :
                 selectedExecution.result === 'executing' ? '执行中' : '失败'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="成功率">{selectedExecution.successRate}%</Descriptions.Item>
          </Descriptions>

          <Divider>参与人员</Divider>
          <div style={{
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            minHeight: '60px'
          }}>
            {selectedExecution.participants && selectedExecution.participants.length > 0 ? (
              <div>
                <div style={{
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  共 {selectedExecution.participants.length} 人参与救援：
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedExecution.participants.map((person, index) => {
                    // 如果person是字符串，直接显示；如果是对象，提取姓名
                    const personName = typeof person === 'string' ? person : person.name || person;
                    const personRole = typeof person === 'object' ? person.role || person.position : null;

                    return (
                      <div
                        key={`${personName}-${index}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          backgroundColor: '#e6f7ff',
                          border: '1px solid #91d5ff',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        <span style={{ color: '#1890ff' }}>{personName}</span>
                        {personRole && (
                          <span style={{
                            marginLeft: '6px',
                            padding: '2px 6px',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '11px'
                          }}>
                            {personRole}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#999',
                fontSize: '14px',
                padding: '20px 0'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  ⚠️ 暂无参与人员信息
                </div>
                <div style={{ fontSize: '12px' }}>
                  可能是执行记录创建时未正确保存参与人员数据
                </div>
              </div>
            )}
          </div>

          <Divider>落水者信息</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="年龄">{selectedExecution.victim?.age}岁</Descriptions.Item>
            <Descriptions.Item label="性别">{selectedExecution.victim?.gender}</Descriptions.Item>
            <Descriptions.Item label="状态">{selectedExecution.victim?.condition}</Descriptions.Item>
            <Descriptions.Item label="落水原因">{selectedExecution.victim?.cause}</Descriptions.Item>
          </Descriptions>

          <Divider>执行步骤详情</Divider>
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={[
                {
                  title: '步骤',
                  dataIndex: 'stepId',
                  key: 'stepId',
                  width: 60,
                  fixed: 'left',
                  render: (stepId) => <Badge count={stepId} style={{ backgroundColor: '#1890ff' }} />
                },
                {
                  title: '步骤名称',
                  dataIndex: 'title',
                  key: 'title',
                  width: 150,
                  render: (title, record) => (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{title}</div>
                      <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                        {record.content?.substring(0, 30)}...
                      </div>
                    </div>
                  )
                },
                {
                  title: '开始时间',
                  dataIndex: 'startTime',
                  key: 'startTime',
                  width: 90,
                  render: (time) => time ? <span style={{ fontSize: '12px' }}>{time}</span> : '-'
                },
                {
                  title: '结束时间',
                  dataIndex: 'endTime',
                  key: 'endTime',
                  width: 90,
                  render: (time) => time ? <span style={{ fontSize: '12px' }}>{time}</span> : '-'
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (status) => (
                    <Tag
                      size="small"
                      color={
                        status === 'completed' ? 'green' :
                        status === 'partial_success' ? 'orange' :
                        status === 'failed' ? 'red' :
                        status === 'in_progress' ? 'blue' :
                        'default'
                      }
                    >
                      {status === 'completed' ? '已完成' :
                       status === 'partial_success' ? '部分成功' :
                       status === 'failed' ? '失败' :
                       status === 'in_progress' ? '进行中' :
                       '待执行'}
                    </Tag>
                  )
                },
              {
                title: '备注',
                dataIndex: 'notes',
                key: 'notes',
                render: (notes, record) => {
                  if (editingStepId === record.stepId && isEditable(selectedExecution)) {
                    return (
                      <Form form={stepNoteForm} layout="inline">
                        <Form.Item name="notes" style={{ margin: 0, flex: 1 }}>
                          <Input.TextArea
                            rows={2}
                            placeholder="请输入执行备注..."
                            defaultValue={notes}
                          />
                        </Form.Item>
                        <Form.Item style={{ margin: 0 }}>
                          <Space>
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => handleUpdateStepNote(selectedExecution.id, record.stepId)}
                            >
                              保存
                            </Button>
                            <Button
                              size="small"
                              onClick={() => {
                                setEditingStepId(null);
                                stepNoteForm.resetFields();
                              }}
                            >
                              取消
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{notes || '暂无备注'}</span>
                      {isEditable(selectedExecution) && (
                        <Button
                          size="small"
                          type="link"
                          onClick={() => {
                            setEditingStepId(record.stepId);
                            stepNoteForm.setFieldsValue({ notes: notes || '' });
                          }}
                        >
                          编辑
                        </Button>
                      )}
                    </div>
                  );
                }
              },
              {
                title: '操作',
                key: 'action',
                width: 160,
                render: (_, record) => {
                  if (!isEditable(selectedExecution)) {
                    // 只读状态下显示状态标签
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        {record.status === 'completed' && (
                          <Tag color="success" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                            ✓ 已完成
                          </Tag>
                        )}
                        {record.status === 'partial_success' && (
                          <Tag color="warning" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                            ⚠ 部分成功
                          </Tag>
                        )}
                        {record.status === 'failed' && (
                          <Tag color="error" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                            ✗ 失败
                          </Tag>
                        )}
                        {record.status === 'in_progress' && (
                          <Tag color="processing" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                            ⏳ 进行中
                          </Tag>
                        )}
                        {record.status === 'pending' && (
                          <Tag color="default" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                            ⏸ 待执行
                          </Tag>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                      {record.status === 'pending' && (
                        <Button
                          size="small"
                          type="primary"
                          block
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleStartStep(selectedExecution.id, record.stepId)}
                          style={{ fontSize: '12px', height: '28px', borderRadius: '4px' }}
                        >
                          开始执行
                        </Button>
                      )}

                      {record.status === 'in_progress' && (
                        <>
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'complete',
                                  label: '✓ 成功完成',
                                  icon: <CheckCircleOutlined />,
                                  onClick: () => handleCompleteStep(selectedExecution.id, record.stepId)
                                },
                                {
                                  key: 'partial',
                                  label: '⚠ 部分成功',
                                  icon: <WarningOutlined />,
                                  onClick: () => {
                                    Modal.confirm({
                                      title: '标记为部分成功',
                                      content: (
                                        <div>
                                          <p>请输入部分成功的原因：</p>
                                          <Input.TextArea
                                            id="partial-reason"
                                            placeholder="例如：目标已救起但设备有损坏..."
                                            rows={3}
                                          />
                                        </div>
                                      ),
                                      onOk: () => {
                                        const reason = document.getElementById('partial-reason')?.value || '';
                                        handlePartialSuccessStep(selectedExecution.id, record.stepId, reason);
                                      }
                                    });
                                  }
                                },
                                {
                                  key: 'fail',
                                  label: '✗ 执行失败',
                                  icon: <CloseOutlined />,
                                  danger: true,
                                  onClick: () => {
                                    Modal.confirm({
                                      title: '标记为失败',
                                      content: (
                                        <div>
                                          <p>请输入失败原因：</p>
                                          <Input.TextArea
                                            id="fail-reason"
                                            placeholder="例如：设备故障、天气恶劣、人员不足..."
                                            rows={3}
                                          />
                                        </div>
                                      ),
                                      onOk: () => {
                                        const reason = document.getElementById('fail-reason')?.value || '';
                                        handleFailStep(selectedExecution.id, record.stepId, reason);
                                      }
                                    });
                                  }
                                }
                              ]
                            }}
                            trigger={['click']}
                          >
                            <Button
                              size="small"
                              type="primary"
                              block
                              style={{ fontSize: '12px', height: '28px', borderRadius: '4px' }}
                            >
                              完成状态 <DownOutlined />
                            </Button>
                          </Dropdown>
                        </>
                      )}

                      {(record.status === 'completed' || record.status === 'partial_success' || record.status === 'failed') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {record.status === 'completed' && (
                            <Tag color="success" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                              ✓ 已完成
                            </Tag>
                          )}
                          {record.status === 'partial_success' && (
                            <Tag color="warning" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                              ⚠ 部分成功
                            </Tag>
                          )}
                          {record.status === 'failed' && (
                            <Tag color="error" style={{ textAlign: 'center', margin: 0, fontSize: '12px' }}>
                              ✗ 失败
                            </Tag>
                          )}
                          <Button
                            size="small"
                            type="link"
                            block
                            onClick={() => {
                              Modal.confirm({
                                title: '重置步骤状态',
                                content: '确定要将此步骤重置为待执行状态吗？',
                                onOk: () => handleResetStep(selectedExecution.id, record.stepId)
                              });
                            }}
                            style={{ fontSize: '11px', height: '20px', padding: 0 }}
                          >
                            重置
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                }
              }
            ]}
            dataSource={selectedExecution.executionSteps}
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />
          </div>

          <Divider>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>改进建议</span>
              {isEditable(selectedExecution) && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    Modal.confirm({
                      title: '添加改进建议',
                      width: 600,
                      content: (
                        <Form form={improvementForm} layout="vertical" style={{ marginTop: 16 }}>
                          <Form.Item
                            name="content"
                            label="建议内容"
                            rules={[{ required: true, message: '请输入建议内容' }]}
                          >
                            <Input.TextArea rows={3} placeholder="请详细描述改进建议..." />
                          </Form.Item>
                          <Form.Item
                            name="priority"
                            label="优先级"
                            rules={[{ required: true, message: '请选择优先级' }]}
                          >
                            <Select placeholder="选择优先级">
                              <Option value="high">高</Option>
                              <Option value="medium">中</Option>
                              <Option value="low">低</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="category"
                            label="分类"
                            rules={[{ required: true, message: '请选择分类' }]}
                          >
                            <Select placeholder="选择分类">
                              <Option value="equipment">设备</Option>
                              <Option value="process">流程</Option>
                              <Option value="personnel">人员</Option>
                              <Option value="environment">环境</Option>
                              <Option value="other">其他</Option>
                            </Select>
                          </Form.Item>
                        </Form>
                      ),
                      onOk: () => addImprovement(selectedExecution.id)
                    });
                  }}
                >
                  添加建议
                </Button>
              )}
            </div>
          </Divider>
          <div>
            {selectedExecution.improvements?.map((improvement, index) => {
              // 处理旧格式数据（字符串）和新格式数据（对象）
              const isOldFormat = typeof improvement === 'string';
              const improvementData = isOldFormat ? {
                id: index.toString(),
                content: improvement,
                priority: 'medium',
                category: 'other',
                addedBy: '系统',
                addedTime: '历史数据'
              } : improvement;

              const priorityColors = {
                high: 'red',
                medium: 'orange',
                low: 'green'
              };

              const categoryLabels = {
                equipment: '设备',
                process: '流程',
                personnel: '人员',
                environment: '环境',
                other: '其他'
              };

              return (
                <Card key={improvementData.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color={priorityColors[improvementData.priority]}>
                          {improvementData.priority === 'high' ? '高优先级' :
                           improvementData.priority === 'medium' ? '中优先级' : '低优先级'}
                        </Tag>
                        <Tag color="blue">{categoryLabels[improvementData.category]}</Tag>
                      </div>
                      <div style={{ marginBottom: 8 }}>{improvementData.content}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {improvementData.addedBy} · {improvementData.addedTime}
                      </div>
                    </div>
                    {isEditable(selectedExecution) && !isOldFormat && (
                      <Space>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => {
                            Modal.confirm({
                              title: '编辑改进建议',
                              width: 600,
                              content: (
                                <Form
                                  form={improvementForm}
                                  layout="vertical"
                                  style={{ marginTop: 16 }}
                                  initialValues={improvementData}
                                >
                                  <Form.Item
                                    name="content"
                                    label="建议内容"
                                    rules={[{ required: true, message: '请输入建议内容' }]}
                                  >
                                    <Input.TextArea rows={3} />
                                  </Form.Item>
                                  <Form.Item
                                    name="priority"
                                    label="优先级"
                                    rules={[{ required: true, message: '请选择优先级' }]}
                                  >
                                    <Select>
                                      <Option value="high">高</Option>
                                      <Option value="medium">中</Option>
                                      <Option value="low">低</Option>
                                    </Select>
                                  </Form.Item>
                                  <Form.Item
                                    name="category"
                                    label="分类"
                                    rules={[{ required: true, message: '请选择分类' }]}
                                  >
                                    <Select>
                                      <Option value="equipment">设备</Option>
                                      <Option value="process">流程</Option>
                                      <Option value="personnel">人员</Option>
                                      <Option value="environment">环境</Option>
                                      <Option value="other">其他</Option>
                                    </Select>
                                  </Form.Item>
                                </Form>
                              ),
                              onOk: async () => {
                                try {
                                  const values = await improvementForm.validateFields();
                                  updateImprovement(selectedExecution.id, improvementData.id, {
                                    ...values,
                                    updatedBy: '当前用户',
                                    updatedTime: new Date().toLocaleString('zh-CN')
                                  });
                                  improvementForm.resetFields();
                                  message.success('建议已更新');
                                } catch (error) {
                                  console.error('更新失败:', error);
                                }
                              }
                            });
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          size="small"
                          type="link"
                          danger
                          onClick={() => deleteImprovement(selectedExecution.id, improvementData.id)}
                        >
                          删除
                        </Button>
                      </Space>
                    )}
                  </div>
                </Card>
              );
            })}
            {(!selectedExecution.improvements || selectedExecution.improvements.length === 0) && (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无改进建议
              </div>
            )}
          </div>

          <Divider>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>执行反馈</span>
              {isEditable(selectedExecution) && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    Modal.confirm({
                      title: '添加执行反馈',
                      width: 600,
                      content: (
                        <Form form={feedbackForm} layout="vertical" style={{ marginTop: 16 }}>
                          <Form.Item
                            name="content"
                            label="反馈内容"
                            rules={[{ required: true, message: '请输入反馈内容' }]}
                          >
                            <Input.TextArea rows={4} placeholder="请详细描述执行过程中的情况、问题和建议..." />
                          </Form.Item>
                          <Form.Item
                            name="rating"
                            label="执行评分"
                            rules={[{ required: true, message: '请选择评分' }]}
                          >
                            <Rate allowHalf />
                          </Form.Item>
                        </Form>
                      ),
                      onOk: () => addFeedback(selectedExecution.id)
                    });
                  }}
                >
                  添加反馈
                </Button>
              )}
            </div>
          </Divider>
          <div>
            {/* 显示新格式的多人反馈 */}
            {selectedExecution.feedbacks?.map((feedback) => (
              <Card key={feedback.id} size="small" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Rate disabled value={feedback.rating} style={{ fontSize: '14px' }} />
                      <Tag
                        color={feedback.status === 'reviewed' ? 'green' : feedback.status === 'submitted' ? 'blue' : 'default'}
                        style={{ marginLeft: 8 }}
                      >
                        {feedback.status === 'reviewed' ? '已审核' :
                         feedback.status === 'submitted' ? '已提交' : '草稿'}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 8, lineHeight: '1.6' }}>{feedback.content}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {feedback.feedbackBy} · {feedback.feedbackTime}
                    </div>
                  </div>
                  {isEditable(selectedExecution) && feedback.status === 'submitted' && (
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => updateFeedbackStatus(selectedExecution.id, feedback.id, 'reviewed')}
                      >
                        标记已审核
                      </Button>
                    </Space>
                  )}
                </div>
              </Card>
            ))}

            {/* 显示旧格式的反馈（兼容性） */}
            {selectedExecution.feedback && !selectedExecution.feedbacks && (
              <Card size="small" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Rate disabled value={5} style={{ fontSize: '14px' }} />
                      <Tag color="green" style={{ marginLeft: 8 }}>已审核</Tag>
                    </div>
                    <div style={{ marginBottom: 8, lineHeight: '1.6' }}>{selectedExecution.feedback}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {selectedExecution.reportedBy || '系统'} · {selectedExecution.executionDate}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {!selectedExecution.feedback && (!selectedExecution.feedbacks || selectedExecution.feedbacks.length === 0) && (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无执行反馈
              </div>
            )}
          </div>

          <Divider>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>相关媒体文件</span>
              {isEditable(selectedExecution) && (
                <Upload
                  beforeUpload={(file) => {
                    Modal.confirm({
                      title: '上传文件',
                      width: 500,
                      content: (
                        <Form layout="vertical" style={{ marginTop: 16 }}>
                          <Form.Item label="文件信息">
                            <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                              <div>文件名: {file.name}</div>
                              <div>文件大小: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                              <div>文件类型: {file.type || '未知'}</div>
                            </div>
                          </Form.Item>
                          <Form.Item label="文件描述">
                            <Input.TextArea
                              rows={2}
                              placeholder="请输入文件描述..."
                              id="file-description"
                            />
                          </Form.Item>
                          <Form.Item label="标签">
                            <Select
                              mode="tags"
                              placeholder="添加标签"
                              style={{ width: '100%' }}
                              id="file-tags"
                            >
                              <Option value="现场照片">现场照片</Option>
                              <Option value="救援视频">救援视频</Option>
                              <Option value="设备记录">设备记录</Option>
                              <Option value="文档资料">文档资料</Option>
                            </Select>
                          </Form.Item>
                        </Form>
                      ),
                      onOk: () => {
                        const description = document.getElementById('file-description')?.value || '';
                        const tagsElement = document.getElementById('file-tags');
                        const tags = tagsElement ? Array.from(tagsElement.selectedOptions).map(option => option.value) : [];

                        handleFileUpload(selectedExecution.id, {
                          file,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          description,
                          tags
                        });
                      }
                    });
                    return false; // 阻止自动上传
                  }}
                  showUploadList={false}
                  multiple
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<UploadOutlined />}
                  >
                    上传文件
                  </Button>
                </Upload>
              )}
            </div>
          </Divider>
          <div>
            {/* 显示新格式的文件 */}
            {Array.isArray(selectedExecution.mediaFiles) ?
              selectedExecution.mediaFiles.map(file => {
                const isLegacy = typeof file === 'string';
                const fileData = isLegacy ? {
                  id: file,
                  name: file,
                  type: file.includes('视频') || file.includes('.mp4') ? 'video' : 'image',
                  url: '#',
                  description: '历史文件',
                  tags: [],
                  uploadedBy: '系统',
                  uploadedTime: selectedExecution.executionDate
                } : file;

                const getFileIcon = () => {
                  if (fileData.type?.startsWith('image/') || fileData.name?.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
                    return <FileImageOutlined />;
                  } else if (fileData.type?.startsWith('video/') || fileData.name?.match(/\.(mp4|avi|mov|wmv)$/i)) {
                    return <PlaySquareOutlined />;
                  } else if (fileData.type?.startsWith('audio/') || fileData.name?.match(/\.(mp3|wav|flac)$/i)) {
                    return <AudioOutlined />;
                  } else {
                    return <FileOutlined />;
                  }
                };

                return (
                  <Card key={fileData.id} size="small" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ marginRight: 12, fontSize: '24px', color: '#1890ff' }}>
                          {getFileIcon()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{fileData.name}</div>
                          {fileData.description && (
                            <div style={{ marginBottom: 4, color: '#666' }}>{fileData.description}</div>
                          )}
                          <div style={{ marginBottom: 4 }}>
                            {fileData.tags?.map(tag => (
                              <Tag key={tag} size="small">{tag}</Tag>
                            ))}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {fileData.uploadedBy} · {fileData.uploadedTime}
                            {fileData.size && ` · ${(fileData.size / 1024 / 1024).toFixed(2)} MB`}
                          </div>
                        </div>
                      </div>
                      <Space>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => handlePreviewFile(fileData)}
                        >
                          预览
                        </Button>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => downloadFile(fileData)}
                        >
                          下载
                        </Button>
                        {isEditable(selectedExecution) && !isLegacy && (
                          <Button
                            size="small"
                            type="link"
                            danger
                            onClick={() => deleteMediaFile(selectedExecution.id, fileData.id)}
                          >
                            删除
                          </Button>
                        )}
                      </Space>
                    </div>
                  </Card>
                );
              }) :
              // 兼容旧格式
              selectedExecution.mediaFiles?.map(file => (
                <Tag key={file} icon={file.includes('视频') || file.includes('.mp4') ? <PlaySquareOutlined /> : <FileImageOutlined />}
                     style={{ margin: '4px', cursor: 'pointer' }}
                     onClick={() => message.info(`查看文件: ${file}`)}>
                  {file}
                </Tag>
              ))
            }

            {(!selectedExecution.mediaFiles || selectedExecution.mediaFiles.length === 0) && (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无相关文件
              </div>
            )}
          </div>

          <Divider>审核信息</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="报告人">{selectedExecution.reportedBy}</Descriptions.Item>
            <Descriptions.Item label="审核人">{selectedExecution.reviewedBy}</Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag color={selectedExecution.status === 'reviewed' ? 'green' : 'orange'}>
                {selectedExecution.status === 'reviewed' ? '已审核' : '待审核'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : null}
    </Modal>
  );

  // 渲染执行方案弹窗
  const renderExecutePlanModal = () => (
    <Modal
      title={`🚀 执行救援方案 - ${selectedPlanForExecution?.name || ''}`}
      open={executePlanModalVisible}
      onCancel={() => {
        setExecutePlanModalVisible(false);
        setSelectedPlanForExecution(null);
        executePlanForm.resetFields();
      }}
      width={1200}
      centered
      bodyStyle={{
        padding: 0,
        maxHeight: '70vh',
        overflow: 'hidden'
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          setExecutePlanModalVisible(false);
          setSelectedPlanForExecution(null);
          executePlanForm.resetFields();
        }}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleExecutePlanSubmit}>
          开始执行
        </Button>
      ]}
    >
      {selectedPlanForExecution && (
        <div style={{ padding: '24px' }}>
          <Tabs
            defaultActiveKey="details"
            style={{ height: '60vh' }}
            items={[
              {
                key: 'details',
                label: '📋 方案详情',
                children: (
                  <div style={{
                    height: '50vh',
                    overflowY: 'auto',
                    paddingRight: '8px'
                  }}>
                {/* 基本信息 */}
                <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="方案名称">{selectedPlanForExecution.name}</Descriptions.Item>
                  <Descriptions.Item label="救援场景">
                    <Tag color="blue">
                      {selectedPlanForExecution.scenario === 'offshore' ? '离岸救援' :
                       selectedPlanForExecution.scenario === 'rapid_current' ? '急流救援' :
                       selectedPlanForExecution.scenario === 'night' ? '夜间救援' :
                       selectedPlanForExecution.scenario === 'deep_water' ? '深水救援' : selectedPlanForExecution.scenario}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="难度等级">
                    <Tag color={selectedPlanForExecution.difficulty === 'easy' ? 'green' : selectedPlanForExecution.difficulty === 'medium' ? 'orange' : 'red'}>
                      {selectedPlanForExecution.difficulty === 'easy' ? '简单' : selectedPlanForExecution.difficulty === 'medium' ? '中等' : '困难'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="成功率">
                    <Progress percent={selectedPlanForExecution.successRate} size="small" />
                  </Descriptions.Item>
                  <Descriptions.Item label="预计用时">
                    <span style={{
                      color: calculateAverageExecutionTime(selectedPlanForExecution.id) === '暂无数据' ? '#999' : '#333',
                      fontStyle: calculateAverageExecutionTime(selectedPlanForExecution.id) === '暂无数据' ? 'italic' : 'normal'
                    }}>
                      {calculateAverageExecutionTime(selectedPlanForExecution.id)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="执行次数">{selectedPlanForExecution.executionCount}次</Descriptions.Item>
                </Descriptions>

                {/* 方案描述 */}
                <Card title="方案描述" size="small" style={{ marginBottom: 16 }}>
                  <p style={{ margin: 0, color: '#666' }}>{selectedPlanForExecution.description}</p>
                </Card>

                {/* 执行步骤详情 */}
                <Card title="执行步骤详情" size="small" style={{ marginBottom: 16 }}>
                  {selectedPlanForExecution.steps?.map((step, index) => (
                    <Card key={step.id} size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div>
                          <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                          <span style={{ marginLeft: 8, fontWeight: 'bold', fontSize: '16px' }}>{step.title}</span>
                        </div>
                        <Tag color="blue">{step.duration}</Tag>
                      </div>
                      <p style={{ margin: '8px 0', color: '#666', lineHeight: '1.6' }}>{step.content}</p>
                      <div>
                        <Text strong>所需设备：</Text>
                        {step.equipment?.map(eq => (
                          <Tag key={eq} size="small" style={{ margin: '2px' }}>{eq}</Tag>
                        ))}
                      </div>
                    </Card>
                  ))}
                </Card>

                {/* 人员配置要求 */}
                <Card title="人员配置要求" size="small" style={{ marginBottom: 16 }}>
                  <Table
                    columns={[
                      { title: '角色', dataIndex: 'role', key: 'role', width: 120 },
                      { title: '人数', dataIndex: 'count', key: 'count', width: 80, align: 'center' },
                      {
                        title: '技能要求',
                        dataIndex: 'skills',
                        key: 'skills',
                        render: (skills) => skills?.map(skill => <Tag key={skill} size="small" color="cyan">{skill}</Tag>)
                      }
                    ]}
                    dataSource={selectedPlanForExecution.requiredPersonnel}
                    pagination={false}
                    size="small"
                  />
                </Card>

                {/* 环境参数要求 */}
                <Card title="环境参数要求" size="small">
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="水深要求">{selectedPlanForExecution.environmentParams?.waterDepth}</Descriptions.Item>
                    <Descriptions.Item label="流速要求">{selectedPlanForExecution.environmentParams?.currentSpeed}</Descriptions.Item>
                    <Descriptions.Item label="能见度要求">{selectedPlanForExecution.environmentParams?.visibility}</Descriptions.Item>
                    <Descriptions.Item label="浪高限制">{selectedPlanForExecution.environmentParams?.waveHeight}</Descriptions.Item>
                    <Descriptions.Item label="适用天气" span={2}>
                      {selectedPlanForExecution.environmentParams?.weather?.map(w => <Tag key={w} color="green">{w}</Tag>)}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )
          },
          {
            key: 'execution',
            label: '⚙️ 执行配置',
            children: (
              <div style={{
                height: '50vh',
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                <Alert
                  message="方案执行准备"
                  description={`即将执行救援方案"${selectedPlanForExecution.name}"，请填写执行环境和人员信息。`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form
                  form={executePlanForm}
                  layout="vertical"
                  initialValues={{
                    participants: []
                  }}
                >
                  <Divider>执行环境信息</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="location" label="执行地点" rules={[{ required: true, message: '请输入执行地点' }]}>
                        <Input placeholder="请输入具体执行地点" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="weather" label="天气条件" rules={[{ required: true, message: '请输入天气条件' }]}>
                        <Input placeholder="如：晴天，微风" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="waterConditions" label="水域条件" rules={[{ required: true, message: '请输入水域条件' }]}>
                    <Input placeholder="如：水深2米，流速0.3m/s" />
                  </Form.Item>

                  <Divider>救援队伍信息</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="rescueTeamId"
                        label="救援队伍"
                        rules={[
                          { required: true, message: '请选择救援队伍' },
                          {
                            validator: (_, value) => {
                              if (value) {
                                const validation = validateRescueTeam(value);
                                if (!validation.valid) {
                                  return Promise.reject(new Error(validation.message));
                                }
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                  <Select
                    placeholder="请选择救援队伍"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleRescueTeamChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {getAvailableRescueTeams().map(team => (
                      <Option
                        key={team.id}
                        value={team.id}
                        disabled={!team.isAvailable}
                        className="rescue-team-option"
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          width: '100%',
                          padding: '4px 0',
                          minHeight: '40px'
                        }}>
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '32px'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: '#333',
                              lineHeight: '20px',
                              marginBottom: '2px'
                            }}>
                              {team.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#666',
                              lineHeight: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span>队长：{team.leaderName}</span>
                              <span>|</span>
                              <span>人员：{team.memberCount}人</span>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '32px',
                            marginLeft: '12px'
                          }}>
                            <Tag
                              color={
                                team.status === '值班中' ? 'green' :
                                team.status === '待命' ? 'blue' :
                                team.status === '训练中' ? 'orange' : 'red'
                              }
                              size="small"
                              style={{
                                margin: 0,
                                fontSize: '11px',
                                lineHeight: '18px',
                                padding: '0 6px',
                                borderRadius: '3px'
                              }}
                            >
                              {team.status}
                            </Tag>
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {/* 隐藏字段用于存储队伍名称 */}
                <Form.Item name="rescueTeam" style={{ display: 'none' }}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="teamLeader" label="队长/指挥" rules={[{ required: true, message: '请输入队长姓名' }]}>
                  <Input
                    placeholder="选择队伍后自动填充队长姓名"
                    suffix={
                      <Tooltip title="选择救援队伍后会自动填充对应的队长姓名">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.rescueTeamId !== currentValues.rescueTeamId
              }
            >
              {({ getFieldValue }) => {
                const selectedTeamId = getFieldValue('rescueTeamId');
                const teamMembers = selectedTeamId ?
                  allMembers.filter(member => member.teamId === selectedTeamId) : [];

                return (
                  <Form.Item
                    name="participants"
                    label="参与人员"
                    tooltip="从选定的救援队伍中选择参与救援的人员，也可以手动输入其他人员"
                    rules={[
                      {
                        required: true,
                        type: 'array',
                        min: 1,
                        message: '请选择参与救援的人员'
                      }
                    ]}
                  >
                    <Select
                      mode="tags"
                      placeholder={selectedTeamId ? "选择队员或手动输入" : "请先选择救援队伍"}
                      showSearch
                      optionFilterProp="children"
                      disabled={!selectedTeamId}
                      notFoundContent={selectedTeamId ? "没有找到匹配的队员，可以手动输入" : "请先选择救援队伍"}
                      allowClear
                      maxTagCount="responsive"
                      onChange={(value) => {
                        console.log('参与人员选择变化:', value);
                      }}
                      tagRender={(props) => {
                        const { label, value, closable, onClose } = props;
                        return (
                          <Tag
                            color="blue"
                            closable={closable}
                            onClose={onClose}
                            style={{ margin: '2px' }}
                          >
                            {label}
                          </Tag>
                        );
                      }}
                    >
                      {teamMembers.map(member => (
                        <Option
                          key={member.id}
                          value={member.name}
                          className="team-member-option"
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '2px 0',
                            minHeight: '32px'
                          }}>
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#333'
                            }}>
                              {member.name}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginLeft: '8px'
                            }}>
                              <Tag
                                size="small"
                                color="blue"
                                style={{
                                  margin: 0,
                                  fontSize: '11px',
                                  lineHeight: '16px',
                                  padding: '0 4px',
                                  borderRadius: '2px'
                                }}
                              >
                                {member.position}
                              </Tag>
                              {member.certifications && member.certifications.length > 0 && (
                                <Tag
                                  size="small"
                                  color="green"
                                  style={{
                                    margin: 0,
                                    fontSize: '11px',
                                    lineHeight: '16px',
                                    padding: '0 4px',
                                    borderRadius: '2px'
                                  }}
                                >
                                  {member.certifications[0]}
                                  {member.certifications.length > 1 && `+${member.certifications.length - 1}`}
                                </Tag>
                              )}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>

            {/* 队伍信息展示 */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.rescueTeamId !== currentValues.rescueTeamId
              }
            >
              {({ getFieldValue }) => {
                const selectedTeamId = getFieldValue('rescueTeamId');
                const selectedTeam = selectedTeamId ?
                  rescueTeamsData.find(team => team.id === selectedTeamId) : null;

                if (selectedTeam) {
                  const teamMembers = allMembers.filter(member => member.teamId === selectedTeamId);
                  const validation = validateRescueTeam(selectedTeamId);

                  return (
                    <Alert
                      message={`队伍信息：${selectedTeam.name}`}
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <strong>基本信息：</strong>
                            状态：<Tag color={selectedTeam.status === '值班中' ? 'green' : 'blue'}>{selectedTeam.status}</Tag>
                            人员：{teamMembers.length}人 |
                            位置：{selectedTeam.location} |
                            响应时间：{selectedTeam.responseTime}分钟
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <strong>专业技能：</strong>
                            {selectedTeam.specialties?.map(skill => (
                              <Tag key={skill} size="small" color="cyan">{skill}</Tag>
                            ))}
                          </div>
                          <div>
                            <strong>可用性检查：</strong>
                            <Tag color={validation.valid ? 'green' : 'red'}>
                              {validation.message}
                            </Tag>
                          </div>
                        </div>
                      }
                      type={validation.valid ? 'success' : 'warning'}
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  );
                }
                return null;
              }}
            </Form.Item>

            <Divider>落水者信息</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="victimAge" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
                  <InputNumber min={1} max={120} placeholder="年龄" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="victimGender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                  <Select placeholder="请选择性别">
                    <Option value="男">男</Option>
                    <Option value="女">女</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="victimCondition" label="当前状态" rules={[{ required: true, message: '请输入当前状态' }]}>
                  <Select placeholder="请选择当前状态">
                    <Option value="意识清醒">意识清醒</Option>
                    <Option value="意识模糊">意识模糊</Option>
                    <Option value="昏迷">昏迷</Option>
                    <Option value="体力不支">体力不支</Option>
                    <Option value="受伤">受伤</Option>
                  </Select>
                </Form.Item>
              </Col>
                    </Row>
                    <Form.Item name="victimCause" label="落水原因" rules={[{ required: true, message: '请输入落水原因' }]}>
                      <Input placeholder="如：意外落水、游泳时被急流冲走等" />
                    </Form.Item>
                  </Form>

                  <Alert
                    message="执行提醒"
                    description="点击'开始执行'后将创建执行记录，可在'方案执行记录'标签页中查看和更新执行进度。"
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </div>
              )
            }
          ]} />
        </div>
      )}
    </Modal>
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
      
      {/* 船型优先级配置弹窗 */}
      {renderPriorityModal()}

      {/* 队员管理弹窗 */}
      {renderMemberModal()}

      {/* 设备申领弹窗 */}
      {renderEquipmentApplyModal()}

      {/* 出入库弹窗 */}
      {renderStockInOutModal()}

      {/* 统计报表弹窗 */}
      {renderStatisticsModal()}

      {/* 救援方案弹窗 */}
      {renderPlanModal()}

      {/* 应急手册弹窗 */}
      {renderManualModal()}

      {/* 执行记录弹窗 */}
      {renderExecutionRecordModal()}

      {/* 执行方案弹窗 */}
      {renderExecutePlanModal()}

      {/* 文件预览模态框 */}
      <Modal
        title={previewFileModal.title}
        open={previewFileModal.visible}
        onCancel={() => setPreviewFileModal({ visible: false, type: '', src: '', title: '' })}
        footer={null}
        width={800}
        centered
      >
        {previewFileModal.type === 'image' && (
          <img
            src={previewFileModal.src}
            alt={previewFileModal.title}
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        )}
        {previewFileModal.type === 'video' && (
          <video
            src={previewFileModal.src}
            controls
            style={{ width: '100%', maxHeight: '500px' }}
          >
            您的浏览器不支持视频播放
          </video>
        )}
      </Modal>

      {/* 智能匹配弹窗 */}
      {renderSmartMatchModal()}
    </div>
  );
};

export default Dashboard;
