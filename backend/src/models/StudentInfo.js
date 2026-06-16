const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentInfo = sequelize.define('StudentInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '关联用户ID'
  },
  photo: {
    type: DataTypes.STRING(255),
    comment: '照片路径'
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '联系方式'
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱'
  },
  idCard: {
    type: DataTypes.STRING(18),
    field: 'id_card',
    comment: '身份证号'
  },
  college: {
    type: DataTypes.STRING(100),
    comment: '学院'
  },
  major: {
    type: DataTypes.STRING(100),
    comment: '专业'
  },
  grade: {
    type: DataTypes.STRING(20),
    comment: '年级'
  },
  className: {
    type: DataTypes.STRING(50),
    field: 'class_name',
    comment: '班级'
  },
  campus: {
    type: DataTypes.STRING(50),
    comment: '校区'
  },
  dormitory: {
    type: DataTypes.STRING(50),
    comment: '宿舍号'
  },
  offCampusAddress: {
    type: DataTypes.STRING(255),
    field: 'off_campus_address',
    comment: '校外住宿地址'
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    field: 'medical_history',
    comment: '病史'
  },
  hobbies: {
    type: DataTypes.TEXT,
    comment: '爱好'
  },
  personality: {
    type: DataTypes.TEXT,
    comment: '性格特征'
  },
  careerGoal: {
    type: DataTypes.TEXT,
    field: 'career_goal',
    comment: '职业目标'
  },
  classTeacher: {
    type: DataTypes.STRING(50),
    field: 'class_teacher',
    comment: '班主任姓名'
  },
  classTeacherPhone: {
    type: DataTypes.STRING(20),
    field: 'class_teacher_phone',
    comment: '班主任联系方式'
  },
  difficultyLevel: {
    type: DataTypes.STRING(20),
    field: 'difficulty_level',
    comment: '困难认定等级'
  },
  difficultyMaterial: {
    type: DataTypes.STRING(255),
    field: 'difficulty_material',
    comment: '困难认定证明材料路径'
  },
  difficultyStatus: {
    type: DataTypes.STRING(20),
    field: 'difficulty_status',
    defaultValue: 'none',
    comment: '困难认定状态'
  }
}, {
  tableName: 'student_info',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: '学生详细信息表'
});

module.exports = StudentInfo;
