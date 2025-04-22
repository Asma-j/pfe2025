const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Classe = require('./Classe');

const EnseignantClasse = sequelize.define('EnseignantClasse', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    classe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});

// Relations
EnseignantClasse.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
EnseignantClasse.belongsTo(Classe, { foreignKey: 'classe_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Relations inverses
Utilisateur.hasMany(EnseignantClasse, { foreignKey: 'utilisateur_id' });
Classe.hasMany(EnseignantClasse, { foreignKey: 'classe_id' });

module.exports = EnseignantClasse;