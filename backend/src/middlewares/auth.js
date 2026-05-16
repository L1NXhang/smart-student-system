const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // If this is a student user, try to fetch and cache their student_info id
    if (req.user && req.user.role === 'student') {
      const sequelize = require('../config/database')
      const cacheKey = `student_info_${req.user.id}`
      let studentInfo = sequelize.cacheGet(cacheKey)
      if (!studentInfo) {
        const { StudentInfo } = require('../models')
        studentInfo = await StudentInfo.findOne({ where: { user_id: req.user.id }, attributes: ['id'], raw: true })
        if (studentInfo) {
          sequelize.cacheSet(cacheKey, studentInfo)
        }
      }
      req.studentInfo = studentInfo
    }

    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '令牌无效或已过期' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '权限不足' });
  }
  next();
};

// Allow admin or department head
const eventPublisherMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.departmentRole !== 'head') {
    return res.status(403).json({ code: 403, message: '仅管理员和部门部长可发布活动' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, eventPublisherMiddleware };
