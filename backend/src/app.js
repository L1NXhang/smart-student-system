const express = require('express')
const http = require('http')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { sequelize, ChatMessage, User } = require('./models')
const authRoutes = require('./routes/auth')
const studentRoutes = require('./routes/student')
const scholarshipRoutes = require('./routes/scholarship')
const academicRoutes = require('./routes/academic')
const careerRoutes = require('./routes/career')
const safetyRoutes = require('./routes/safety')
const chatRoutes = require('./routes/chat')
const announcementRoutes = require('./routes/announcement')
const feedbackRoutes = require('./routes/feedback')
const eventRoutes = require('./routes/event')
const uploadRoutes = require('./routes/upload')
const adminRoutes = require('./routes/admin')
const { error } = require('./utils/response')

// JWT 密钥校验
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET 未配置，请检查 .env 文件')
  process.exit(1)
}

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

// ====== 安全中间件 ======
app.use(helmet({
  contentSecurityPolicy: false, // SPA 需要内联脚本
  crossOriginEmbedderPolicy: false,
}))

// 全局限流
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null },
})
app.use(globalLimiter)

// 登录接口限流：防止暴力破解
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '登录尝试过多，请15分钟后再试', data: null },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://124.223.0.187', 'https://zhangl1n.site']
    : '*',
  credentials: true,
}))

app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/scholarship', scholarshipRoutes)
app.use('/api/academic', academicRoutes)
app.use('/api/career', careerRoutes)
app.use('/api/safety', safetyRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/feedbacks', feedbackRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '服务正常运行', data: null })
})

// 生产环境：托管前端静态文件
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next()
    })
  })
}

app.use((req, res) => {
  error(res, '接口不存在', 404)
})

// 全局错误处理：不泄露内部信息
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  const isDev = process.env.NODE_ENV !== 'production'
  error(res, isDev ? err.message : '服务器内部错误', 500)
})

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['http://124.223.0.187', 'https://zhangl1n.site']
      : '*',
    methods: ['GET', 'POST'],
  },
})

const onlineUsers = new Map()

io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('未提供认证令牌'))
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded
    next()
  } catch (e) {
    next(new Error('令牌无效'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.user.id
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set())
  }
  onlineUsers.get(userId).add(socket.id)

  if (onlineUsers.get(userId).size === 1) {
    io.emit('user:online', { userId })
  }

  socket.on('chat:message', async (data) => {
    try {
      const msgData = {
        sender_id: userId,
        receiver_id: data.receiverId,
        content: data.messageType === 'text' ? data.content : (data.fileName || data.fileUrl || ''),
        message_type: data.messageType || 'text',
        file_url: data.fileUrl || null,
        file_name: data.fileName || null,
        file_size: data.fileSize || null,
      }
      const msg = await ChatMessage.create(msgData)

      const payload = {
        id: msg.id,
        senderId: userId,
        receiverId: data.receiverId,
        content: msgData.content,
        messageType: msgData.message_type,
        fileUrl: msgData.file_url,
        fileName: msgData.file_name,
        fileSize: msgData.file_size,
        createdAt: msg.created_at,
      }

      const receiverSockets = onlineUsers.get(data.receiverId)
      if (receiverSockets) {
        receiverSockets.forEach((sid) => {
          io.to(sid).emit('chat:message', payload)
        })
      }

      const senderSockets = onlineUsers.get(userId)
      if (senderSockets) {
        senderSockets.forEach((sid) => {
          io.to(sid).emit('chat:message', payload)
        })
      }
    } catch (e) {
      socket.emit('chat:error', { message: '消息发送失败' })
    }
  })

  socket.on('chat:typing', (data) => {
    const receiverSockets = onlineUsers.get(data.receiverId)
    if (receiverSockets) {
      receiverSockets.forEach((sid) => {
        io.to(sid).emit('chat:typing', { senderId: userId })
      })
    }
  })

  socket.on('chat:read', async (data) => {
    if (data.messageIds && data.messageIds.length) {
      await ChatMessage.update({ is_read: 1, read_at: new Date() }, { where: { id: data.messageIds } })
    }
  })

  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(userId)
    if (userSockets) {
      userSockets.delete(socket.id)
      if (userSockets.size === 0) {
        onlineUsers.delete(userId)
        io.emit('user:offline', { userId })
      }
    }
  })
})

app.set('io', io)

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`)
      console.log(`API 地址: http://localhost:${PORT}/api`)
    })
  } catch (err) {
    console.error('数据库连接失败:', err)
    process.exit(1)
  }
}

startServer()
