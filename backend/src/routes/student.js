const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const studentController = require('../controllers/studentController');
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

// 获取学生详细信息
router.get('/info', authMiddleware, studentController.getStudentInfo);

// 更新学生信息
router.put('/info', authMiddleware, studentController.updateStudentInfo);

// 上传照片
router.put('/info/photo', authMiddleware, upload.single('photo'), studentController.uploadPhoto);

// 提交信息变更申请
router.post('/info-change', authMiddleware, studentController.submitInfoChange);

// 批量提交信息变更
router.post('/info-change/batch', authMiddleware, studentController.batchSubmitInfoChange);

// 获取信息变更申请列表
router.get('/info-change', authMiddleware, studentController.getInfoChangeRequests);

// 提交困难认定申请
router.post('/difficulty-application', authMiddleware, upload.single('material'), studentController.submitDifficultyApplication);

// 获取困难认定申请状态
router.get('/difficulty-application', authMiddleware, studentController.getDifficultyApplication);

// 保存家庭信息
router.put('/family-info', authMiddleware, studentController.saveFamilyInfo);

// 保存紧急联系人
router.put('/emergency-contacts', authMiddleware, studentController.saveEmergencyContacts);

// 导出学生信息
router.get('/export', authMiddleware, studentController.exportStudentInfo);

module.exports = router;
