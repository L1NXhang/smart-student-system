const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminStudentController = require('../controllers/adminStudentController');
const adminScholarshipController = require('../controllers/adminScholarshipController');
const adminAcademicController = require('../controllers/adminAcademicController');
const adminCareerController = require('../controllers/adminCareerController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

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

// ===== 学业发展管理 =====
// 批量导入成绩
router.post('/grades/import', upload.single('file'), adminAcademicController.importGrades);

// 批量导入第二课堂活动
router.post('/second-classroom/import', upload.single('file'), adminAcademicController.importSecondClassroom);

// 获取中期鉴定列表
router.get('/midterm-evaluations', adminAcademicController.getMidtermEvaluations);

// 审核中期鉴定
router.put('/midterm-evaluations/:id', adminAcademicController.auditMidtermEvaluation);

// 获取获奖记录列表
router.get('/awards', adminAcademicController.getAwards);

// 审核获奖记录
router.put('/awards/:id', adminAcademicController.auditAward);

// ===== 职业规划管理 =====
// 获取就业指导预约列表
router.get('/career-appointments', adminCareerController.getAppointments);

// 确认预约
router.put('/career-appointments/:id', adminCareerController.confirmAppointment);

// 发布就业信息
router.post('/job-infos', adminCareerController.createJobInfo);

// 更新就业信息
router.put('/job-infos/:id', adminCareerController.updateJobInfo);

// 删除就业信息
router.delete('/job-infos/:id', adminCareerController.deleteJobInfo);

module.exports = router;
