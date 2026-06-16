const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const IncidentReport = sequelize.define('IncidentReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  report_type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING(255) },
  contact_phone: { type: DataTypes.STRING(20) },
  images: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  handler_id: { type: DataTypes.INTEGER },
  handle_result: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  handled_at: { type: DataTypes.DATE },
}, { tableName: 'incident_reports', timestamps: false })

module.exports = IncidentReport
