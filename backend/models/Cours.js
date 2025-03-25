const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

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
}, {
    timestamps: false
});

module.exports = Cours;
