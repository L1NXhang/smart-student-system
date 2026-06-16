const { sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');

// 批量导入成绩
const importGrades = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, '请上传文件', 400);
    }

    // 解析 Excel 文件
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return error(res, '文件内容为空', 400);
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
      try {
        // 根据学号查找学生
        const student = await sequelize.query(
          `SELECT s.id FROM student_info s 
           LEFT JOIN users u ON s.user_id = u.id 
           WHERE u.username = ?`,
          {
            replacements: [row.学号 || row.username],
            type: sequelize.QueryTypes.SELECT
          }
        );

        if (student.length === 0) {
          failCount++;
          continue;
        }

        // 插入或更新成绩
        await sequelize.query(
          `INSERT INTO grades (student_id, semester, course_name, course_type, credit, score, gpa, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE score = VALUES(score), gpa = VALUES(gpa)`,
          {
            replacements: [
              student[0].id,
              row.学期 || row.semester,
              row.课程名称 || row.course_name,
              row.课程类型 || 'required',
              row.学分 || row.credit,
              row.成绩 || row.score,
              row.绩点 || row.gpa
            ],
            type: sequelize.QueryTypes.INSERT
          }
        );

        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    return success(res, { successCount, failCount, total: data.length }, '成绩导入完成');
  } catch (err) {
    console.error('导入成绩错误:', err);
    return error(res, '导入成绩失败', 500);
  }
};

// 批量导入第二课堂活动
const importSecondClassroom = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, '请上传文件', 400);
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return error(res, '文件内容为空', 400);
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
      try {
        const student = await sequelize.query(
          `SELECT s.id FROM student_info s 
           LEFT JOIN users u ON s.user_id = u.id 
           WHERE u.username = ?`,
          {
            replacements: [row.学号 || row.username],
            type: sequelize.QueryTypes.SELECT
          }
        );

        if (student.length === 0) {
          failCount++;
          continue;
        }

        await sequelize.query(
          `INSERT INTO second_classroom_activities (student_id, activity_name, activity_type, hours, points, semester, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          {
            replacements: [
              student[0].id,
              row.活动名称 || row.activity_name,
              row.活动类型 || 'other',
              row.时长 || row.hours || 0,
              row.学分 || row.points || 0,
              row.学期 || row.semester
            ],
            type: sequelize.QueryTypes.INSERT
          }
        );

        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    return success(res, { successCount, failCount, total: data.length }, '第二课堂活动导入完成');
  } catch (err) {
    console.error('导入第二课堂活动错误:', err);
    return error(res, '导入第二课堂活动失败', 500);
  }
};

// 获取中期鉴定列表（管理员）
const getMidtermEvaluations = async (req, res) => {
  try {
    const { status, semester, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    if (semester) {
      whereClause += ' AND e.semester = ?';
      params.push(semester);
    }

    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM midterm_evaluations e WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT e.*, u.name as student_name, u.username as student_username
       FROM midterm_evaluations e
       LEFT JOIN student_info s ON e.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取中期鉴定列表错误:', err);
    return error(res, '获取中期鉴定列表失败', 500);
  }
};

// 审核中期鉴定
const auditMidtermEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, teacherComment } = req.body;
    const reviewerId = req.user.id;

    const evaluation = await sequelize.query(
      'SELECT * FROM midterm_evaluations WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (evaluation.length === 0) {
      return error(res, '鉴定记录不存在', 404);
    }

    await sequelize.query(
      `UPDATE midterm_evaluations 
       SET status = ?, teacher_comment = ?, reviewer_id = ?, reviewed_at = NOW()
       WHERE id = ?`,
      {
        replacements: [status, teacherComment, reviewerId, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核中期鉴定错误:', err);
    return error(res, '审核中期鉴定失败', 500);
  }
};

// 获取获奖记录列表（管理员）
const getAwards = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM awards a WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT a.*, u.name as student_name, u.username as student_username
       FROM awards a
       LEFT JOIN student_info s ON a.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取获奖记录列表错误:', err);
    return error(res, '获取获奖记录列表失败', 500);
  }
};

// 审核获奖记录
const auditAward = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviewerId = req.user.id;

    await sequelize.query(
      `UPDATE awards SET status = ?, reviewer_id = ? WHERE id = ?`,
      {
        replacements: [status, reviewerId, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核获奖记录错误:', err);
    return error(res, '审核获奖记录失败', 500);
  }
};

// 获取成绩列表（管理员）
const getGradesList = async (req, res) => {
  try {
    const { semester, keyword, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (semester) {
      whereClause += ' AND g.semester = ?';
      params.push(semester);
    }

    if (keyword) {
      whereClause += ' AND (u.name LIKE ? OR u.username LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM grades g
       LEFT JOIN student_info s ON g.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}`,
      { replacements: params, type: sequelize.QueryTypes.SELECT }
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT g.*, u.name as student_name, u.username as student_username
       FROM grades g
       LEFT JOIN student_info s ON g.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      { replacements: [...params, parseInt(pageSize), offset], type: sequelize.QueryTypes.SELECT }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取成绩列表错误:', err);
    return error(res, '获取成绩列表失败', 500);
  }
};

module.exports = {
  importGrades,
  importSecondClassroom,
  getMidtermEvaluations,
  auditMidtermEvaluation,
  getAwards,
  auditAward,
  getGradesList,
};
