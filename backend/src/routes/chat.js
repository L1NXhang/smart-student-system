const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const c = require('../controllers/chatController')
const { authMiddleware } = require('../middlewares/auth')

const chatUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads/chat')
      require('fs').mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
})

router.get('/contacts', authMiddleware, c.getContacts)
router.get('/messages/:contactId', authMiddleware, c.getMessages)
router.post('/upload', authMiddleware, chatUpload.single('file'), c.uploadFile)

module.exports = router
