const { StudentInfo, sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { getCachedStudentInfo } = require('../utils/getStudentInfo');

// 获取成绩列表
const getGrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, page = 1, pageSize = 10 } = req.query;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'student_id = ?';
    const params = [studentInfo.id];

    if (semester) {
      whereClause += ' AND semester = ?';
      params.push(semester);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM grades WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM grades WHERE ${whereClause} ORDER BY semester DESC, created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 计算统计信息
    const statsResult = await sequelize.query(
      `SELECT 
        SUM(credit) as total_credits,
        AVG(score) as average_score,
        AVG(gpa) as average_gpa
       FROM grades WHERE student_id = ?`,
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取成绩列表错误:', err);
    return error(res, '获取成绩列表失败', 500);
  }
};

// 获取成绩统计
const getGradeStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    const stats = await sequelize.query(
      `SELECT 
        SUM(credit) as totalCredits,
        AVG(score) as averageScore,
        AVG(gpa) as averageGpa,
        COUNT(*) as totalCourses
       FROM grades WHERE student_id = ?`,
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return success(res, stats[0] || { totalCredits: 0, averageScore: 0, averageGpa: 0, totalCourses: 0 });
  } catch (err) {
    console.error('获取成绩统计错误:', err);
    return error(res, '获取成绩统计失败', 500);
  }
};

// 获取获奖记录
const getAwards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10 } = req.query;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 获取总数
    const countResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM awards WHERE student_id = ?',
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      'SELECT * FROM awards WHERE student_id = ? ORDER BY award_date DESC LIMIT ? OFFSET ?',
      {
        replacements: [studentInfo.id, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取获奖记录错误:', err);
    return error(res, '获取获奖记录失败', 500);
  }
};

// 提交获奖记录
const submitAward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { awardName, awardLevel, awardType, awardDate } = req.body;
    const certificatePath = req.file ? `/uploads/${req.file.filename}` : null;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    await sequelize.query(
      `INSERT INTO awards (student_id, award_name, award_level, award_type, award_date, certificate_path, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [studentInfo.id, awardName, awardLevel, awardType, awardDate, certificatePath],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '获奖记录已提交');
  } catch (err) {
    console.error('提交获奖记录错误:', err);
    return error(res, '提交获奖记录失败', 500);
  }
};

// 获取违纪记录
const getDisciplinaryRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    const list = await sequelize.query(
      "SELECT * FROM disciplinary_records WHERE student_id = ? AND status = 'active' ORDER BY record_date DESC",
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return success(res, list);
  } catch (err) {
    console.error('获取违纪记录错误:', err);
    return error(res, '获取违纪记录失败', 500);
  }
};

// 获取第二课堂成绩单
const getSecondClassroom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.query;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'student_id = ?';
    const params = [studentInfo.id];

    if (semester) {
      whereClause += ' AND semester = ?';
      params.push(semester);
    }

    // 获取活动列表
    const activities = await sequelize.query(
      `SELECT * FROM second_classroom_activities WHERE ${whereClause} ORDER BY created_at DESC`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 计算统计
    const summary = await sequelize.query(
      `SELECT 
        SUM(hours) as totalHours,
        SUM(points) as totalPoints,
        SUM(CASE WHEN activity_type = 'academic' THEN hours ELSE 0 END) as academicHours,
        SUM(CASE WHEN activity_type = 'sports' THEN hours ELSE 0 END) as sportsHours,
        SUM(CASE WHEN activity_type = 'volunteer' THEN hours ELSE 0 END) as volunteerHours
       FROM second_classroom_activities WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );

    return success(res, {
      activities,
      summary: summary[0] || { totalHours: 0, totalPoints: 0, academicHours: 0, sportsHours: 0, volunteerHours: 0 }
    });
  } catch (err) {
    console.error('获取第二课堂成绩单错误:', err);
    return error(res, '获取第二课堂成绩单失败', 500);
  }
};

// 获取中期鉴定
const getMidtermEvaluation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.params;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    const evaluation = await sequelize.query(
      'SELECT * FROM midterm_evaluations WHERE student_id = ? AND semester = ?',
      {
        replacements: [studentInfo.id, semester],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (evaluation.length === 0) {
      return success(res, null);
    }

    return success(res, evaluation[0]);
  } catch (err) {
    console.error('获取中期鉴定错误:', err);
    return error(res, '获取中期鉴定失败', 500);
  }
};

// 提交中期鉴定
const submitMidtermEvaluation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, moralPerformance, academicPerformance, socialPractice, physicalMental, selfEvaluation } = req.body;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已存在
    const existing = await sequelize.query(
      'SELECT * FROM midterm_evaluations WHERE student_id = ? AND semester = ?',
      {
        replacements: [studentInfo.id, semester],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      // 更新
      await sequelize.query(
        `UPDATE midterm_evaluations 
         SET moral_performance = ?, academic_performance = ?, social_practice = ?, physical_mental = ?, self_evaluation = ?, 
             status = 'submitted', submitted_at = NOW()
         WHERE student_id = ? AND semester = ?`,
        {
          replacements: [moralPerformance, academicPerformance, socialPractice, physicalMental, selfEvaluation, studentInfo.id, semester],
          type: sequelize.QueryTypes.UPDATE
        }
      );
    } else {
      // 新建
      await sequelize.query(
        `INSERT INTO midterm_evaluations (student_id, semester, moral_performance, academic_performance, social_practice, physical_mental, self_evaluation, status, created_at, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW(), NOW())`,
        {
          replacements: [studentInfo.id, semester, moralPerformance, academicPerformance, socialPractice, physicalMental, selfEvaluation],
          type: sequelize.QueryTypes.INSERT
        }
      );
    }

    return success(res, null, '中期鉴定已提交');
  } catch (err) {
    console.error('提交中期鉴定错误:', err);
    return error(res, '提交中期鉴定失败', 500);
  }
};

// 保存中期鉴定草稿
const saveMidtermEvaluationDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, moralPerformance, academicPerformance, socialPractice, physicalMental, selfEvaluation } = req.body;

    const studentInfo = await getCachedStudentInfo(req);
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已存在
    const existing = await sequelize.query(
      'SELECT * FROM midterm_evaluations WHERE student_id = ? AND semester = ?',
      {
        replacements: [studentInfo.id, semester],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      // 更新
      await sequelize.query(
        `UPDATE midterm_evaluations 
         SET moral_performance = ?, academic_performance = ?, social_practice = ?, physical_mental = ?, self_evaluation = ?
         WHERE student_id = ? AND semester = ?`,
        {
          replacements: [moralPerformance, academicPerformance, socialPractice, physicalMental, selfEvaluation, studentInfo.id, semester],
          type: sequelize.QueryTypes.UPDATE
        }
      );
    } else {
      // 新建
      await sequelize.query(
        `INSERT INTO midterm_evaluations (student_id, semester, moral_performance, academic_performance, social_practice, physical_mental, self_evaluation, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
        {
          replacements: [studentInfo.id, semester, moralPerformance, academicPerformance, socialPractice, physicalMental, selfEvaluation],
          type: sequelize.QueryTypes.INSERT
        }
      );
    }

    return success(res, null, '草稿已保存');
  } catch (err) {
    console.error('保存草稿错误:', err);
    return error(res, '保存草稿失败', 500);
  }
};

module.exports = {
  getGrades,
  getGradeStatistics,
  getAwards,
  submitAward,
  getDisciplinaryRecords,
  getSecondClassroom,
  getMidtermEvaluation,
  submitMidtermEvaluation,
  saveMidtermEvaluationDraft
};
