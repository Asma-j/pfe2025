const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Cours = require('./Cours');
const Utilisateur = require('./Utilisateur');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cours_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date_creation: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
    tableName: 'Quizzes',
});

// Relations
Quiz.belongsTo(Cours, { foreignKey: 'cours_id' });
Cours.hasMany(Quiz, { foreignKey: 'cours_id' });

Quiz.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
Utilisateur.hasMany(Quiz, { foreignKey: 'utilisateur_id' });

module.exports = Quiz;
