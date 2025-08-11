import React, { useState, useRef, useEffect } from 'react';
import { Button, Progress, Space, Typography, Slider } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  SoundOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import styles from './index.module.css';

const { Text } = Typography;

const AudioPlayer = ({ 
  audioUrl, 
  duration, 
  onPlay, 
  onPause, 
  onEnded,
  autoPlay = false,
  showWaveform = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        handlePlay();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded && onEnded();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, autoPlay, onEnded]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => {
        setIsPlaying(true);
        onPlay && onPlay();
      }).catch(err => {
        console.error('播放失败:', err);
      });
    }
  };

  const handlePause = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      onPause && onPause();
    }
  };

  const handleProgressChange = (value) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (value / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = value / 100;
      setVolume(value);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.audioPlayer}>
      <audio 
        ref={audioRef} 
        src={audioUrl}
        preload="metadata"
      />
      
      <div className={styles.playerControls}>
        <Space align="center" size="large">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={isLoading ? <LoadingOutlined /> : 
                  (isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />)}
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            className={styles.playButton}
          />
          
          <div className={styles.progressContainer}>
            <div className={styles.timeInfo}>
              <Text type="secondary">{formatTime(currentTime)}</Text>
              <Text type="secondary">{formatTime(duration || 0)}</Text>
            </div>
            <Progress
              percent={progress}
              showInfo={false}
              strokeColor={{
                '0%': '#1890ff',
                '100%': '#722ed1',
              }}
              className={styles.progressBar}
            />
            <Slider
              value={progress}
              onChange={handleProgressChange}
              tooltip={{ formatter: null }}
              className={styles.progressSlider}
            />
          </div>
          
          <div className={styles.volumeControl}>
            <SoundOutlined />
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: 80, marginLeft: 8 }}
              tooltip={{ formatter: (value) => `${value}%` }}
            />
          </div>
        </Space>
      </div>

      {showWaveform && (
        <div className={styles.waveform}>
          {/* 这里可以添加音频波形可视化 */}
          <div className={styles.waveformPlaceholder}>
            <Text type="secondary">音频波形显示区域</Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer; 