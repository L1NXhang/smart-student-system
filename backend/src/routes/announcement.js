const express = require('express')
const router = express.Router()
const c = require('../controllers/announcementController')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth')

router.get('/', authMiddleware, c.getAnnouncements)
router.get('/unread-count', authMiddleware, c.getUnreadCount)
router.get('/:id', authMiddleware, c.getAnnouncement)
router.post('/:id/read', authMiddleware, c.markRead)

router.post('/', authMiddleware, adminMiddleware, c.createAnnouncement)
router.put('/:id', authMiddleware, adminMiddleware, c.updateAnnouncement)
router.delete('/:id', authMiddleware, adminMiddleware, c.deleteAnnouncement)

module.exports = router
