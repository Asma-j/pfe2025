const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Matiere = require('./Matiere');
const Utilisateur = require('./Utilisateur');
const Niveau = require('./Niveau');

const Cours = sequelize.define('Cours', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 255], // Minimum 3, maximum 255 characters
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    prix: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0, // Price cannot be negative
        },
    },
    module: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100],
        },
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
    files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    video: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    niveau_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
    indexes: [
        { fields: ['matiere_id'] },
        { fields: ['niveau_id'] },
        { fields: ['created_by'] },
    ],
});

Cours.belongsTo(Matiere, { foreignKey: 'matiere_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Cours.belongsTo(Utilisateur, { foreignKey: 'created_by', as: 'Creator', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Cours.belongsTo(Niveau, { foreignKey: 'niveau_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = Cours;