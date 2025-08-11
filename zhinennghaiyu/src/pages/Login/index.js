import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const navigate = useNavigate();

  // 生成验证码
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // 验证用户名和密码
      if (values.username !== 'admin' || values.password !== '123456') {
        message.error('用户名或密码错误！');
        setLoading(false);
        return;
      }

      // 验证验证码
      if (values.captcha.toLowerCase() !== captcha.toLowerCase()) {
        message.error('验证码错误！');
        generateCaptcha(); // 重新生成验证码
        form.setFieldsValue({ captcha: '' });
        setLoading(false);
        return;
      }

      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 保存登录状态
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userInfo', JSON.stringify({
        username: values.username,
        name: '管理员',
        avatar: ''
      }));

      message.success('登录成功！');
      navigate('/dashboard');
    } catch (error) {
      message.error('登录失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaClick = () => {
    generateCaptcha();
    form.setFieldsValue({ captcha: '' });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <Card className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.title}>管理系统原型</h1>
            <p className={styles.subtitle}>欢迎登录管理后台</p>
          </div>
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名！' },
                { min: 3, message: '用户名至少3个字符！' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名 (admin)" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少6个字符！' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码 (123456)" 
              />
            </Form.Item>

            <Form.Item
              name="captcha"
              rules={[
                { required: true, message: '请输入验证码！' },
                { len: 4, message: '验证码为4位字符！' }
              ]}
            >
              <div className={styles.captchaContainer}>
                <Input 
                  prefix={<SafetyOutlined />} 
                  placeholder="验证码" 
                  maxLength={4}
                />
                <div 
                  className={styles.captchaCode}
                  onClick={handleCaptchaClick}
                  title="点击刷新验证码"
                >
                  {captcha}
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className={styles.loginButton}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.loginTips}>
            <p>演示账号：admin / 123456</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
