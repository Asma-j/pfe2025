const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Classe = require('./Classe');

const UtilisateurClasse = sequelize.define('UtilisateurClasse', {
    utilisateur_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Utilisateur,
            key: 'id',
        },
        primaryKey: true,
    },
    classe_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Classe,
            key: 'id',
        },
        primaryKey: true,
    },
}, {
    timestamps: false,
});

Utilisateur.belongsToMany(Classe, { through: UtilisateurClasse, foreignKey: 'utilisateur_id' });
Classe.belongsToMany(Utilisateur, { through: UtilisateurClasse, foreignKey: 'classe_id' });

module.exports = UtilisateurClasse;