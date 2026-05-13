const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const SafetyExamRecord = sequelize.define('SafetyExamRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  exam_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  answers: { type: DataTypes.TEXT },
  score: { type: DataTypes.INTEGER },
  is_passed: { type: DataTypes.TINYINT },
  duration: { type: DataTypes.INTEGER },
  ip_address: { type: DataTypes.STRING(50) },
  submitted_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'safety_exam_records', timestamps: false })

module.exports = SafetyExamRecord
