const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Cours = require('./Cours');

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
    }
}, {
    timestamps: false
});


Planning.belongsTo(Cours, { foreignKey: 'cours_id' });

module.exports = Planning;
