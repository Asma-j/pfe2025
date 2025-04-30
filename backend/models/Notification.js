// models/Notification.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Notification = sequelize.define('Notification', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Utilisateurs', // References the Utilisateurs table
      key: 'id',
    },
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Notifications',
  timestamps: true,
});

module.exports = Notification;