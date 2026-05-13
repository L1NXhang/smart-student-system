const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const LateReturnRecord = sequelize.define('LateReturnRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  return_date: { type: DataTypes.DATEONLY, allowNull: false },
  expected_time: { type: DataTypes.TIME },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  reviewer_id: { type: DataTypes.INTEGER },
  review_comment: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  reviewed_at: { type: DataTypes.DATE },
}, { tableName: 'late_return_records', timestamps: false })

module.exports = LateReturnRecord
