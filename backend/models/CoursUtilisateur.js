const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Cours = require('./Cours');

const CoursUtilisateur = sequelize.define('CoursUtilisateur', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cours_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: false
});

CoursUtilisateur.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
CoursUtilisateur.belongsTo(Cours, { foreignKey: 'cours_id' });
Utilisateur.hasMany(CoursUtilisateur, { foreignKey: 'utilisateur_id' });
Cours.hasMany(CoursUtilisateur, { foreignKey: 'cours_id' });

module.exports = CoursUtilisateur;