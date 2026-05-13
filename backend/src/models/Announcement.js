const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('class', 'grade', 'all'), allowNull: false },
  target: { type: DataTypes.STRING(100) },
  publisher_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.TINYINT, defaultValue: 1 },
  view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'announcements', timestamps: false })

module.exports = Announcement
