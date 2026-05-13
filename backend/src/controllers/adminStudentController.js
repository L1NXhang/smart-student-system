const { User, StudentInfo, sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

// 获取学生列表（管理员）
const getStudentList = async (req, res) => {
  try {
    const { keyword, college, className, status, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (keyword) {
      whereClause += ' AND (u.name LIKE ? OR u.username LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (college) {
      whereClause += ' AND s.college = ?';
      params.push(college);
    }

    if (className) {
      whereClause += ' AND s.class_name = ?';
      params.push(className);
    }

    if (status !== undefined) {
      whereClause += ' AND u.status = ?';
      params.push(parseInt(status));
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM users u 
       LEFT JOIN student_info s ON u.id = s.user_id 
       WHERE u.role = 'student' AND ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT u.id, u.username, u.name, u.role, u.status, u.created_at,
              s.college, s.major, s.grade, s.class_name, s.phone
       FROM users u 
       LEFT JOIN student_info s ON u.id = s.user_id 
       WHERE u.role = 'student' AND ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取学生列表错误:', err);
    return error(res, '获取学生列表失败', 500);
  }
};

// 获取学生详情（管理员）
const getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'name', 'role', 'status', 'created_at']
    });

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    const studentInfo = await StudentInfo.findOne({ where: { userId: id } });

    // 获取家庭信息
    let familyInfo = [];
    if (studentInfo) {
      familyInfo = await sequelize.query(
        'SELECT * FROM family_info WHERE student_id = ?',
        {
          replacements: [studentInfo.id],
          type: sequelize.QueryTypes.SELECT
        }
      );
    }

    return success(res, {
      user,
      studentInfo,
      familyInfo
    });
  } catch (err) {
    console.error('获取学生详情错误:', err);
    return error(res, '获取学生详情失败', 500);
  }
};

// 审核学生账号（管理员）
const auditStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    await user.update({ status: parseInt(status) });

    return success(res, null, status === 1 ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核学生错误:', err);
    return error(res, '审核学生失败', 500);
  }
};

// 获取信息变更申请列表（管理员）
const getInfoChangeRequests = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM info_change_requests r WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT r.*, u.name as student_name, u.username as student_username
       FROM info_change_requests r
       LEFT JOIN student_info s ON r.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取信息变更申请列表错误:', err);
    return error(res, '获取信息变更申请列表失败', 500);
  }
};

// 审核信息变更申请（管理员）
const auditInfoChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const reviewerId = req.user.id;

    // 获取申请信息
    const request = await sequelize.query(
      'SELECT * FROM info_change_requests WHERE id = ?',
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
      `UPDATE info_change_requests 
       SET status = ?, reviewer_id = ?, review_comment = ?, reviewed_at = NOW()
       WHERE id = ?`,
      {
        replacements: [status, reviewerId, comment, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // 如果通过，更新学生信息
    if (status === 'approved') {
      const { student_id, field_name, new_value } = request[0];
      
      // 字段名映射
      const fieldMap = {
        'phone': 'phone',
        'college': 'college',
        'major': 'major',
        'className': 'class_name',
        'grade': 'grade',
        'campus': 'campus',
        'dormitory': 'dormitory'
      };

      const dbField = fieldMap[field_name] || field_name;
      
      await sequelize.query(
        `UPDATE student_info SET ${dbField} = ? WHERE id = ?`,
        {
          replacements: [new_value, student_id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
    }

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核信息变更申请错误:', err);
    return error(res, '审核信息变更申请失败', 500);
  }
};

// 获取困难认定申请列表（管理员）
const getDifficultyApplications = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND d.status = ?';
      params.push(status);
    }

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM difficulty_applications d WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT d.*, u.name as student_name, u.username as student_username
       FROM difficulty_applications d
       LEFT JOIN student_info s ON d.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取困难认定申请列表错误:', err);
    return error(res, '获取困难认定申请列表失败', 500);
  }
};

// 审核困难认定申请（管理员）
const auditDifficultyApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const reviewerId = req.user.id;

    // 获取申请信息
    const request = await sequelize.query(
      'SELECT * FROM difficulty_applications WHERE id = ?',
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
      `UPDATE difficulty_applications 
       SET status = ?, reviewer_id = ?, review_comment = ?, reviewed_at = NOW()
       WHERE id = ?`,
      {
        replacements: [status, reviewerId, comment, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // 如果通过，更新学生困难认定等级
    if (status === 'approved') {
      const { student_id, level } = request[0];
      
      await sequelize.query(
        `UPDATE student_info SET difficulty_level = ?, difficulty_status = 'approved' WHERE id = ?`,
        {
          replacements: [level, student_id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
    } else {
      await sequelize.query(
        `UPDATE student_info SET difficulty_status = 'rejected' WHERE id = ?`,
        {
          replacements: [request[0].student_id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
    }

    return success(res, null, status === 'approved' ? '审核通过' : '审核拒绝');
  } catch (err) {
    console.error('审核困难认定申请错误:', err);
    return error(res, '审核困难认定申请失败', 500);
  }
};

// 批量导入学生
const importStudents = async (req, res) => {
  try {
    const students = req.body.students
    if (!students || !students.length) return error(res, '请提供学生数据', 400)
    const bcrypt = require('bcryptjs')
    const defaultPassword = bcrypt.hashSync('123456', 10)
    let imported = 0

    for (const s of students) {
      try {
        const [user, created] = await User.findOrCreate({
          where: { username: s.username || s.studentId },
          defaults: {
            username: s.username || s.studentId,
            password: defaultPassword,
            name: s.name,
            role: 'student',
            status: 1,
          },
        })
        if (created || (user)) {
          const userId = user.id
          const existing = await sequelize.query('SELECT id FROM student_info WHERE user_id = ?', {
            replacements: [userId], type: sequelize.QueryTypes.SELECT,
          })
          if (!existing.length) {
            await sequelize.query(
              `INSERT INTO student_info (user_id, college, major, grade, class_name, phone, campus)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              { replacements: [userId, s.college, s.major, s.grade, s.className || s.class, s.phone || '', s.campus || '华凤校区'], type: sequelize.QueryTypes.INSERT }
            )
          }
          imported++
        }
      } catch (e) { /* skip duplicates */ }
    }
    return success(res, { imported, total: students.length }, `成功导入 ${imported} 名学生`)
  } catch (err) {
    console.error('批量导入错误:', err)
    return error(res, '批量导入失败', 500)
  }
}

module.exports = {
  getStudentList,
  getStudentDetail,
  auditStudent,
  getInfoChangeRequests,
  auditInfoChangeRequest,
  getDifficultyApplications,
  auditDifficultyApplication,
  importStudents,
};
