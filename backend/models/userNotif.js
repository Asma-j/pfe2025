const { sequelize } = require('../db');
const Notification = require('./Notification');
const Utilisateur = require('./Utilisateur');
const Role = require('./Role');

// Define associations
Notification.belongsTo(Utilisateur, { foreignKey: 'userId' });
Utilisateur.hasMany(Notification, { foreignKey: 'userId' });
Utilisateur.belongsTo(Role, { foreignKey: 'id_role' });
Role.hasMany(Utilisateur, { foreignKey: 'id_role' });

// Export models
module.exports = {
  sequelize,
  Notification,
  Utilisateur,
  Role,
};