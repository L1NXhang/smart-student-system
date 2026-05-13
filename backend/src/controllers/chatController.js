const { ChatMessage, User } = require('../models')
const { success, error } = require('../utils/response')

exports.getContacts = async (req, res) => {
  try {
    const contacts = await User.findAll({
      where: { id: { [require('sequelize').Op.ne]: req.user.id } },
      attributes: ['id', 'name', 'role'],
    })
    const contactList = await Promise.all(contacts.map(async (c) => {
      const unread = await ChatMessage.count({ where: { sender_id: c.id, receiver_id: req.user.id, is_read: 0 } })
      const lastMsg = await ChatMessage.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { sender_id: req.user.id, receiver_id: c.id },
            { sender_id: c.id, receiver_id: req.user.id },
          ],
        },
        order: [['created_at', 'DESC']],
      })
      return {
        id: c.id, name: c.name, role: c.role,
        unreadCount: unread,
        lastMessage: lastMsg ? lastMsg.content : null,
        lastMessageTime: lastMsg ? lastMsg.created_at : null,
        isOnline: false,
      }
    }))
    return success(res, { contacts: contactList })
  } catch (e) { return error(res, e.message, 500) }
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
