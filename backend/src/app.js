const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const { error } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/auth', authRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '服务正常运行', data: null });
});

// 404 处理
app.use((req, res) => {
  error(res, '接口不存在', 404);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  error(res, err.message || '服务器内部错误', 500);
});

// 数据库连接并启动服务器
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步模型（开发环境使用，生产环境建议用迁移）
    // await sequelize.sync({ alter: true });
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`API 地址: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
};

startServer();
