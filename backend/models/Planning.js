const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Cours = require('./Cours');
const Classe = require('./Classe'); // Ajout de la référence à Classe

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
    },statut: {
        type: DataTypes.ENUM('Planifié', 'En cours', 'Terminé', 'Annulé'),
        allowNull: false,
        defaultValue: 'Planifié',
    },
  
}, {
    timestamps: false, 
    indexes: [
        { fields: ['cours_id'] },
        { fields: ['classe_id'] }, // Index pour optimiser les requêtes sur classe_id
    ],
});

// Relations
Planning.belongsTo(Cours, { foreignKey: 'cours_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Planning.belongsTo(Classe, { foreignKey: 'classe_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });


module.exports = Planning;