
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UtilisateurClasse = sequelize.define('UtilisateurClasse', {
  utilisateur_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  classe_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  timestamps: false,
});

module.exports = UtilisateurClasse;