const express = require('express');
const router = express.Router();
const adminStudentController = require('../controllers/adminStudentController');
const adminScholarshipController = require('../controllers/adminScholarshipController');
const adminAcademicController = require('../controllers/adminAcademicController');
const adminCareerController = require('../controllers/adminCareerController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { makeUploader } = require('../middlewares/upload');
const { sequelize } = require('../models');
const { success, error } = require('../utils/response');

// Admin dashboard stats(单条聚合查询,替代 8 条串行 COUNT)
router.get('/dashboard/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS totalStudents,
        (SELECT COUNT(*) FROM scholarship_applications WHERE status = 'pending') AS pendingScholarship,
        (SELECT COUNT(*) FROM info_change_requests WHERE status = 'pending') AS pendingInfoChange,
        (SELECT COUNT(*) FROM difficulty_applications WHERE status = 'pending') AS pendingDifficulty,
        (SELECT COUNT(*) FROM feedbacks WHERE reply IS NULL) AS unhandledFeedback,
        (SELECT COUNT(*) FROM late_return_records WHERE status = 'pending') AS pendingLateReturn,
        (SELECT COUNT(*) FROM leave_records WHERE status = 'pending') AS pendingLeave,
        (SELECT COUNT(*) FROM events WHERE status = 1) AS totalEvents
    `);
    const r = rows[0] || {};
    const totalPending =
      Number(r.pendingScholarship || 0) +
      Number(r.pendingInfoChange || 0) +
      Number(r.pendingDifficulty || 0) +
      Number(r.pendingLateReturn || 0) +
      Number(r.pendingLeave || 0);
    return success(res, { ...r, totalPending });
  } catch (e) { return error(res, e.message, 500); }
});

// 配置文件上传(使用共享白名单 uploader,Excel 等会受 fileFilter 校验)
const upload = makeUploader({ maxSizeMB: 10 });

// 所有管理员路由都需要认证和管理员权限
router.use(authMiddleware, adminMiddleware);

// ===== 学生管理 =====
// 批量导入学生
router.post('/students/import', adminStudentController.importStudents);

// Excel文件批量导入学生
router.post('/students/import-file', upload.single('file'), adminStudentController.importStudentsFromFile);

// 获取学生列表
router.get('/students', adminStudentController.getStudentList);

// 获取学生详情
router.get('/students/:id', adminStudentController.getStudentDetail);

// 审核学生账号
router.put('/students/:id/audit', adminStudentController.auditStudent);

// 设置学生部门角色
router.put('/students/:id/department', adminStudentController.setDepartmentRole);

// 获取部门列表
router.get('/departments', adminStudentController.getDepartments);

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

// 获取勤工助学岗位列表（管理员）
router.get('/work-study/positions', adminScholarshipController.getWorkStudyPositions);

// 发布勤工助学岗位
router.post('/work-study/positions', adminScholarshipController.createWorkStudyPosition);

// 更新勤工助学岗位
router.put('/work-study/positions/:id', adminScholarshipController.updateWorkStudyPosition);

// 获取岗位申请列表
router.get('/work-study/applications', adminScholarshipController.getWorkStudyApplications);

// 审核岗位申请
router.put('/work-study/applications/:id', adminScholarshipController.auditWorkStudyApplication);

// ===== 学业发展管理 =====
// 获取成绩列表
router.get('/grades', adminAcademicController.getGradesList);

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
