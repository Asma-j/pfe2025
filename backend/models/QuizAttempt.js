const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Quiz = require('./Quiz');

const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    answers: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    date_attempt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
    tableName: 'QuizAttempts',
});

QuizAttempt.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });
Utilisateur.hasMany(QuizAttempt, { foreignKey: 'utilisateur_id' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id' });

module.exports = QuizAttempt;