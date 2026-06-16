const { Feedback, User, StudentInfo } = require('../models')
const { success, error } = require('../utils/response')
const { getCachedStudentInfo } = require('../utils/getStudentInfo')

exports.submitFeedback = async (req, res) => {
  try {
    const student = await getCachedStudentInfo(req)
    if (!student) return error(res, '学生信息不存在', 404)
    const feedback = await Feedback.create({
      student_id: student.id,
      title: req.body.title,
      content: req.body.content,
      feedback_type: req.body.feedbackType || req.body.feedback_type || 'other',
      images: req.body.images ? JSON.stringify(req.body.images) : null,
    })
    return success(res, feedback, '反馈成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getMyFeedbacks = async (req, res) => {
  try {
    const student = await getCachedStudentInfo(req)
    if (!student) return error(res, '学生信息不存在', 404)
    const list = await Feedback.findAll({ where: { student_id: student.id }, order: [['created_at', 'DESC']] })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}

// Admin
exports.getFeedbackList = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query
    const where = {}
    if (status) where.status = status
    const { count, rows } = await Feedback.findAndCountAll({
      where, offset: (page - 1) * pageSize, limit: +pageSize,
      include: [{ model: StudentInfo, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'username'] }] }],
      order: [['created_at', 'DESC']],
    })
    return success(res, { list: rows, total: count, page: +page, pageSize: +pageSize })
  } catch (e) { return error(res, e.message, 500) }
}

exports.replyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id)
    if (!feedback) return error(res, '反馈不存在', 404)
    await feedback.update({ reply: req.body.reply, replier_id: req.user.id, status: 'replied', replied_at: new Date() })
    return success(res, feedback, '回复成功')
  } catch (e) { return error(res, e.message, 500) }
}
