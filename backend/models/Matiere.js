const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Matiere = sequelize.define('Matiere', {
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
    },
    image: {  
        type: DataTypes.STRING,
        allowNull: true,
    },
    niveauId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Niveaux', 
            key: 'id',
        },
    },
}, {
    timestamps: false,
});

module.exports = Matiere;