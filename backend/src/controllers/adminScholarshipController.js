const { sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');

// 获取奖学金申请列表
const getScholarshipApplications = async (req, res) => {
  try {
    const { status, scholarshipType, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }

    if (scholarshipType) {
      whereClause += ' AND s.scholarship_type = ?';
      params.push(scholarshipType);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM scholarship_applications s WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT s.*, u.name as student_name, u.username as student_username
       FROM scholarship_applications s
       LEFT JOIN student_info st ON s.student_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       WHERE ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
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

// 审核奖学金申请
const auditScholarshipApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const reviewerId = req.user.id;

    // 获取申请信息
    const request = await sequelize.query(
      'SELECT * FROM scholarship_applications WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (request.length === 0) {
      return error(res, '申请不存在', 404);
    }

    if (request[0].status !== 'pending') {
      return error(res, '该申请已处理', 400);
    }

    // 更新申请状态
    await sequelize.query(
      `UPDATE scholarship_applications 
       SET status = ?, reviewer_id = ?, review_comment = ?, reviewed_at = NOW()
       WHERE id = ?`,
      {
        replacements: [status, reviewerId, comment, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核奖学金申请错误:', err);
    return error(res, '审核奖学金申请失败', 500);
  }
};

// 获取助学金申请列表
const getGrantApplications = async (req, res) => {
  try {
    const { status, grantType, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND g.status = ?';
      params.push(status);
    }

    if (grantType) {
      whereClause += ' AND g.grant_type = ?';
      params.push(grantType);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM grant_applications g WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT g.*, u.name as student_name, u.username as student_username
       FROM grant_applications g
       LEFT JOIN student_info st ON g.student_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       WHERE ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
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

// 审核助学金申请
const auditGrantApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const reviewerId = req.user.id;

    // 获取申请信息
    const request = await sequelize.query(
      'SELECT * FROM grant_applications WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (request.length === 0) {
      return error(res, '申请不存在', 404);
    }

    if (request[0].status !== 'pending') {
      return error(res, '该申请已处理', 400);
    }

    // 更新申请状态
    await sequelize.query(
      `UPDATE grant_applications 
       SET status = ?, reviewer_id = ?, review_comment = ?, reviewed_at = NOW()
       WHERE id = ?`,
      {
        replacements: [status, reviewerId, comment, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核助学金申请错误:', err);
    return error(res, '审核助学金申请失败', 500);
  }
};

// 获取勤工助学岗位列表（管理员）
const getWorkStudyPositions = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query
    let whereClause = '1=1'
    const params = []
    if (status !== undefined) { whereClause += ' AND status = ?'; params.push(+status) }
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM work_study_positions WHERE ${whereClause}`,
      { replacements: params, type: sequelize.QueryTypes.SELECT }
    )
    const total = countResult[0].total
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const list = await sequelize.query(
      `SELECT w.*, u.name as publisher_name,
        (SELECT COUNT(*) FROM work_study_applications WHERE position_id = w.id AND status = 'approved') as hired_count,
        (SELECT COUNT(*) FROM work_study_applications WHERE position_id = w.id) as apply_count
       FROM work_study_positions w
       LEFT JOIN users u ON w.publisher_id = u.id
       WHERE ${whereClause}
       ORDER BY w.created_at DESC LIMIT ? OFFSET ?`,
      { replacements: [...params, parseInt(pageSize), offset], type: sequelize.QueryTypes.SELECT }
    )
    return paginate(res, list, total, parseInt(page), parseInt(pageSize))
  } catch (err) {
    console.error('获取岗位列表错误:', err)
    return error(res, '获取岗位列表失败', 500)
  }
}

// 发布勤工助学岗位
const createWorkStudyPosition = async (req, res) => {
  try {
    const { title, description, requirements, workTime, salary, quota, deadline } = req.body;
    const publisherId = req.user.id;

    const result = await sequelize.query(
      `INSERT INTO work_study_positions (title, description, requirements, work_time, salary, quota, deadline, status, publisher_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())`,
      {
        replacements: [title, description, requirements, workTime, salary, quota, deadline, publisherId],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, { id: result[0] }, '岗位发布成功');
  } catch (err) {
    console.error('发布岗位错误:', err);
    return error(res, '发布岗位失败', 500);
  }
};

// 更新勤工助学岗位
const updateWorkStudyPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, workTime, salary, quota, deadline, status } = req.body;

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

    await sequelize.query(
      `UPDATE work_study_positions 
       SET title = ?, description = ?, requirements = ?, work_time = ?, salary = ?, quota = ?, deadline = ?, status = ?
       WHERE id = ?`,
      {
        replacements: [title, description, requirements, workTime, salary, quota, deadline, status, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, '岗位更新成功');
  } catch (err) {
    console.error('更新岗位错误:', err);
    return error(res, '更新岗位失败', 500);
  }
};

// 获取岗位申请列表
const getWorkStudyApplications = async (req, res) => {
  try {
    const { positionId, status, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (positionId) {
      whereClause += ' AND a.position_id = ?';
      params.push(parseInt(positionId));
    }

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
      `SELECT a.*, p.title as position_title, u.name as student_name, u.username as student_username
       FROM work_study_applications a
       LEFT JOIN work_study_positions p ON a.position_id = p.id
       LEFT JOIN student_info st ON a.student_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
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

// 审核岗位申请
const auditWorkStudyApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // 获取申请信息
    const request = await sequelize.query(
      'SELECT * FROM work_study_applications WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (request.length === 0) {
      return error(res, '申请不存在', 404);
    }

    if (request[0].status !== 'pending') {
      return error(res, '该申请已处理', 400);
    }

    // 如果通过，检查岗位是否已满
    if (status === 'approved') {
      const position = await sequelize.query(
        'SELECT * FROM work_study_positions WHERE id = ?',
        {
          replacements: [request[0].position_id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      const approvedCount = await sequelize.query(
        `SELECT COUNT(*) as count FROM work_study_applications 
         WHERE position_id = ? AND status = 'approved'`,
        {
          replacements: [request[0].position_id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (approvedCount[0].count >= position[0].quota) {
        return error(res, '该岗位名额已满', 400);
      }
    }

    // 更新申请状态
    await sequelize.query(
      `UPDATE work_study_applications 
       SET status = ?, review_comment = ?, reviewed_at = NOW()
       WHERE id = ?`,
      {
        replacements: [status, comment, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核岗位申请错误:', err);
    return error(res, '审核岗位申请失败', 500);
  }
};

module.exports = {
  getScholarshipApplications,
  auditScholarshipApplication,
  getGrantApplications,
  auditGrantApplication,
  getWorkStudyPositions,
  createWorkStudyPosition,
  updateWorkStudyPosition,
  getWorkStudyApplications,
  auditWorkStudyApplication
};
