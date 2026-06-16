const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StudentInfo } = require('../models');
const { success, error } = require('../utils/response');

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, departmentRole: user.departmentRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 用户注册
const register = async (req, res) => {
  try {
    const { username, password, name, phone, college, major, grade, role = 'student' } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return error(res, '用户名已存在', 400);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      role,
      status: 1 // 学生注册后可直接登录
    });

    // 如果是学生，创建学生信息记录
    if (role === 'student') {
      await StudentInfo.create({
        userId: user.id,
        phone: phone || '',
        college: college || '',
        major: major || '',
        grade: grade || '',
        className: '',
      });
    }

    return success(res, {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status
    }, '注册成功');
  } catch (err) {
    console.error('注册错误:', err);
    return error(res, '注册失败', 500);
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return error(res, '用户名或密码错误', 401);
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return error(res, '用户名或密码错误', 401);
    }

    // 检查账号状态
    if (user.status === 0) {
      return error(res, '账号待审核', 403);
    }
    if (user.status === 2) {
      return error(res, '账号已被禁用', 403);
    }

    // 生成 Token
    const token = generateToken(user);

    return success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        departmentRole: user.departmentRole,
      }
    }, '登录成功');
  } catch (err) {
    console.error('登录错误:', err);
    return error(res, '登录失败', 500);
  }
};

// 获取当前用户信息
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'name', 'role', 'status', 'created_at'],
      include: [{
        model: StudentInfo,
        as: 'studentInfo',
        required: false
      }]
    });

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    return success(res, user);
  } catch (err) {
    console.error('获取用户信息错误:', err);
    return error(res, '获取用户信息失败', 500);
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return error(res, '原密码错误', 400);
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await user.update({ password: hashedPassword });

    return success(res, null, '密码修改成功');
  } catch (err) {
    console.error('修改密码错误:', err);
    return error(res, '修改密码失败', 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword
};
