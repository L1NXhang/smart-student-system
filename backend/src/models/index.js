const sequelize = require('../config/database');
const User = require('./User');
const StudentInfo = require('./StudentInfo');

// 建立模型关联
User.hasOne(StudentInfo, {
  foreignKey: 'user_id',
  as: 'studentInfo'
});

StudentInfo.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  StudentInfo
};
