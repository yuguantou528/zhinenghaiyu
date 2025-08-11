import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card, Row, Col, Table, Button, Space, Tag, message,
  Select, Input, Form, Switch, Slider, DatePicker,
  Radio, Checkbox, Divider, Progress, Badge, Tooltip,
  Modal, Upload, Spin, InputNumber, Alert, Typography,
  Dropdown, Tabs, Descriptions, Rate, Timeline, Statistic,
  Layout, Menu
} from 'antd';

const { Header, Sider, Content } = Layout;
const { TextArea, Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

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
  SettingOutlined,
  RadarChartOutlined,
  DashboardOutlined,
  MonitorOutlined,
  BellOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

// 主要功能组件
const RealTimeMonitor = () => (
  <Card title="实时监控大屏" style={{ marginBottom: 16 }}>
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Statistic title="在线船舶" value={156} prefix={<TeamOutlined />} />
      </Col>
      <Col span={8}>
        <Statistic title="预警事件" value={23} prefix={<BellOutlined />} />
      </Col>
      <Col span={8}>
        <Statistic title="设备在线率" value={98.5} suffix="%" prefix={<MonitorOutlined />} />
      </Col>
    </Row>
    <div style={{ height: 300, background: '#f0f2f5', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Text type="secondary">电子地图区域 - 实时船舶位置显示</Text>
    </div>
  </Card>
);

const CCTVMonitor = () => (
  <Card title="CCTV 智能监控" style={{ marginBottom: 16 }}>
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <div style={{ height: 200, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white' }}>监控画面 1</Text>
        </div>
      </Col>
      <Col span={12}>
        <div style={{ height: 200, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white' }}>监控画面 2</Text>
        </div>
      </Col>
    </Row>
    <Space style={{ marginTop: 16 }}>
      <Button icon={<VideoCameraOutlined />}>截图</Button>
      <Button icon={<VideoCameraOutlined />}>录像</Button>
      <Button icon={<ControlOutlined />}>云台控制</Button>
    </Space>
  </Card>
);

const AlertSettings = () => (
  <Card title="智能预警设置" style={{ marginBottom: 16 }}>
    <Tabs defaultActiveKey="1" items={[
      {
        key: '1',
        label: '碰撞预警',
        children: (
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="CPA阈值 (海里)">
                  <InputNumber min={0} max={10} step={0.1} defaultValue={0.5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="TCPA阈值 (分钟)">
                  <InputNumber min={0} max={60} defaultValue={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )
      },
      {
        key: '2',
        label: '偏航预警',
        children: (
          <Form layout="vertical">
            <Form.Item label="偏航距离阈值 (海里)">
              <InputNumber min={0} max={5} step={0.1} defaultValue={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="持续时间阈值 (分钟)">
              <InputNumber min={0} max={30} defaultValue={5} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        )
      },
      {
        key: '3',
        label: '围栏告警',
        children: (
          <div>
            <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
              新建围栏
            </Button>
            <Table 
              size="small"
              columns={[
                { title: '围栏名称', dataIndex: 'name' },
                { title: '类型', dataIndex: 'type' },
                { title: '状态', dataIndex: 'status', render: (status) => <Tag color={status === '启用' ? 'green' : 'red'}>{status}</Tag> },
                { title: '操作', render: () => <Space><Button size="small">编辑</Button><Button size="small" danger>删除</Button></Space> }
              ]}
              dataSource={[
                { key: 1, name: '禁航区A', type: '禁航区', status: '启用' },
                { key: 2, name: '通航区B', type: '通航区', status: '启用' }
              ]}
            />
          </div>
        )
      }
    ]} />
  </Card>
);

const WorkRecords = () => (
  <Card title="工作台账" style={{ marginBottom: 16 }}>
    <Tabs defaultActiveKey="1" items={[
      {
        key: '1',
        label: 'CCTV联动台账',
        children: (
          <Table 
            size="small"
            columns={[
              { title: '时间', dataIndex: 'time' },
              { title: '触发船舶', dataIndex: 'vessel' },
              { title: '联动结果', dataIndex: 'result' },
              { title: '处理状态', dataIndex: 'status', render: (status) => <Tag color={status === '已处理' ? 'green' : 'orange'}>{status}</Tag> }
            ]}
            dataSource={[
              { key: 1, time: '2025-08-11 13:30', vessel: 'MMSI123456', result: '自动跟踪', status: '已处理' },
              { key: 2, time: '2025-08-11 13:25', vessel: 'MMSI789012', result: '截图保存', status: '未处理' }
            ]}
          />
        )
      },
      {
        key: '2',
        label: '进出围栏台账',
        children: (
          <Table 
            size="small"
            columns={[
              { title: '时间', dataIndex: 'time' },
              { title: '船舶MMSI', dataIndex: 'mmsi' },
              { title: '围栏名称', dataIndex: 'fence' },
              { title: '进出状态', dataIndex: 'action' }
            ]}
            dataSource={[
              { key: 1, time: '2025-08-11 13:35', mmsi: 'MMSI345678', fence: '禁航区A', action: '进入' },
              { key: 2, time: '2025-08-11 13:20', mmsi: 'MMSI901234', fence: '通航区B', action: '离开' }
            ]}
          />
        )
      },
      {
        key: '3',
        label: 'VHF播报台账',
        children: (
          <Table 
            size="small"
            columns={[
              { title: '时间', dataIndex: 'time' },
              { title: '播报内容', dataIndex: 'content' },
              { title: '接收船舶', dataIndex: 'receiver' },
              { title: '操作', render: () => <Button size="small">回放</Button> }
            ]}
            dataSource={[
              { key: 1, time: '2025-08-11 13:40', content: '碰撞风险预警', receiver: 'MMSI567890', },
              { key: 2, time: '2025-08-11 13:30', content: '进港通告', receiver: '全体船舶' }
            ]}
          />
        )
      }
    ]} />
  </Card>
);

const DashboardOptimized = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('monitor');

  // 菜单项
  const menuItems = [
    { key: 'monitor', icon: <DashboardOutlined />, label: '实时监控' },
    { key: 'cctv', icon: <VideoCameraOutlined />, label: 'CCTV监控' },
    { key: 'alert', icon: <BellOutlined />, label: '预警设置' },
    { key: 'records', icon: <FileTextOutlined />, label: '工作台账' },
    { key: 'system', icon: <SettingOutlined />, label: '系统管理' }
  ];

  // 渲染当前页面内容
  const renderContent = () => {
    switch (currentPage) {
      case 'monitor':
        return <RealTimeMonitor />;
      case 'cctv':
        return <CCTVMonitor />;
      case 'alert':
        return <AlertSettings />;
      case 'records':
        return <WorkRecords />;
      case 'system':
        return (
          <Card title="系统管理">
            <p>用户权限管理、设备对接、系统参数配置等功能</p>
          </Card>
        );
      default:
        return <RealTimeMonitor />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.3)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <Row justify="space-between" align="middle" style={{ padding: '0 16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Title level={3} style={{ margin: 0 }}>海域智能安全系统</Title>
            <Space>
              <Badge count={5}>
                <BellOutlined style={{ fontSize: 16 }} />
              </Badge>
              <Button type="link" onClick={() => {
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
              }}>
                退出登录
              </Button>
            </Space>
          </Row>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardOptimized;
