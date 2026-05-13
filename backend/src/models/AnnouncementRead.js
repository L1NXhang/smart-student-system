const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const AnnouncementRead = sequelize.define('AnnouncementRead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  announcement_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  read_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'announcement_reads', timestamps: false })

module.exports = AnnouncementRead
