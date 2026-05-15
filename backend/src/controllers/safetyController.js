const { LateReturnRecord, LeaveRecord, SafetyExam, SafetyQuestion, SafetyExamRecord, IncidentReport, StudentInfo, User } = require('../models')
const { success, error } = require('../utils/response')

// 晚归登记
exports.submitLateReturn = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const record = await LateReturnRecord.create({
      student_id: student.id,
      return_date: req.body.returnDate || req.body.return_date,
      expected_time: req.body.expectedTime || req.body.expected_time,
      reason: req.body.reason,
    })
    return success(res, record, '提交成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getLateReturnRecords = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const list = await LateReturnRecord.findAll({ where: { student_id: student.id }, order: [['created_at', 'DESC']] })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}

exports.cancelLateReturn = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const record = await LateReturnRecord.findOne({ where: { id: req.params.id, student_id: student.id } })
    if (!record) return error(res, '记录不存在', 404)
    if (record.status !== 'pending') return error(res, '只能取消待审核的记录', 400)
    await record.update({ status: 'cancelled' })
    return success(res, null, '已取消')
  } catch (e) { return error(res, e.message, 500) }
}

// 外出报备
exports.submitLeave = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const record = await LeaveRecord.create({
      student_id: student.id,
      leave_date: req.body.leaveDate || req.body.leave_date,
      destination: req.body.destination,
      reason: req.body.reason,
      expected_return: req.body.expectedReturn || req.body.expected_return,
    })
    return success(res, record, '提交成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getLeaveRecords = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const list = await LeaveRecord.findAll({ where: { student_id: student.id }, order: [['created_at', 'DESC']] })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}

exports.cancelLeave = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const record = await LeaveRecord.findOne({ where: { id: req.params.id, student_id: student.id } })
    if (!record) return error(res, '记录不存在', 404)
    if (record.status !== 'pending') return error(res, '只能取消待审核的记录', 400)
    await record.update({ status: 'cancelled' })
    return success(res, null, '已取消')
  } catch (e) { return error(res, e.message, 500) }
}

// 安全考试列表
exports.getExams = async (req, res) => {
  try {
    const exams = await SafetyExam.findAll({ where: { status: 1 }, order: [['created_at', 'DESC']] })
    return success(res, exams)
  } catch (e) { return error(res, e.message, 500) }
}

exports.getExamQuestions = async (req, res) => {
  try {
    const questions = await SafetyQuestion.findAll({ where: { exam_id: req.params.id }, order: [['sort_order', 'ASC']] })
    return success(res, questions)
  } catch (e) { return error(res, e.message, 500) }
}

exports.submitExam = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const examId = req.params.id
    const existing = await SafetyExamRecord.findOne({ where: { exam_id: examId, student_id: student.id } })
    if (existing) return error(res, '已参加过该考试', 4002)
    const questions = await SafetyQuestion.findAll({ where: { exam_id: examId } })
    let score = 0
    const answers = req.body.answers || {}
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) score += q.score
    })
    const exam = await SafetyExam.findByPk(examId)
    const isPassed = score >= (exam ? exam.pass_score : 60)
    const record = await SafetyExamRecord.create({
      exam_id: examId, student_id: student.id,
      answers: JSON.stringify(answers), score, is_passed: isPassed ? 1 : 0,
      duration: req.body.duration, ip_address: req.ip, submitted_at: new Date(),
    })
    return success(res, {
      score, isPassed: !!isPassed,
      correctCount: questions.filter((q) => answers[q.id] === q.answer).length,
      wrongCount: questions.length - questions.filter((q) => answers[q.id] === q.answer).length,
    }, '提交成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getExamRecord = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const record = await SafetyExamRecord.findOne({ where: { exam_id: req.params.id, student_id: student.id } })
    return success(res, record)
  } catch (e) { return error(res, e.message, 500) }
}

// 异常上报
exports.reportIncident = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const incident = await IncidentReport.create({
      student_id: student.id,
      report_type: req.body.reportType || req.body.report_type,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      contact_phone: req.body.contactPhone || req.body.contact_phone,
      images: req.body.images ? JSON.stringify(req.body.images) : null,
    })
    return success(res, incident, '上报成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getIncidents = async (req, res) => {
  try {
    const student = await StudentInfo.findOne({ where: { user_id: req.user.id } })
    if (!student) return error(res, '学生信息不存在', 404)
    const list = await IncidentReport.findAll({ where: { student_id: student.id }, order: [['created_at', 'DESC']] })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}

// Admin
exports.getLateReturnList = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query
    const where = {}
    if (status) where.status = status
    const { count, rows } = await LateReturnRecord.findAndCountAll({
      where, offset: (page - 1) * pageSize, limit: +pageSize,
      include: [{ model: StudentInfo, as: 'student', attributes: ['id'], include: [{ model: User, as: 'user', attributes: ['name', 'username'] }] }],
      order: [['created_at', 'DESC']],
    })
    return success(res, { list: rows, total: count, page: +page, pageSize: +pageSize })
  } catch (e) { return error(res, e.message, 500) }
}

