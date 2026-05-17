const { ChatMessage, User, sequelize } = require('../models')
const { success, error } = require('../utils/response')

exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const currentUserRole = req.user.role

    let contacts = []

    if (currentUserRole === 'admin') {
      // Admins see all non-admin users with avatar from student_info
      const [rows] = await sequelize.query(
        `SELECT u.id, u.username, u.name, u.role, u.status,
                COALESCE(si.photo, '') as avatar,
                (SELECT COUNT(*) FROM chat_messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count,
                (SELECT content FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time
         FROM users u
         LEFT JOIN student_info si ON u.id = si.user_id
         WHERE u.id != ? AND u.role = 'student'
         ORDER BY last_message_time DESC`,
        { replacements: [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId] }
      )
      contacts = rows
    } else {
      // Students see all admins (school staff)
      const [rows] = await sequelize.query(
        `SELECT u.id, u.username, u.name, u.role, u.status,
                COALESCE(si.photo, '') as avatar,
                (SELECT COUNT(*) FROM chat_messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count,
                (SELECT content FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time
         FROM users u
         LEFT JOIN student_info si ON u.id = si.user_id
         WHERE u.id != ? AND u.role = 'admin'
         ORDER BY last_message_time DESC`,
        { replacements: [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId] }
      )
      contacts = rows
    }

    return success(res, { contacts })
  } catch (err) {
    console.error('getContacts error:', err)
    return error(res, '获取联系人失败', 500)
  }
}

exports.getMessages = async (req, res) => {
  try {
    const { beforeId, limit = 20 } = req.query
    const where = {
      [require('sequelize').Op.or]: [
        { sender_id: req.user.id, receiver_id: +req.params.contactId },
        { sender_id: +req.params.contactId, receiver_id: req.user.id },
      ],
    }
    if (beforeId) where.id = { [require('sequelize').Op.lt]: +beforeId }
    const messages = await ChatMessage.findAll({
      where, order: [['created_at', 'DESC']], limit: +limit + 1,
    })
    const hasMore = messages.length > +limit
    if (hasMore) messages.pop()
    await ChatMessage.update({ is_read: 1, read_at: new Date() }, {
      where: { sender_id: +req.params.contactId, receiver_id: req.user.id, is_read: 0 },
    })
    return success(res, { messages: messages.reverse(), hasMore })
  } catch (e) { return error(res, e.message, 500) }
}

exports.getUnreadCounts = async (userId) => {
  const counts = await ChatMessage.findAll({
    attributes: ['sender_id', [require('sequelize').fn('COUNT', '*'), 'count']],
    where: { receiver_id: userId, is_read: 0 },
    group: ['sender_id'],
  })
  return counts.reduce((acc, c) => { acc[c.sender_id] = c.get('count'); return acc }, {})
}

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return error(res, '请选择文件', 400)
    const url = `/uploads/chat/${req.file.filename}`
    return success(res, {
      url,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
    }, '上传成功')
  } catch (e) {
    return error(res, e.message, 500)
  }
}
