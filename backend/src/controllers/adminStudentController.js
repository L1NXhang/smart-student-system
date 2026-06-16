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
      `SELECT u.id, u.username, u.name, u.role, u.status, u.department, u.department_role, u.created_at,
              s.college, s.major, s.grade, s.class_name, s.phone, s.email
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
        '联系方式': 'phone',
        '邮箱': 'email',
        '身份证号': 'id_card',
        '学院': 'college',
        '专业': 'major',
        '班级': 'class_name',
        '年级': 'grade',
        '校区': 'campus',
        '宿舍号': 'dormitory'
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
              `INSERT INTO student_info (user_id, college, major, grade, class_name, phone, email, campus)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              { replacements: [userId, s.college, s.major, s.grade, s.className || s.class, s.phone || '', s.email || '', s.campus || '华凤校区'], type: sequelize.QueryTypes.INSERT }
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

// Excel文件批量导入学生
const importStudentsFromFile = async (req, res) => {
  try {
    if (!req.file) return error(res, '请上传文件', 400);

    const XLSX = require('xlsx');
    const bcrypt = require('bcryptjs');
    const path = require('path');

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) return error(res, '文件无数据', 400);

    const defaultPassword = bcrypt.hashSync('123456', 10);
    let imported = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 2; // Excel row (1-based, +1 for header)
      const studentId = String(r['学号'] || r['studentId'] || r['student_id'] || '');
      const name = String(r['姓名'] || r['name'] || '');
      const college = String(r['学院'] || r['college'] || '');
      const major = String(r['专业'] || r['major'] || '');
      const grade = String(r['年级'] || r['grade'] || '');
      const className = String(r['班级'] || r['class'] || r['className'] || r['class_name'] || '');
      const phone = String(r['联系方式'] || r['phone'] || '');
      const email = String(r['邮箱'] || r['email'] || '');
      const campus = String(r['校区'] || r['campus'] || '华凤校区');

      if (!studentId || !name) {
        errors.push(`第 ${rowNum} 行：学号或姓名为空，已跳过`);
        continue;
      }

      try {
        const [user, created] = await User.findOrCreate({
          where: { username: studentId },
          defaults: {
            username: studentId,
            password: defaultPassword,
            name,
            role: 'student',
            status: 1,
          },
        });

        if (created || user) {
          const existing = await sequelize.query(
            'SELECT id FROM student_info WHERE user_id = ?',
            { replacements: [user.id], type: sequelize.QueryTypes.SELECT }
          );
          if (!existing.length) {
            await sequelize.query(
              `INSERT INTO student_info (user_id, college, major, grade, class_name, phone, email, campus)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              { replacements: [user.id, college, major, grade, className, phone, email, campus], type: sequelize.QueryTypes.INSERT }
            );
          }
          imported++;
        }
      } catch (e) {
        errors.push(`第 ${rowNum} 行(${name})：${e.message.includes('Duplicate') ? '学号重复' : '导入失败'}`);
      }
    }

    return success(res, {
      imported,
      total: rows.length,
      errors: errors.length ? errors : undefined,
    }, `成功导入 ${imported}/${rows.length} 名学生`);
  } catch (err) {
    console.error('Excel批量导入错误:', err);
    return error(res, 'Excel解析失败，请检查文件格式', 500);
  }
};

module.exports = {
  getStudentList,
  getStudentDetail,
  auditStudent,
  getInfoChangeRequests,
  auditInfoChangeRequest,
  getDifficultyApplications,
  auditDifficultyApplication,
  importStudents,
  importStudentsFromFile,

  // 设置学生部门角色
  setDepartmentRole: async (req, res) => {
    try {
      const { id } = req.params
      const { department, departmentRole } = req.body
      const user = await User.findByPk(id)
      if (!user) return error(res, '用户不存在', 404)
      if (user.role !== 'student') return error(res, '只能为学-生设置部门角色', 400)
      await user.update({ department: department || null, departmentRole: departmentRole || null })
      return success(res, {
        id: user.id, name: user.name, department: user.department, departmentRole: user.departmentRole,
      }, department ? '部门角色已设置' : '部门角色已清除')
    } catch (e) { return error(res, e.message, 500) }
  },

  // 获取部门列表
  getDepartments: async (req, res) => {
    try {
      const departments = [
        { value: '纪检部', label: '纪检部' },
        { value: '学习发展部', label: '学习发展部' },
        { value: '宣传部', label: '宣传部' },
        { value: '素质发展部', label: '素质发展部' },
        { value: '青年志愿者协会', label: '青年志愿者协会（青志协）' },
        { value: '办公室', label: '办公室' },
        { value: '组织部', label: '组织部' },
      ]
      return success(res, departments)
    } catch (e) { return error(res, e.message, 500) }
  },
};
