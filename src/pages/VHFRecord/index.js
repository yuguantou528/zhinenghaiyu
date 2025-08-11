import React, { useState, useRef } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Modal, 
  Descriptions, 
  message,
  Upload,
  Row,
  Col,
  Divider,
  Typography,
  Progress,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  PlayCircleOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import AudioPlayer from '../../components/AudioPlayer';
import VHFRecordDetail from '../../components/VHFRecordDetail';
import HeaderBar from '../../components/HeaderBar';
import NavigationBar from '../../components/NavigationBar';
import Breadcrumb from '../../components/Breadcrumb';
import styles from './index.module.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const VHFRecord = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  // 处理导航栏收缩/展开
  const handleCollapse = (newCollapsed) => {
    console.log('导航栏收缩状态改变:', newCollapsed);
    setCollapsed(newCollapsed);
  };
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [playingRecord, setPlayingRecord] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchParams, setSearchParams] = useState({
    content: '',
    status: '',
    dateRange: null,
    targetType: ''
  });
  
  const audioRef = useRef(null);

  // 模拟VHF播报台账数据
  const [recordData] = useState([
    {
      id: '1',
      eventTime: '2024-01-15 14:30:25',
      broadcastContent: '船舶 MMSI412536987，您已进入碰撞风险区域，请减速避让',
      triggerEvent: '碰撞预警',
      targetMMSI: '412536987',
      targetType: '商船',
      targetName: '海运之星',
      position: '120.1234°E, 31.2345°N',
      status: '已处理',
      processingStatus: 'completed',
      audioFile: '/audio/vhf_broadcast_1.mp3',
      audioDuration: 15,
      receivingShips: ['412536987', '412536988'],
      operator: '张三',
      processingNote: '船舶已收到警告并调整航向',
      attachments: ['screenshot_1.jpg'],
      createTime: '2024-01-15 14:30:25',
      updateTime: '2024-01-15 14:35:12'
    },
    {
      id: '2',
      eventTime: '2024-01-15 15:45:10',
      broadcastContent: '欢迎进入青岛港，当前通航密度高，请保持VHF16频道守听',
      triggerEvent: '进港通告',
      targetMMSI: '412536989',
      targetType: '货船',
      targetName: '远洋货轮',
      position: '120.3456°E, 31.4567°N',
      status: '未处理',
      processingStatus: 'pending',
      audioFile: '/audio/vhf_broadcast_2.mp3',
      audioDuration: 12,
      receivingShips: ['412536989'],
      operator: '李四',
      processingNote: '',
      attachments: [],
      createTime: '2024-01-15 15:45:10',
      updateTime: '2024-01-15 15:45:10'
    },
    {
      id: '3',
      eventTime: '2024-01-15 16:20:35',
      broadcastContent: '船舶 MMSI412536990，您已偏离预定航线，请核实航向',
      triggerEvent: '偏航预警',
      targetMMSI: '412536990',
      targetType: '军舰',
      targetName: '护卫舰001',
      position: '120.5678°E, 31.6789°N',
      status: '已处理',
      processingStatus: 'completed',
      audioFile: '/audio/vhf_broadcast_3.mp3',
      audioDuration: 18,
      receivingShips: ['412536990'],
      operator: '王五',
      processingNote: '已通过VHF确认船舶收到信息',
      attachments: ['call_record.wav', 'route_map.jpg'],
      createTime: '2024-01-15 16:20:35',
      updateTime: '2024-01-15 16:25:20'
    }
  ]);

  // 播放音频
  const handlePlayAudio = (record) => {
    if (playingRecord && playingRecord.id === record.id && isPlaying) {
      // 暂停当前播放
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // 播放新音频
      setPlayingRecord(record);
      setIsPlaying(true);
      setAudioProgress(0);
      
      // 模拟音频播放进度
      const duration = record.audioDuration * 1000;
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            setPlayingRecord(null);
            return 0;
          }
          return prev + (100 / (duration / 100));
        });
      }, 100);
    }
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  // 搜索过滤
  const handleSearch = () => {
    setLoading(true);
    // 模拟搜索
    setTimeout(() => {
      setLoading(false);
      message.success('搜索完成');
    }, 1000);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      content: '',
      status: '',
      dateRange: null,
      targetType: ''
    });
  };

  // 导出数据
  const handleExport = (format) => {
    message.success(`正在导出${format}格式文件...`);
  };

  // 表格列配置
  const columns = [
    {
      title: '事件时间',
      dataIndex: 'eventTime',
      key: 'eventTime',
      width: 160,
      sorter: true,
      render: (text) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          {text}
        </div>
      )
    },
    {
      title: '播报内容',
      dataIndex: 'broadcastContent',
      key: 'broadcastContent',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <div className={styles.contentCell}>
            <SoundOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: '触发事件',
      dataIndex: 'triggerEvent',
      key: 'triggerEvent',
      width: 120,
      render: (text) => {
        const colorMap = {
          '碰撞预警': 'red',
          '偏航预警': 'orange',
          '进港通告': 'blue',
          '出港通告': 'green'
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      }
    },
    {
      title: '目标船舶',
      key: 'target',
      width: 150,
      render: (_, record) => (
        <div>
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.targetName}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            MMSI: {record.targetMMSI}
          </Text>
        </div>
      )
    },
    {
      title: '船舶类型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 100,
      render: (text) => {
        const colorMap = {
          '军舰': 'red',
          '商船': 'blue',
          '货船': 'green',
          '渔船': 'orange'
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      }
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text, record) => {
        const statusConfig = {
          '已处理': { color: 'success', text: '已处理' },
          '未处理': { color: 'warning', text: '未处理' }
        };
        const config = statusConfig[text] || { color: 'default', text };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={playingRecord?.id === record.id && isPlaying ? 
              <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handlePlayAudio(record)}
          >
            {playingRecord?.id === record.id && isPlaying ? '暂停' : '回放'}
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className={styles.app}>
      <HeaderBar />
      <div className={styles.mainContainer}>
        <NavigationBar collapsed={collapsed} onCollapse={handleCollapse} />
        <div className={`${styles.contentArea} ${collapsed ? styles.collapsed : ''}`}>
          <Breadcrumb />
          <div className={styles.pageContent}>
            <Card>
        <div className={styles.header}>
          <Title level={4}>VHF播报台账</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => handleExport('Excel')}
            >
              导出Excel
            </Button>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => handleExport('PDF')}
            >
              导出PDF
            </Button>
          </Space>
        </div>

        {/* 搜索区域 */}
        <Card size="small" className={styles.searchCard}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Input
                placeholder="播报内容关键词"
                prefix={<SearchOutlined />}
                value={searchParams.content}
                onChange={(e) => setSearchParams({...searchParams, content: e.target.value})}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="处理状态"
                style={{ width: '100%' }}
                value={searchParams.status}
                onChange={(value) => setSearchParams({...searchParams, status: value})}
                allowClear
              >
                <Option value="已处理">已处理</Option>
                <Option value="未处理">未处理</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="船舶类型"
                style={{ width: '100%' }}
                value={searchParams.targetType}
                onChange={(value) => setSearchParams({...searchParams, targetType: value})}
                allowClear
              >
                <Option value="军舰">军舰</Option>
                <Option value="商船">商船</Option>
                <Option value="货船">货船</Option>
                <Option value="渔船">渔船</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始时间', '结束时间']}
                value={searchParams.dateRange}
                onChange={(dates) => setSearchParams({...searchParams, dateRange: dates})}
              />
            </Col>
            <Col span={4}>
              <Space>
                <Button type="primary" onClick={handleSearch} loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 播放进度条 */}
        {playingRecord && (
          <Card size="small" className={styles.playerCard}>
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <div className={styles.playingInfo}>
                  <SoundOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  正在播放: {playingRecord.broadcastContent}
                </div>
                <Progress 
                  percent={audioProgress} 
                  size="small" 
                  status={isPlaying ? "active" : "normal"}
                  format={() => `${Math.round(audioProgress)}%`}
                />
              </Col>
              <Col>
                <Text type="secondary">
                  时长: {playingRecord.audioDuration}秒
                </Text>
              </Col>
            </Row>
          </Card>
        )}

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={recordData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: recordData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="VHF播报详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <VHFRecordDetail 
          record={selectedRecord}
          onUpdate={(updatedRecord) => {
            // 更新记录数据
            console.log('记录已更新:', updatedRecord);
            setSelectedRecord(updatedRecord);
          }}
          onClose={() => setDetailVisible(false)}
        />
      </Modal>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VHFRecord; 