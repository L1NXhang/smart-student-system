const { Event, EventRegistration, User, StudentInfo } = require('../models')
const { success, error } = require('../utils/response')

exports.getEvents = async (req, res) => {
  try {
    const { eventType, status, page = 1, pageSize = 10 } = req.query
    const where = {}
    if (eventType) where.event_type = eventType
    if (status !== undefined && !isNaN(+status)) where.status = +status
    else where.status = 1
    const { count, rows } = await Event.findAndCountAll({
      where, offset: (page - 1) * pageSize, limit: +pageSize,
      include: [{ model: EventRegistration, as: 'registrations', attributes: ['id'] }],
      order: [['created_at', 'DESC']],
    })
    const list = rows.map((e) => ({ ...e.toJSON(), registrationCount: e.registrations ? e.registrations.length : 0 }))
    return success(res, { list, total: count, page: +page, pageSize: +pageSize })
  } catch (e) { return error(res, e.message, 500) }
}

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'publisher', attributes: ['name'] },
        { model: EventRegistration, as: 'registrations', attributes: ['id'] },
      ],
    })
    if (!event) return error(res, '活动不存在', 404)
    return success(res, { ...event.toJSON(), registrationCount: event.registrations ? event.registrations.length : 0 })
  } catch (e) { return error(res, e.message, 500) }
}

exports.register = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) return error(res, '活动不存在', 404)
    if (event.status !== 1) return error(res, '活动已取消', 5001)
    if (event.deadline && new Date(event.deadline) < new Date()) return error(res, '报名已截止', 5001)
    const registrations = await EventRegistration.count({ where: { event_id: event.id } })
    if (event.quota && registrations >= event.quota) return error(res, '名额已满', 5002)
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const [reg, created] = await EventRegistration.findOrCreate({
      where: { event_id: event.id, student_id: student.id },
      defaults: { event_id: event.id, student_id: student.id, status: 'registered' },
    })
    if (!created) return error(res, '已报名该活动', 5003)
    return success(res, reg, '报名成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.cancelRegistration = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const reg = await EventRegistration.findOne({ where: { event_id: req.params.id, student_id: student.id } })
    if (!reg) return error(res, '未报名', 404)
    await reg.update({ status: 'cancelled' })
    return success(res, null, '已取消')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getMyRegistrations = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const list = await EventRegistration.findAll({
      where: { student_id: student.id },
      include: [{ model: Event, as: 'event', attributes: ['id', 'title', 'event_date', 'location'] }],
      order: [['created_at', 'DESC']],
    })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}

// Admin / Department Head
exports.createEvent = async (req, res) => {
  try {
    // Permission: admin or department head
    const user = req.user
    if (user.role !== 'admin' && user.departmentRole !== 'head') {
      return error(res, '仅管理员和部门部长可以发布活动', 403)
    }

    const event = await Event.create({
      title: req.body.title,
      event_type: req.body.eventType || req.body.event_type || 'other',
      hours_type: req.body.hoursType || req.body.hours_type || null,
      event_date: req.body.eventDate || req.body.event_date,
      location: req.body.location,
      description: req.body.description,
      quota: req.body.quota,
      deadline: req.body.deadline,
      publisher_id: req.user.id,
    })
    return success(res, event, '发布成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) return error(res, '活动不存在', 404)
    await event.update(req.body)
    return success(res, event, '更新成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) return error(res, '活动不存在', 404)
    await event.update({ status: 0 })
    return success(res, null, '已取消')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getEventRegistrations = async (req, res) => {
  try {
    const list = await EventRegistration.findAll({
      where: { event_id: req.params.id },
      include: [{ model: StudentInfo, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'username'] }] }],
    })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}
