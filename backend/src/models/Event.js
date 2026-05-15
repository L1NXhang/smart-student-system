const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  event_type: { type: DataTypes.ENUM('academic', 'sports', 'volunteer', 'culture', 'other'), defaultValue: 'other' },
  hours_type: { type: DataTypes.STRING(20), allowNull: true, field: 'hours_type', comment: '学时类型' },
  event_date: { type: DataTypes.DATE },
  location: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT },
  quota: { type: DataTypes.INTEGER },
  deadline: { type: DataTypes.DATE },
  publisher_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.TINYINT, defaultValue: 1 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'events', timestamps: false })

module.exports = Event
