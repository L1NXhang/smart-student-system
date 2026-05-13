const express = require('express')
const router = express.Router()
const c = require('../controllers/feedbackController')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth')

router.post('/', authMiddleware, c.submitFeedback)
router.get('/', authMiddleware, c.getMyFeedbacks)

router.get('/admin/all', authMiddleware, adminMiddleware, c.getFeedbackList)
router.put('/admin/:id/reply', authMiddleware, adminMiddleware, c.replyFeedback)

module.exports = router
