const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Quiz = require('./Quiz');

const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: 'QuizQuestions',
});

QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id' });

module.exports = QuizQuestion;