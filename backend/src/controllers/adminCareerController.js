const { sequelize } = require('../models');
const { success, error, paginate } = require('../utils/response');

// 获取预约列表（管理员）
const getAppointments = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM career_appointments a WHERE ${whereClause}`,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const list = await sequelize.query(
      `SELECT a.*, u.name as student_name, u.username as student_username
       FROM career_appointments a
       LEFT JOIN student_info s ON a.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY a.appointment_date DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...params, parseInt(pageSize), offset],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return paginate(res, list, total, parseInt(page), parseInt(pageSize));
  } catch (err) {
    console.error('获取预约列表错误:', err);
    return error(res, '获取预约列表失败', 500);
  }
};

// 确认预约（管理员）
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviewerId = req.user.id;

    await sequelize.query(
      `UPDATE career_appointments SET status = ?, reviewer_id = ?, confirmed_at = NOW() WHERE id = ?`,
      {
        replacements: [status, reviewerId, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, status === 'confirmed' ? '已确认' : '已取消');
  } catch (err) {
    console.error('确认预约错误:', err);
    return error(res, '确认预约失败', 500);
  }
};

// 发布就业信息（管理员）
const createJobInfo = async (req, res) => {
  try {
    const { title, content, jobType, companyName, position, salary, location, contactInfo, deadline } = req.body;
    const publisherId = req.user.id;

    const result = await sequelize.query(
      `INSERT INTO job_infos (title, content, job_type, company_name, position, salary, location, contact_info, deadline, publisher_id, status, view_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())`,
      {
        replacements: [title, content, jobType, companyName, position, salary, location, contactInfo, deadline, publisherId],
        type: sequelize.QueryTypes.INSERT
      }
    );

    return success(res, { id: result[0] }, '发布成功');
  } catch (err) {
    console.error('发布就业信息错误:', err);
    return error(res, '发布就业信息失败', 500);
  }
};

// 更新就业信息（管理员）
const updateJobInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, jobType, companyName, position, salary, location, contactInfo, deadline, status } = req.body;

    await sequelize.query(
      `UPDATE job_infos 
       SET title = ?, content = ?, job_type = ?, company_name = ?, position = ?, salary = ?, location = ?, contact_info = ?, deadline = ?, status = ?
       WHERE id = ?`,
      {
        replacements: [title, content, jobType, companyName, position, salary, location, contactInfo, deadline, status, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return success(res, null, '更新成功');
  } catch (err) {
    console.error('更新就业信息错误:', err);
    return error(res, '更新就业信息失败', 500);
  }
};

// 删除就业信息（管理员）
const deleteJobInfo = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      'DELETE FROM job_infos WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.DELETE
      }
    );

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除就业信息错误:', err);
    return error(res, '删除就业信息失败', 500);
  }
};

module.exports = {
  getAppointments,
  confirmAppointment,
  createJobInfo,
  updateJobInfo,
  deleteJobInfo
};
