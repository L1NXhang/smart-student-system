const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

// 认证类接口(登录/注册/改密)限流:同 IP 15 分钟内最多 10 次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '尝试次数过多,请 15 分钟后再试', data: null },
})

// 注册
router.post('/register', authLimiter, [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('college').notEmpty().withMessage('学院不能为空'),
  body('major').notEmpty().withMessage('专业不能为空'),
  body('grade').notEmpty().withMessage('年级不能为空'),
], authController.register);

// 登录
router.post('/login', authLimiter, [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

// 获取当前用户信息(需要认证)
router.get('/me', authMiddleware, authController.getMe);

// 修改密码(需要认证)
router.put('/password', authLimiter, authMiddleware, [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位')
], authController.changePassword);

module.exports = router;
