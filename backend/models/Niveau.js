const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Niveau = sequelize.define('Niveau', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: false
});

module.exports = Niveau;