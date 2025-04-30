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
    allowNull: true, // Optional, for course-specific quizzes
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Optional, for subject-wide quizzes
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Associations
Quiz.belongsTo(Cours, { foreignKey: 'cours_id', onDelete: 'CASCADE' });
Quiz.belongsTo(Matiere, { foreignKey: 'matiere_id', onDelete: 'CASCADE' });

module.exports = Quiz;