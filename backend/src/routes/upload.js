const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middlewares/auth')
const { makeUploader } = require('../middlewares/upload')
const { success, error } = require('../utils/response')

const upload = makeUploader({ maxSizeMB: 10 })

router.post('/', authMiddleware, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return error(res, err.message || '上传失败', 400)
    if (!req.file) return error(res, '请选择文件', 400)
    const url = '/uploads/' + req.file.filename
    return success(res, { url, filename: req.file.filename }, '上传成功')
  })
})

module.exports = router
