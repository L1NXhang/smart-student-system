const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名（学号/工号）'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（bcrypt加密）'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '姓名'
  },
  role: {
    type: DataTypes.ENUM('student', 'admin'),
    allowNull: false,
    defaultValue: 'student',
    comment: '角色：student-学生, admin-管理员'
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '所属部门'
  },
  departmentRole: {
    type: DataTypes.ENUM('head', 'member'),
    allowNull: true,
    field: 'department_role',
    comment: '部门角色：head-部长, member-成员'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态：0-待审核, 1-正常, 2-禁用'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: '用户表'
});

module.exports = User;
