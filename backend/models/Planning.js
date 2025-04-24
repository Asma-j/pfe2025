const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Cours = require('./Cours');
const Classe = require('./Classe');

const Planning = sequelize.define('Planning', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    cours_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    classe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('Planifié', 'En cours', 'Terminé', 'Annulé'),
        allowNull: false,
        defaultValue: 'Planifié',
    },
    meetingNumber: { // New field for Zoom meeting number
        type: DataTypes.STRING,
        allowNull: true,
    },
    joinUrl: { // New field for Zoom join URL
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: { // New field for Zoom meeting password
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
    indexes: [
        { fields: ['cours_id'] },
        { fields: ['classe_id'] },
    ],
});

// Relations
Planning.belongsTo(Cours, { foreignKey: 'cours_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Planning.belongsTo(Classe, { foreignKey: 'classe_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = Planning;