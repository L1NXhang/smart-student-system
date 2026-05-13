const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const academicController = require('../controllers/academicController');
const { authMiddleware } = require('../middlewares/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 获取成绩列表
router.get('/grades', authMiddleware, academicController.getGrades);

// 获取成绩统计
router.get('/grades/statistics', authMiddleware, academicController.getGradeStatistics);

// 获取获奖记录
router.get('/awards', authMiddleware, academicController.getAwards);

// 提交获奖记录
router.post('/awards', authMiddleware, upload.single('certificate'), academicController.submitAward);

// 获取违纪记录
router.get('/disciplinary', authMiddleware, academicController.getDisciplinaryRecords);

// 获取第二课堂成绩单
router.get('/second-classroom', authMiddleware, academicController.getSecondClassroom);

// 获取中期鉴定
router.get('/midterm-evaluation/:semester', authMiddleware, academicController.getMidtermEvaluation);

// 提交中期鉴定
router.post('/midterm-evaluation', authMiddleware, academicController.submitMidtermEvaluation);

// 保存中期鉴定草稿
router.put('/midterm-evaluation', authMiddleware, academicController.saveMidtermEvaluationDraft);

module.exports = router;
