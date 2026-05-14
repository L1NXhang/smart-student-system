const express = require('express')
const router = express.Router()
const c = require('../controllers/safetyController')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth')

// 学生端
router.post('/late-return', authMiddleware, c.submitLateReturn)
router.get('/late-return', authMiddleware, c.getLateReturnRecords)
router.put('/late-return/:id/cancel', authMiddleware, c.cancelLateReturn)
router.post('/leave', authMiddleware, c.submitLeave)
router.get('/leave', authMiddleware, c.getLeaveRecords)
router.put('/leave/:id/cancel', authMiddleware, c.cancelLeave)
router.get('/exams', authMiddleware, c.getExams)
router.get('/exams/:id/questions', authMiddleware, c.getExamQuestions)
router.post('/exams/:id/submit', authMiddleware, c.submitExam)
router.get('/exams/:id/record', authMiddleware, c.getExamRecord)
router.post('/incidents', authMiddleware, c.reportIncident)
router.get('/incidents', authMiddleware, c.getIncidents)

// 管理端
router.get('/admin/late-return', authMiddleware, adminMiddleware, c.getLateReturnList)
router.put('/admin/late-return/:id', authMiddleware, adminMiddleware, c.auditLateReturn)
router.get('/admin/leave', authMiddleware, adminMiddleware, c.getLeaveList)
router.put('/admin/leave/:id', authMiddleware, adminMiddleware, c.auditLeave)
router.post('/admin/exams', authMiddleware, adminMiddleware, c.createExam)
router.delete('/admin/exams/:id', authMiddleware, adminMiddleware, c.deleteExam)
router.post('/admin/exams/:id/questions', authMiddleware, adminMiddleware, c.createQuestion)
router.put('/admin/questions/:id', authMiddleware, adminMiddleware, c.updateQuestion)
router.delete('/admin/questions/:id', authMiddleware, adminMiddleware, c.deleteQuestion)
router.get('/admin/incidents', authMiddleware, adminMiddleware, c.getIncidentList)
router.put('/admin/incidents/:id', authMiddleware, adminMiddleware, c.handleIncident)

module.exports = router
