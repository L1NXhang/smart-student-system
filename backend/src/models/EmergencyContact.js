const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const EmergencyContact = sequelize.define('EmergencyContact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
  name: { type: DataTypes.STRING(50), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  relation: { type: DataTypes.STRING(30), allowNull: false },
  isPrimary: { type: DataTypes.TINYINT, defaultValue: 0, field: 'is_primary' },
}, {
  tableName: 'emergency_contacts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})

module.exports = EmergencyContact
