const express = require('express')
const http = require('http')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
require('dotenv').config()

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

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

// Socket.io
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
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
  onlineUsers.set(userId, socket.id)
  io.emit('user:online', { userId })

  socket.on('chat:message', async (data) => {
    const msg = await ChatMessage.create({
      sender_id: userId,
      receiver_id: data.receiverId,
      content: data.content,
    })
    const receiverSocketId = onlineUsers.get(data.receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('chat:message', {
        id: msg.id, senderId: userId, content: data.content, createdAt: msg.created_at,
      })
    }
    socket.emit('chat:message', {
      id: msg.id, senderId: userId, content: data.content, createdAt: msg.created_at,
    })
  })

  socket.on('chat:typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('chat:typing', { senderId: userId })
    }
  })

  socket.on('chat:read', async (data) => {
    if (data.messageIds && data.messageIds.length) {
      await ChatMessage.update({ is_read: 1, read_at: new Date() }, { where: { id: data.messageIds } })
    }
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(userId)
    io.emit('user:offline', { userId })
  })
})

app.set('io', io)

// 中间件
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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

app.use((req, res) => {
  error(res, '接口不存在', 404)
})

app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  error(res, err.message || '服务器内部错误', 500)
})

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
