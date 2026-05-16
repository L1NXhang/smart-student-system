const { ChatMessage, User, sequelize } = require('../models')
const { success, error } = require('../utils/response')

exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const currentUserRole = req.user.role

    let contacts = []

    if (currentUserRole === 'admin') {
      // Admins see all non-admin users
      const [rows] = await sequelize.query(
        `SELECT u.id, u.username, u.name, u.role, u.status,
                (SELECT COUNT(*) FROM chat_messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count,
                (SELECT content FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time
         FROM users u
         WHERE u.id != ? AND u.role != 'admin'
         ORDER BY last_message_time DESC`,
        { replacements: [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId] }
      )
      contacts = rows
    } else {
      // Students see admins and their class teacher
      const [rows] = await sequelize.query(
        `SELECT u.id, u.username, u.name, u.role, u.status,
                (SELECT COUNT(*) FROM chat_messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count,
                (SELECT content FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time
         FROM users u
         WHERE u.id != ? AND (u.role = 'admin' OR u.role = 'teacher')
         ORDER BY last_message_time DESC`,
        { replacements: [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId] }
      )
      contacts = rows
    }

    res.json({ contacts })
  } catch (err) {
    console.error('getContacts error:', err)
    res.status(500).json({ message: '获取联系人失败' })
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
