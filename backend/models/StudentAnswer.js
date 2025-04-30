const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const QuizQuestion = require('./QuizQuestion');

const StudentAnswer = sequelize.define('StudentAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  selected_option: {
    type: DataTypes.INTEGER,
    allowNull: false, // Index of selected option
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false, // 1 for correct, 0 for incorrect
  },
}, {
  timestamps: true,
});

StudentAnswer.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', onDelete: 'CASCADE' });
StudentAnswer.belongsTo(QuizQuestion, { foreignKey: 'question_id', onDelete: 'CASCADE' });

module.exports = StudentAnswer;