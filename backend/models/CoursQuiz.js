const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Cours = require('./Cours');
const Quiz = require('./Quiz');

const CoursQuiz = sequelize.define('CoursQuiz', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cours_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: 'CoursQuizzes',
});

// Define relationships
CoursQuiz.belongsTo(Cours, { foreignKey: 'cours_id' });
CoursQuiz.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// Many-to-many relationships
Cours.belongsToMany(Quiz, { through: CoursQuiz, foreignKey: 'cours_id' });
Quiz.belongsToMany(Cours, { through: CoursQuiz, foreignKey: 'quiz_id' });

module.exports = CoursQuiz;