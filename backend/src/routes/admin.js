const express = require('express');
const router = express.Router();
const adminStudentController = require('../controllers/adminStudentController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// 所有管理员路由都需要认证和管理员权限
router.use(authMiddleware, adminMiddleware);

// 获取学生列表
router.get('/students', adminStudentController.getStudentList);

// 获取学生详情
router.get('/students/:id', adminStudentController.getStudentDetail);

// 审核学生账号
router.put('/students/:id/audit', adminStudentController.auditStudent);

// 获取信息变更申请列表
router.get('/info-change', adminStudentController.getInfoChangeRequests);

// 审核信息变更申请
router.put('/info-change/:id', adminStudentController.auditInfoChangeRequest);

// 获取困难认定申请列表
router.get('/difficulty-applications', adminStudentController.getDifficultyApplications);

// 审核困难认定申请
router.put('/difficulty-applications/:id', adminStudentController.auditDifficultyApplication);

module.exports = router;
