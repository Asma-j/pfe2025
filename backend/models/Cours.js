const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Matiere = require('./Matiere');
const Utilisateur = require('./Utilisateur');

const Cours = sequelize.define('Cours', {
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
        allowNull: false,
    },
    prix: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    module: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Payé', 'Gratuit'),
        allowNull: false,
    },
    date_creation: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    matiere_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
});

Cours.belongsTo(Matiere, { foreignKey: 'matiere_id' });
Cours.belongsTo(Utilisateur, { foreignKey: 'created_by', as: 'Creator' });

module.exports = Cours;