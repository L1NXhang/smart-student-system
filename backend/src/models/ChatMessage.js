const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: true },
  message_type: { type: DataTypes.ENUM('text', 'image', 'file'), defaultValue: 'text' },
  file_url: { type: DataTypes.STRING(500) },
  file_name: { type: DataTypes.STRING(255) },
  file_size: { type: DataTypes.INTEGER },
  is_read: { type: DataTypes.TINYINT, defaultValue: 0 },
  read_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'chat_messages', timestamps: false })

module.exports = ChatMessage
