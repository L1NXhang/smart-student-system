const { StudentInfo, sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');

// 提交奖学金申请
const submitScholarshipApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scholarshipType, reason, materials, gpa, ranking, awardsSummary, conductScore, conductScoreDetail, templateData } = req.body;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已有待审核的同类申请
    const existing = await sequelize.query(
      `SELECT * FROM scholarship_applications
       WHERE student_id = ? AND scholarship_type = ? AND status = 'pending'`,
      {
        replacements: [studentInfo.id, scholarshipType],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已有待审核的该类奖学金申请', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO scholarship_applications
       (student_id, scholarship_type, reason, materials, gpa, ranking, awards_summary, conduct_score, conduct_score_detail, template_data, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [
          studentInfo.id, scholarshipType, reason, JSON.stringify(materials || []),
          gpa || null, ranking || null, awardsSummary || null,
          conductScore || 0, conductScoreDetail ? JSON.stringify(conductScoreDetail) : null,
          templateData ? JSON.stringify(templateData) : null,
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '奖学金申请已提交');
  } catch (err) {
    console.error('提交奖学金申请错误:', err);
    return error(res, '提交奖学金申请失败', 500);
  }
};

// 获取我的奖学金申请
const getMyScholarshipApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'student_id = ?';
    const params = [studentInfo.id];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM scholarship_applications WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM scholarship_applications WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 解析 materials JSON
    list.forEach(item => {
      if (item.materials) {
        try {
          item.materials = JSON.parse(item.materials);
        } catch (e) {
          item.materials = [];
        }
      }
    });

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取奖学金申请列表错误:', err);
    return error(res, '获取奖学金申请列表失败', 500);
  }
};

// 提交助学金申请
const submitGrantApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { grantType, reason, materials } = req.body;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已有待审核的同类申请
    const existing = await sequelize.query(
      `SELECT * FROM grant_applications 
       WHERE student_id = ? AND grant_type = ? AND status = 'pending'`,
      {
        replacements: [studentInfo.id, grantType],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已有待审核的该类助学金申请', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO grant_applications (student_id, grant_type, reason, materials, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [studentInfo.id, grantType, reason, JSON.stringify(materials || [])],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '助学金申请已提交');
  } catch (err) {
    console.error('提交助学金申请错误:', err);
    return error(res, '提交助学金申请失败', 500);
  }
};

// 获取我的助学金申请
const getMyGrantApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'student_id = ?';
    const params = [studentInfo.id];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM grant_applications WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM grant_applications WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 解析 materials JSON
    list.forEach(item => {
      if (item.materials) {
        try {
          item.materials = JSON.parse(item.materials);
        } catch (e) {
          item.materials = [];
        }
      }
    });

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取助学金申请列表错误:', err);
    return error(res, '获取助学金申请列表失败', 500);
  }
};

// 获取勤工助学岗位列表
const getWorkStudyPositions = async (req, res) => {
  try {
    const { keyword, status = 1, page = 1, pageSize = 10 } = req.query;

    let whereClause = 'status = ?';
    const params = [parseInt(status)];

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM work_study_positions WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM work_study_positions WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取勤工助学岗位列表错误:', err);
    return error(res, '获取勤工助学岗位列表失败', 500);
  }
};

// 获取岗位详情
const getWorkStudyPositionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await sequelize.query(
      'SELECT * FROM work_study_positions WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (position.length === 0) {
      return error(res, '岗位不存在', 404);
    }

    return success(res, position[0]);
  } catch (err) {
    console.error('获取岗位详情错误:', err);
    return error(res, '获取岗位详情失败', 500);
  }
};

// 申请勤工助学岗位
const applyWorkStudyPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { positionId, reason } = req.body;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查岗位是否存在且开放
    const position = await sequelize.query(
      'SELECT * FROM work_study_positions WHERE id = ? AND status = 1',
      {
        replacements: [positionId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (position.length === 0) {
      return error(res, '岗位不存在或已关闭', 404);
    }

    // 检查是否已申请
    const existing = await sequelize.query(
      'SELECT * FROM work_study_applications WHERE position_id = ? AND student_id = ?',
      {
        replacements: [positionId, studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已申请该岗位', 400);
    }

    // 检查岗位是否已满
    const applicationCount = await sequelize.query(
      `SELECT COUNT(*) as count FROM work_study_applications 
       WHERE position_id = ? AND status = 'approved'`,
      {
        replacements: [positionId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (applicationCount[0].count >= position[0].quota) {
      return error(res, '该岗位名额已满', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO work_study_applications (position_id, student_id, reason, status, created_at)
       VALUES (?, ?, ?, 'pending', NOW())`,
      {
        replacements: [positionId, studentInfo.id, reason],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '岗位申请已提交');
  } catch (err) {
    console.error('申请勤工助学岗位错误:', err);
    return error(res, '申请勤工助学岗位失败', 500);
  }
};

// 获取我的岗位申请
const getMyWorkStudyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    let whereClause = 'a.student_id = ?';
    const params = [studentInfo.id];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM work_study_applications a WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT a.*, p.title as position_title, p.work_time, p.salary
       FROM work_study_applications a
       LEFT JOIN work_study_positions p ON a.position_id = p.id
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
    console.error('获取岗位申请列表错误:', err);
    return error(res, '获取岗位申请列表失败', 500);
  }
};

module.exports = {
  submitScholarshipApplication,
  getMyScholarshipApplications,
  submitGrantApplication,
  getMyGrantApplications,
  getWorkStudyPositions,
  getWorkStudyPositionDetail,
  applyWorkStudyPosition,
  getMyWorkStudyApplications
};
