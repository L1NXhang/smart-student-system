const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const SafetyQuestion = sequelize.define('SafetyQuestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  exam_id: { type: DataTypes.INTEGER, allowNull: false },
  question: { type: DataTypes.TEXT, allowNull: false },
  question_type: { type: DataTypes.ENUM('single', 'multiple'), defaultValue: 'single' },
  options: { type: DataTypes.TEXT, allowNull: false },
  answer: { type: DataTypes.STRING(50), allowNull: false },
  score: { type: DataTypes.INTEGER, defaultValue: 5 },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'safety_questions', timestamps: false })

module.exports = SafetyQuestion
