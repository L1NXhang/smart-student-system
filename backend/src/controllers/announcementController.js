const { Announcement, AnnouncementRead, User } = require('../models')
const { success, error } = require('../utils/response')

exports.getAnnouncements = async (req, res) => {
  try {
    const { type, page = 1, pageSize = 10 } = req.query
    const where = { status: 1 }
    if (type) where.type = type
    const { count, rows } = await Announcement.findAndCountAll({
      where, offset: (page - 1) * pageSize, limit: +pageSize,
      include: [{ model: User, as: 'publisher', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    })
    return success(res, { list: rows, total: count, page: +page, pageSize: +pageSize })
  } catch (e) { return error(res, e.message, 500) }
}

exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [{ model: User, as: 'publisher', attributes: ['name'] }],
    })
    if (!announcement) return error(res, '公告不存在', 404)
    await announcement.increment('view_count')
    return success(res, announcement)
  } catch (e) { return error(res, e.message, 500) }
}

exports.markRead = async (req, res) => {
  try {
    await AnnouncementRead.findOrCreate({
      where: { announcement_id: req.params.id, user_id: req.user.id },
      defaults: { announcement_id: req.params.id, user_id: req.user.id, read_at: new Date() },
    })
    return success(res, null, '已读')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getUnreadCount = async (req, res) => {
  try {
    const total = await Announcement.count({ where: { status: 1 } })
    const read = await AnnouncementRead.count({ where: { user_id: req.user.id } })
    return success(res, { total, read, unread: Math.max(0, total - read) })
  } catch (e) { return error(res, e.message, 500) }
}

// Admin
exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, publisher_id: req.user.id })
    return success(res, announcement, '发布成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id)
    if (!announcement) return error(res, '公告不存在', 404)
    await announcement.update(req.body)
    return success(res, announcement, '更新成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.destroy({ where: { id: req.params.id } })
    return success(res, null, '删除成功')
  } catch (e) { return error(res, e.message, 500) }
}