exports.auditLateReturn = async (req, res) => {
  try {
    const record = await LateReturnRecord.findByPk(req.params.id)
    if (!record) return error(res, '记录不存在', 404)
    await record.update({ status: req.body.status, reviewer_id: req.user.id, review_comment: req.body.reviewComment, reviewed_at: new Date() })
    return success(res, record, '审核完成')
  } catch (e) { return error(res, e.message, 500) }
}

exports.getLeaveList = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query
    const where = {}
    if (status) where.status = status
    const { count, rows } = await LeaveRecord.findAndCountAll({
      where, offset: (page - 1) * pageSize, limit: +pageSize,
      include: [{ model: StudentInfo, as: 'student', attributes: ['id'], include: [{ model: User, as: 'user', attributes: ['name', 'username'] }] }],
      order: [['created_at', 'DESC']],
    })
    return success(res, { list: rows, total: count, page: +page, pageSize: +pageSize })
  } catch (e) { return error(res, e.message, 500) }
}

exports.auditLeave = async (req, res) => {
  try {
    const record = await LeaveRecord.findByPk(req.params.id)
    if (!record) return error(res, '记录不存在', 404)
    await record.update({ status: req.body.status, reviewer_id: req.user.id, review_comment: req.body.reviewComment, reviewed_at: new Date() })
    return success(res, record, '审核完成')
  } catch (e) { return error(res, e.message, 500) }
}

exports.createExam = async (req, res) => {
  try {
    const exam = await SafetyExam.create({ ...req.body, publisher_id: req.user.id })
    return success(res, exam, '创建成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.deleteExam = async (req, res) => {
  try {
    await SafetyExam.destroy({ where: { id: req.params.id } })
    return success(res, null, '删除成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.createQuestion = async (req, res) => {
  try {
    const q = await SafetyQuestion.create(req.body)
    return success(res, q, '添加成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.updateQuestion = async (req, res) => {
  try {
    const q = await SafetyQuestion.findByPk(req.params.id)
    if (!q) return error(res, '题目不存在', 404)
    await q.update(req.body)
    return success(res, q, '更新成功')
  } catch (e) { return error(res, e.message, 500) }
}

exports.deleteQuestion = async (req, res) => {
  try {
    await SafetyQuestion.destroy({ where: { id: req.params.id } })
    return success(res, null, '删除成功')
  } catch (e) { return error(res, e.message, 500) }
}

// 从Excel批量导入题目
exports.importQuestionsFromFile = async (req, res) => {
  try {
    if (!req.file) return error(res, '请上传文件', 400)
    const examId = req.params.id
    const exam = await SafetyExam.findByPk(examId)
    if (!exam) return error(res, '考试不存在', 404)

    const XLSX = require('xlsx')
    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows.length) return error(res, '文件无数据', 400)

    const created = []
    const errors = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const rowNum = i + 2
      const text = String(r['题目'] || r['题目内容'] || r['text'] || r['question'] || '')
      const optionA = String(r['选项A'] || r['A'] || r['optionA'] || '')
      const optionB = String(r['选项B'] || r['B'] || r['optionB'] || '')
      const optionC = String(r['选项C'] || r['C'] || r['optionC'] || '')
      const optionD = String(r['选项D'] || r['D'] || r['optionD'] || '')
      const answer = String(r['正确答案'] || r['答案'] || r['correctAnswer'] || r['answer'] || '').toUpperCase()
      const score = parseInt(r['分值'] || r['score'] || '10')

      if (!text || !optionA || !optionB || !answer) {
        errors.push(`第 ${rowNum} 行：题目/选项A/选项B/正确答案不能为空`)
        continue
      }
      if (!['A', 'B', 'C', 'D'].includes(answer)) {
        errors.push(`第 ${rowNum} 行：正确答案必须为A/B/C/D`)
        continue
      }

      try {
        const question = await SafetyQuestion.create({
          exam_id: parseInt(examId),
          question: text,
          options: JSON.stringify({ A: optionA, B: optionB, C: optionC, D: optionD }),
          answer,
          score: isNaN(score) ? 10 : score,
          sort_order: created.length,
        })
        created.push(question)
      } catch (e) {
        errors.push(`第 ${rowNum} 行：入库失败`)
      }
    }

    return success(res, {
      imported: created.length,
      total: rows.length,
      errors: errors.length ? errors : undefined,
    }, `成功导入 ${created.length}/${rows.length} 道题目`)
  } catch (err) {
    console.error('导入题目错误:', err)
    return error(res, '文件解析失败，请检查格式', 500)
  }
}

exports.getIncidentList = async (req, res) => {
  try {
    const list = await IncidentReport.findAll({
      include: [{ model: StudentInfo, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      order: [['created_at', 'DESC']],
    })
    return success(res, list)
  } catch (e) { return error(res, e.message, 500) }
}

exports.handleIncident = async (req, res) => {
  try {
    const incident = await IncidentReport.findByPk(req.params.id)
    if (!incident) return error(res, '记录不存在', 404)
    await incident.update({ status: req.body.status, handler_id: req.user.id, handle_result: req.body.handleResult, handled_at: new Date() })
    return success(res, incident, '处理完成')
  } catch (e) { return error(res, e.message, 500) }
}
