const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const { authMiddleware } = require('../middlewares/auth')
const { success, error } = require('../utils/response')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return error(res, '请选择文件', 400)
  const url = '/uploads/' + req.file.filename
  return success(res, { url, filename: req.file.originalname }, '上传成功')
})

module.exports = router
