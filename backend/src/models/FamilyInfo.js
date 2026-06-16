const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const FamilyInfo = sequelize.define('FamilyInfo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
  memberType: { type: DataTypes.STRING(20), field: 'member_type', comment: '父亲/母亲/兄弟姐妹' },
  name: { type: DataTypes.STRING(50), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  relation: { type: DataTypes.STRING(30) },
}, {
  tableName: 'family_info',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})

module.exports = FamilyInfo
