const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const EventRegistration = sequelize.define('EventRegistration', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('registered', 'cancelled', 'attended'), defaultValue: 'registered' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'event_registrations', timestamps: false })

module.exports = EventRegistration
