const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Role = require('./Role');


const Utilisateur = sequelize.define('Utilisateur', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    prenom: {
        type: DataTypes.STRING,
    
    },
    nom: {
        type: DataTypes.STRING,
    
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: { msg: "L'email n'est pas valide" } }
    },
    mot_de_passe: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Le mot de passe est obligatoire" } }
    },id_role: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    photo: {
        type: DataTypes.STRING, 
        allowNull: true,         
    },
}, {
    timestamps: false
});

Utilisateur.belongsTo(Role, { foreignKey: 'id_role' });

module.exports = Utilisateur;
