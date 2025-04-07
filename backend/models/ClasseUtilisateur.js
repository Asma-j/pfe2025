const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Utilisateur = require('./Utilisateur');
const Classe = require('./Classe');

const ClasseUtilisateur = sequelize.define('ClasseUtilisateur', {
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
    }
}, {
    timestamps: false
});

ClasseUtilisateur.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
ClasseUtilisateur.belongsTo(Classe, { foreignKey: 'classe_id' });
Utilisateur.hasMany(ClasseUtilisateur, { foreignKey: 'utilisateur_id' });
Classe.hasMany(ClasseUtilisateur, { foreignKey: 'classe_id' });

module.exports = ClasseUtilisateur;