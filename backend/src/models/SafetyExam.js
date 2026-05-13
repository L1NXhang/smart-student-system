const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const SafetyExam = sequelize.define('SafetyExam', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  duration: { type: DataTypes.INTEGER, defaultValue: 30 },
  pass_score: { type: DataTypes.INTEGER, defaultValue: 60 },
  total_score: { type: DataTypes.INTEGER, defaultValue: 100 },
  status: { type: DataTypes.TINYINT, defaultValue: 1 },
  publisher_id: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'safety_exams', timestamps: false })

module.exports = SafetyExam
