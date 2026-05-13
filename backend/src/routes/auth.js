const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

// 注册
router.post('/register', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('name').notEmpty().withMessage('姓名不能为空')
], authController.register);

// 登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware, authController.getMe);

// 修改密码（需要认证）
router.put('/password', authMiddleware, [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位')
], authController.changePassword);

module.exports = router;
