const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Cours = require('./Cours');

const Paiement = sequelize.define('Paiement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    montant: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    date_paiement: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    methode_paiement: {
        type: DataTypes.ENUM('Carte', 'Paypal', 'Virement', 'Espèces'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('En attente', 'Complété', 'Échoué'),
        defaultValue: 'En attente',
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

module.exports = Paiement;