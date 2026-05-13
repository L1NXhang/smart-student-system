const express = require('express')
const router = express.Router()
const c = require('../controllers/chatController')
const { authMiddleware } = require('../middlewares/auth')

router.get('/contacts', authMiddleware, c.getContacts)
router.get('/messages/:contactId', authMiddleware, c.getMessages)

module.exports = router
