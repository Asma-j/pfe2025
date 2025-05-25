
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UtilisateurMatiere = sequelize.define('UtilisateurMatiere', {
  utilisateur_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  timestamps: false,
});

module.exports = UtilisateurMatiere;