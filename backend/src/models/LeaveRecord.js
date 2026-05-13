const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const LeaveRecord = sequelize.define('LeaveRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  leave_date: { type: DataTypes.DATEONLY, allowNull: false },
  destination: { type: DataTypes.STRING(255), allowNull: false },
  reason: { type: DataTypes.TEXT },
  expected_return: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  reviewer_id: { type: DataTypes.INTEGER },
  review_comment: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  reviewed_at: { type: DataTypes.DATE },
}, { tableName: 'leave_records', timestamps: false })

module.exports = LeaveRecord
