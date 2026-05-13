const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(100), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  feedback_type: { type: DataTypes.ENUM('suggestion', 'complaint', 'inquiry', 'other'), defaultValue: 'other' },
  images: { type: DataTypes.TEXT },
  reply: { type: DataTypes.TEXT },
  replier_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('pending', 'replied'), defaultValue: 'pending' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  replied_at: { type: DataTypes.DATE },
}, { tableName: 'feedbacks', timestamps: false })

module.exports = Feedback
