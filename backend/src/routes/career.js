const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authMiddleware } = require('../middlewares/auth');

// 获取测评题目
router.get('/assessments/:type/questions', authMiddleware, careerController.getAssessmentQuestions);

// 提交测评答案
router.post('/assessments/:type/submit', authMiddleware, careerController.submitAssessment);

// 获取测评历史
router.get('/assessments', authMiddleware, careerController.getAssessmentHistory);

// 预约就业指导
router.post('/appointments', authMiddleware, careerController.createAppointment);

// 获取我的预约
router.get('/appointments', authMiddleware, careerController.getMyAppointments);

// 获取就业信息列表
router.get('/job-infos', authMiddleware, careerController.getJobInfos);

// 获取就业信息详情
router.get('/job-infos/:id', authMiddleware, careerController.getJobInfoDetail);

// 收藏就业信息
router.post('/job-infos/:id/favorite', authMiddleware, careerController.toggleFavorite);

module.exports = router;
