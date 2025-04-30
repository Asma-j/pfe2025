// models/Presence.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Planning = require('./Planning');

const Presence = sequelize.define('Presence', {
  utilisateur_id: { type: DataTypes.INTEGER, allowNull: false },
  planning_id: { type: DataTypes.INTEGER, allowNull: false },
  present: { type: DataTypes.BOOLEAN, allowNull: false },
}, { timestamps: false });

Presence.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
Presence.belongsTo(Planning, { foreignKey: 'planning_id' });

module.exports = Presence;