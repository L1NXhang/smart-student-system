// 共享的 multer 上传配置
// - fileFilter: 限制为白名单 mime(图片/PDF/Office),SVG 一律拒绝(XSS 风险)
// - 保留扩展名但只允许在白名单内,防止 .html / .js 等被同源加载
// - 统一大小上限 10MB
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const UPLOAD_DIR = path.join(__dirname, '../../uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const ALLOWED_MIME = new Set([
  // 图片(注意:SVG 被故意排除)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  // 文档
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // 压缩包(聊天附件场景)
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
])

// 扩展名 → mime 双向校验,杜绝"扩展名说 jpg 但 mime 是 text/html"
const EXT_TO_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.7z': 'application/x-7z-compressed',
  '.rar': 'application/x-rar-compressed',
}

function safeExtname(originalName) {
  const ext = path.extname(originalName || '').toLowerCase()
  return EXT_TO_MIME[ext] ? ext : ''
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // 用时间戳+随机后缀,再附上白名单内的扩展名(不直接采用用户原扩展名)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = safeExtname(file.originalname)
    cb(null, uniqueSuffix + ext)
  },
})

function makeUploader({ maxSizeMB = 10 } = {}) {
  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(new Error('不支持的文件类型: ' + file.mimetype))
      }
      if (!safeExtname(file.originalname)) {
        return cb(new Error('文件扩展名不在白名单内'))
      }
      cb(null, true)
    },
  })
}

module.exports = {
  makeUploader,
  UPLOAD_DIR,
  ALLOWED_MIME,
  safeExtname,
}
