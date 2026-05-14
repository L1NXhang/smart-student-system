const { User, StudentInfo, sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

// 获取学生详细信息
const getStudentInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentInfo = await StudentInfo.findOne({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'name', 'role', 'status']
      }]
    });

    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 获取家庭信息
    const familyInfo = await sequelize.query(
      'SELECT * FROM family_info WHERE student_id = ?',
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return success(res, {
      ...studentInfo.toJSON(),
      familyInfo
    });
  } catch (err) {
    console.error('获取学生信息错误:', err);
    return error(res, '获取学生信息失败', 500);
  }
};

// 更新学生信息（学生自己修改部分字段）
const updateStudentInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, hobbies, personality, careerGoal } = req.body;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    await studentInfo.update({
      phone: phone || studentInfo.phone,
      hobbies: hobbies || studentInfo.hobbies,
      personality: personality || studentInfo.personality,
      careerGoal: careerGoal || studentInfo.careerGoal
    });

    return success(res, studentInfo, '更新成功');
  } catch (err) {
    console.error('更新学生信息错误:', err);
    return error(res, '更新学生信息失败', 500);
  }
};

// 提交信息变更申请
const submitInfoChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldName, oldValue, newValue, reason } = req.body;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 插入变更申请
    await sequelize.query(
      `INSERT INTO info_change_requests (student_id, field_name, old_value, new_value, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [studentInfo.id, fieldName, oldValue, newValue, reason],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '变更申请已提交，请等待审核');
  } catch (err) {
    console.error('提交信息变更申请错误:', err);
    return error(res, '提交变更申请失败', 500);
  }
};

// 获取信息变更申请列表
const getInfoChangeRequests = async (req, res) => {
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
      `SELECT COUNT(*) as total FROM info_change_requests WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT * FROM info_change_requests WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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

// 提交困难认定申请
const submitDifficultyApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, reason } = req.body;
    const materialPath = req.file ? `/uploads/${req.file.filename}` : null;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    // 检查是否已有待审核的申请
    const existing = await sequelize.query(
      `SELECT * FROM difficulty_applications WHERE student_id = ? AND status = 'pending'`,
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) {
      return error(res, '已有待审核的困难认定申请', 400);
    }

    // 插入申请
    await sequelize.query(
      `INSERT INTO difficulty_applications (student_id, level, reason, material_path, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      {
        replacements: [studentInfo.id, level, reason, materialPath],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, null, '困难认定申请已提交');
  } catch (err) {
    console.error('提交困难认定申请错误:', err);
    return error(res, '提交困难认定申请失败', 500);
  }
};

// 获取困难认定申请状态
const getDifficultyApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) {
      return error(res, '学生信息不存在', 404);
    }

    const applications = await sequelize.query(
      `SELECT * FROM difficulty_applications WHERE student_id = ? ORDER BY created_at DESC`,
      {
        replacements: [studentInfo.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return success(res, applications);
  } catch (err) {
    console.error('获取困难认定申请错误:', err);
    return error(res, '获取困难认定申请失败', 500);
  }
};

// 上传学生照片
const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) return error(res, '学生信息不存在', 404);
    if (!req.file) return error(res, '请选择照片', 400);

    const photoPath = `/uploads/${req.file.filename}`;
    await studentInfo.update({ photo: photoPath });
    return success(res, { photo: photoPath }, '照片上传成功');
  } catch (err) {
    console.error('上传照片错误:', err);
    return error(res, '上传照片失败', 500);
  }
};

// 批量提交信息变更申请
const batchSubmitInfoChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { changes } = req.body;

    if (!changes || !changes.length) {
      return error(res, '请提供变更信息', 400);
    }

    const studentInfo = await StudentInfo.findOne({ where: { userId } });
    if (!studentInfo) return error(res, '学生信息不存在', 404);

    for (const change of changes) {
      if (!change.newValue || change.newValue === change.oldValue) continue;
      await sequelize.query(
        `INSERT INTO info_change_requests (student_id, field_name, old_value, new_value, reason, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
        {
          replacements: [studentInfo.id, change.fieldLabel, change.oldValue || '', change.newValue, change.reason || '信息更新'],
          type: sequelize.QueryTypes.INSERT
        }
      );
    }

    return success(res, null, `已提交 ${changes.length} 项变更申请，请等待审核`);
  } catch (err) {
    console.error('批量提交信息变更错误:', err);
    return error(res, '提交变更申请失败', 500);
  }
};

module.exports = {
  getStudentInfo,
  updateStudentInfo,
  submitInfoChange,
  getInfoChangeRequests,
  submitDifficultyApplication,
  getDifficultyApplication,
  uploadPhoto,
  batchSubmitInfoChange,
};
