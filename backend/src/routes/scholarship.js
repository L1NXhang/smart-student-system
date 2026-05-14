const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { authMiddleware } = require('../middlewares/auth');

// 奖学金申请
router.post('/applications', authMiddleware, scholarshipController.submitScholarshipApplication);

// 获取我的奖学金申请
router.get('/applications', authMiddleware, scholarshipController.getMyScholarshipApplications);

// 导出奖学金申请为Word
router.get('/applications/:id/export', authMiddleware, scholarshipController.exportToDocx);

// 助学金申请
router.post('/grants', authMiddleware, scholarshipController.submitGrantApplication);

// 获取我的助学金申请
router.get('/grants', authMiddleware, scholarshipController.getMyGrantApplications);

// 获取勤工助学岗位列表
router.get('/work-study/positions', authMiddleware, scholarshipController.getWorkStudyPositions);

// 获取岗位详情
router.get('/work-study/positions/:id', authMiddleware, scholarshipController.getWorkStudyPositionDetail);

// 申请岗位
router.post('/work-study/applications', authMiddleware, scholarshipController.applyWorkStudyPosition);

// 获取我的岗位申请
router.get('/work-study/applications', authMiddleware, scholarshipController.getMyWorkStudyApplications);

module.exports = router;
