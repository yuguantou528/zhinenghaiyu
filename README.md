# 管理系统原型基础框架

一个基于 React 18 + Ant Design 5 的现代化B端管理系统基础框架，提供完整的登录认证、导航菜单、页面路由等核心功能。

## ✨ 特性

- 🚀 **现代技术栈**: React 18.2 + Ant Design 5.26.6 + React Router 6.8
- 🎨 **精美UI设计**: 基于 Ant Design 设计语言，界面美观现代
- 📱 **响应式布局**: 支持桌面端和平板端自适应
- 🔐 **完整认证系统**: 登录验证、路由守卫、状态持久化
- 🧭 **智能导航**: 自定义导航栏，支持手风琴模式和Portal弹出菜单
- 📊 **仪表板**: 统计卡片、图表占位区域、数据展示
- 🛠 **开箱即用**: 完整的项目结构，一键启动

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

访问 http://localhost:3010

### 登录信息
- 用户名: `admin`
- 密码: `123456`
- 验证码: 点击刷新

## 📁 项目结构

```
/
├── package.json                    # 项目依赖配置
├── webpack.config.js               # Webpack构建配置
├── README.md                       # 项目说明文档
├── public/
│   └── index.html                  # HTML模板
└── src/
    ├── index.js                    # 应用入口文件
    ├── index.css                   # 全局样式
    ├── App.js                      # 路由配置和守卫
    ├── components/                 # 公共组件
    │   ├── HeaderBar/              # 顶部标题栏
    │   │   ├── index.js
    │   │   └── index.module.css
    │   ├── NavigationBar/          # 侧边导航栏
    │   │   ├── index.js
    │   │   └── index.module.css
    │   └── Breadcrumb/             # 面包屑导航
    │       ├── index.js
    │       └── index.module.css
    └── pages/                      # 页面组件
        ├── Login/                  # 登录页面
        │   ├── index.js
        │   └── index.module.css
        └── Dashboard/              # 仪表板页面
            ├── index.js
            └── index.module.css
```

## 🎯 核心功能

### 登录系统
- ✅ 表单验证（用户名≥3字符，密码≥6字符）
- ✅ 验证码组件（4位随机字符，可点击刷新）
- ✅ 演示账号：admin / 123456
- ✅ 登录状态持久化存储
- ✅ 自动路由跳转

### 导航系统
- ✅ 完全自定义NavigationBar组件（未使用Ant Design Menu）
- ✅ 手风琴模式（点击一级菜单关闭其他展开菜单）
- ✅ Portal弹出菜单（收缩状态下的二级菜单）
- ✅ 收缩/展开功能
- ✅ 路由状态同步

### 布局系统
- ✅ 固定顶部HeaderBar（64px高度）
- ✅ 固定左侧NavigationBar（256px/80px宽度）
- ✅ 自适应主内容区
- ✅ 面包屑导航
- ✅ 响应式设计

### 页面管理
- ✅ 仪表板（统计卡片 + 图表占位）
- ✅ 用户管理（表格列表 + 操作按钮）
- ✅ 角色管理（功能占位）
- ✅ 权限管理（功能占位）

## 🛠 技术栈

- **前端框架**: React 18.2.0
- **UI组件库**: Ant Design 5.26.6
- **路由管理**: React Router 6.8.0
- **图表库**: ECharts（预留集成）
- **样式方案**: CSS Modules
- **构建工具**: Webpack 5.75.0
- **开发服务器**: webpack-dev-server 4.7.4

## 📱 响应式支持

- **桌面端**: ≥1024px（标准布局）
- **平板端**: 768px-1023px（调整间距和字体）
- **移动端**: <768px（隐藏侧边栏，优化布局）

## 🎨 设计规范

### 主题色彩
- **主色调**: #1890ff（Ant Design蓝）
- **背景色**: #f5f5f5（浅灰）
- **卡片背景**: #ffffff（白色）
- **文字颜色**: #262626（深灰）
- **边框颜色**: #d9d9d9（浅灰）

### 布局规范
- **标题栏高度**: 64px
- **导航栏宽度**: 256px（展开）/ 80px（收缩）
- **内容区间距**: 24px（桌面）/ 16px（平板）/ 12px（移动）
- **卡片圆角**: 8px
- **按钮圆角**: 6px

## 🔧 开发指南

### 添加新页面
1. 在 `src/pages/` 下创建新的页面组件
2. 在 `src/App.js` 中添加路由配置
3. 在 `NavigationBar` 中添加菜单项
4. 在 `Breadcrumb` 中添加路由映射

### 自定义样式
- 使用 CSS Modules 避免样式冲突
- 遵循 BEM 命名规范
- 优先使用 Ant Design 的设计token

### 集成图表
项目已预留 ECharts 集成，可在仪表板中替换图表占位区域。

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
# zhinenghaiyu
