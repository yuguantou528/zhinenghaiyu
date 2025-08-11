import React, { useState } from 'react';
import { 
  Descriptions, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Timeline, 
  Image,
  List,
  Avatar,
  Divider,
  Statistic,
  Row,
  Col,
  Card,
  message,
  Upload,
  Input
} from 'antd';
import { 
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SoundOutlined,
  PhoneOutlined,
  DownloadOutlined,
  FileImageOutlined,
  AudioOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import AudioPlayer from '../AudioPlayer';
import styles from './index.module.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const VHFRecordDetail = ({ record, onUpdate, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [processingNote, setProcessingNote] = useState('');

  if (!record) return null;

  // 处理状态更新
  const handleStatusUpdate = async () => {
    if (!processingNote.trim()) {
      message.warning('请输入处理备注');
      return;
    }

    setProcessing(true);
    
    // 模拟API调用
    setTimeout(() => {
      message.success('状态更新成功');
      setProcessing(false);
      onUpdate && onUpdate({
        ...record,
        status: '已处理',
        processingNote,
        updateTime: new Date().toLocaleString()
      });
    }, 1000);
  };

  // 生成处理时间线
  const getTimelineItems = () => {
    const items = [
      {
        color: 'blue',
        dot: <ClockCircleOutlined />,
        children: (
          <div>
            <Text strong>事件触发</Text>
            <br />
            <Text type="secondary">{record.eventTime}</Text>
            <br />
            <Text>{record.triggerEvent}</Text>
          </div>
        )
      },
      {
        color: 'green',
        dot: <SoundOutlined />,
        children: (
          <div>
            <Text strong>VHF播报</Text>
            <br />
            <Text type="secondary">{record.eventTime}</Text>
            <br />
            <Text>播报内容已发送</Text>
          </div>
        )
      }
    ];

    if (record.status === '已处理') {
      items.push({
        color: 'green',
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>处理完成</Text>
            <br />
            <Text type="secondary">{record.updateTime}</Text>
            <br />
            <Text>操作员: {record.operator}</Text>
          </div>
        )
      });
    } else {
      items.push({
        color: 'orange',
        dot: <ExclamationCircleOutlined />,
        children: (
          <div>
            <Text strong>待处理</Text>
            <br />
            <Text type="secondary">需要人工确认处理结果</Text>
          </div>
        )
      });
    }

    return items;
  };

  return (
    <div className={styles.detailContainer}>
      {/* 头部信息 */}
      <div className={styles.detailHeader}>
        <Row gutter={24}>
          <Col span={12}>
            <Card size="small" className={styles.infoCard}>
              <Statistic
                title="触发事件"
                value={record.triggerEvent}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" className={styles.infoCard}>
              <Statistic
                title="处理状态"
                value={record.status}
                prefix={record.status === '已处理' ? 
                  <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                valueStyle={{ 
                  color: record.status === '已处理' ? '#52c41a' : '#faad14' 
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 音频播放器 */}
      <div className={styles.audioSection}>
        <Title level={5}>
          <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          VHF录音回放
        </Title>
        <AudioPlayer
          audioUrl={record.audioFile}
          duration={record.audioDuration}
          onPlay={() => console.log('开始播放:', record.id)}
          onPause={() => console.log('暂停播放:', record.id)}
          onEnded={() => console.log('播放结束:', record.id)}
          showWaveform={true}
        />
      </div>

      <Divider />

      {/* 详细信息 */}
      <Descriptions column={2} bordered className={styles.descriptions}>
        <Descriptions.Item label="事件时间" span={2}>
          <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          {record.eventTime}
        </Descriptions.Item>
        
        <Descriptions.Item label="目标船舶" span={2}>
          <div className={styles.targetInfo}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff', marginRight: 8 }}
            />
            <div>
              <Text strong>{record.targetName}</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>{record.targetType}</Tag>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                MMSI: {record.targetMMSI}
              </Text>
            </div>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="船舶位置" span={2}>
          <EnvironmentOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          {record.position}
        </Descriptions.Item>

        <Descriptions.Item label="播报内容" span={2}>
          <div className={styles.broadcastContent}>
            <SoundOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <Paragraph copyable ellipsis={{ rows: 2, expandable: true }}>
              {record.broadcastContent}
            </Paragraph>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="接收船舶" span={2}>
          <Space wrap>
            {record.receivingShips.map(mmsi => (
              <Tag key={mmsi} icon={<PhoneOutlined />} color="geekblue">
                {mmsi}
              </Tag>
            ))}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="录音时长">
          <AudioOutlined style={{ marginRight: 4 }} />
          {record.audioDuration} 秒
        </Descriptions.Item>

        <Descriptions.Item label="操作员">
          <UserOutlined style={{ marginRight: 4 }} />
          {record.operator}
        </Descriptions.Item>
      </Descriptions>

      {/* 关联文件 */}
      {record.attachments && record.attachments.length > 0 && (
        <>
          <Divider>关联文件</Divider>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={record.attachments}
            renderItem={(file, index) => (
              <List.Item>
                <Card
                  size="small"
                  hoverable
                  cover={
                    file.includes('.jpg') || file.includes('.png') ? (
                      <Image
                        src={`/attachments/${file}`}
                        alt={file}
                        style={{ height: 80, objectFit: 'cover' }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                      />
                    ) : (
                      <div className={styles.fileIcon}>
                        <FileImageOutlined style={{ fontSize: 24 }} />
                      </div>
                    )
                  }
                  actions={[
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<DownloadOutlined />}
                      onClick={() => message.info(`下载文件: ${file}`)}
                    >
                      下载
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={file}
                    description={`文件 ${index + 1}`}
                  />
                </Card>
              </List.Item>
            )}
          />
        </>
      )}

      {/* 处理时间线 */}
      <Divider>处理流程</Divider>
      <Timeline items={getTimelineItems()} />

      {/* 处理操作区域 */}
      {record.status === '未处理' && (
        <>
          <Divider>处理操作</Divider>
          <div className={styles.processingSection}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                placeholder="请输入处理备注..."
                rows={3}
                value={processingNote}
                onChange={(e) => setProcessingNote(e.target.value)}
                showCount
                maxLength={500}
              />
              <Space>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  loading={processing}
                  onClick={handleStatusUpdate}
                >
                  标记已处理
                </Button>
                <Upload>
                  <Button icon={<DownloadOutlined />}>
                    上传处置凭证
                  </Button>
                </Upload>
              </Space>
            </Space>
          </div>
        </>
      )}

      {/* 已处理记录的备注显示 */}
      {record.status === '已处理' && record.processingNote && (
        <>
          <Divider>处理备注</Divider>
          <div className={styles.processedNote}>
            <EditOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            <Text>{record.processingNote}</Text>
          </div>
        </>
      )}
    </div>
  );
};

export default VHFRecordDetail; 