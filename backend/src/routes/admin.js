const express = require('express');
const router = express.Router();
const adminStudentController = require('../controllers/adminStudentController');
const adminScholarshipController = require('../controllers/adminScholarshipController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// 所有管理员路由都需要认证和管理员权限
router.use(authMiddleware, adminMiddleware);

// ===== 学生管理 =====
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

// ===== 奖助服务管理 =====
// 获取奖学金申请列表
router.get('/scholarship-applications', adminScholarshipController.getScholarshipApplications);

// 审核奖学金申请
router.put('/scholarship-applications/:id', adminScholarshipController.auditScholarshipApplication);

// 获取助学金申请列表
router.get('/grant-applications', adminScholarshipController.getGrantApplications);

// 审核助学金申请
router.put('/grant-applications/:id', adminScholarshipController.auditGrantApplication);

// 发布勤工助学岗位
router.post('/work-study/positions', adminScholarshipController.createWorkStudyPosition);

// 更新勤工助学岗位
router.put('/work-study/positions/:id', adminScholarshipController.updateWorkStudyPosition);

// 获取岗位申请列表
router.get('/work-study/applications', adminScholarshipController.getWorkStudyApplications);

// 审核岗位申请
router.put('/work-study/applications/:id', adminScholarshipController.auditWorkStudyApplication);

module.exports = router;
