import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, message, Tooltip } from 'antd';
import { EnvironmentOutlined, AimOutlined, ReloadOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const MapSelector = ({
  latitude,
  longitude,
  onLocationChange,
  height = 400,
  disabled = false,
  showTitle = true,
  showControls = true
}) => {
  const mapRef = useRef(null);
  const [selectedPosition, setSelectedPosition] = useState(() => {
    // 安全地解析初始坐标
    const initLat = latitude && latitude !== '' ? parseFloat(latitude) : 36.0986;
    const initLng = longitude && longitude !== '' ? parseFloat(longitude) : 120.3719;

    return {
      lat: !isNaN(initLat) ? initLat : 36.0986, // 青岛港默认坐标
      lng: !isNaN(initLng) ? initLng : 120.3719
    };
  });
  const [isDragging, setIsDragging] = useState(false);

  // 当外部传入的经纬度变化时，更新地图标记
  useEffect(() => {
    if (latitude && longitude && latitude !== '' && longitude !== '') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // 确保解析后的值是有效数字
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedPosition({
          lat: lat,
          lng: lng
        });
      }
    }
  }, [latitude, longitude]);

  // 处理地图点击事件
  const handleMapClick = (event) => {
    if (disabled) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 将像素坐标转换为经纬度（简化计算）
    // 这里使用青岛港周边区域的坐标范围
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    // 青岛港周边区域：纬度 35.9-36.2，经度 120.2-120.5
    const minLat = 35.9;
    const maxLat = 36.2;
    const minLng = 120.2;
    const maxLng = 120.5;
    
    const lat = maxLat - (y / mapHeight) * (maxLat - minLat);
    const lng = minLng + (x / mapWidth) * (maxLng - minLng);
    
    const newPosition = {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    };
    
    setSelectedPosition(newPosition);
    
    // 通知父组件坐标变化
    if (onLocationChange) {
      onLocationChange(newPosition.lat, newPosition.lng);
    }
    
    message.success(`已选择位置：${newPosition.lat}°N, ${newPosition.lng}°E`);
  };

  // 重置到默认位置
  const handleReset = () => {
    const defaultPosition = { lat: 36.0986, lng: 120.3719 };
    setSelectedPosition(defaultPosition);
    if (onLocationChange) {
      onLocationChange(defaultPosition.lat, defaultPosition.lng);
    }
    message.info('已重置到青岛港默认位置');
  };

  // 获取当前位置（模拟GPS定位）
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6))
          };
          setSelectedPosition(newPosition);
          if (onLocationChange) {
            onLocationChange(newPosition.lat, newPosition.lng);
          }
          message.success('已获取当前位置');
        },
        (error) => {
          message.warning('无法获取当前位置，请手动选择');
          console.error('定位失败:', error);
        }
      );
    } else {
      message.warning('浏览器不支持定位功能');
    }
  };

  // 计算标记点在地图上的位置
  const getMarkerPosition = () => {
    const minLat = 35.9;
    const maxLat = 36.2;
    const minLng = 120.2;
    const maxLng = 120.5;

    // 确保坐标值是有效数字
    const lat = (typeof selectedPosition.lat === 'number' && !isNaN(selectedPosition.lat))
      ? selectedPosition.lat
      : 36.0986;
    const lng = (typeof selectedPosition.lng === 'number' && !isNaN(selectedPosition.lng))
      ? selectedPosition.lng
      : 120.3719;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    // 确保位置在合理范围内
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    return { x: `${clampedX}%`, y: `${clampedY}%` };
  };

  const markerPosition = getMarkerPosition();

  return (
    <Card
      title={showTitle ? "📍 地图选点" : false}
      size="small"
      extra={
        showControls ? (
          <Space>
            <Tooltip title="获取当前位置">
              <Button
                icon={<AimOutlined />}
                size="small"
                onClick={handleGetCurrentLocation}
                disabled={disabled}
              />
            </Tooltip>
            <Tooltip title="重置到默认位置">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                onClick={handleReset}
                disabled={disabled}
              />
            </Tooltip>
          </Space>
        ) : null
      }
    >
      <div className={styles.mapContainer}>
        <div 
          ref={mapRef}
          className={`${styles.mapArea} ${disabled ? styles.disabled : ''}`}
          style={{ height: height }}
          onClick={handleMapClick}
        >
          {/* 地图背景 */}
          <div className={styles.mapBackground}>
            <div className={styles.gridLines}></div>
            <div className={styles.coastline}></div>
            <div className={styles.harbor}></div>
          </div>
          
          {/* 位置标记 */}
          <div 
            className={styles.marker}
            style={{
              left: markerPosition.x,
              top: markerPosition.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <EnvironmentOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
          </div>
          
          {/* 坐标显示 */}
          <div className={styles.coordinateDisplay}>
            <span>📍 {
              (typeof selectedPosition.lat === 'number' && !isNaN(selectedPosition.lat))
                ? selectedPosition.lat.toFixed(6)
                : '0.000000'
            }°N, {
              (typeof selectedPosition.lng === 'number' && !isNaN(selectedPosition.lng))
                ? selectedPosition.lng.toFixed(6)
                : '0.000000'
            }°E</span>
          </div>
          
          {/* 操作提示 */}
          {!disabled && (
            <div className={styles.clickHint}>
              点击地图选择位置
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MapSelector;
