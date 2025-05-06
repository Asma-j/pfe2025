const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Cours = require('./Cours');
const Matiere = require('./Matiere');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cours_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timeTaken: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  setDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
}, {
  timestamps: true,
});

Quiz.belongsTo(Cours, { foreignKey: 'cours_id', onDelete: 'CASCADE' });
Quiz.belongsTo(Matiere, { foreignKey: 'matiere_id', onDelete: 'CASCADE' });

module.exports = Quiz;