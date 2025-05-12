const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Niveau = require('./Niveau');

const Classe = sequelize.define('Classe', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  niveau_id: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: false });

Classe.belongsTo(Niveau, { foreignKey: 'niveau_id' });



module.exports = Classe;