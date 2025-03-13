const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');

//  Liste des utilisateurs avec leur rôle
exports.getUsers = async (req, res) => {
    try {
        const users = await Utilisateur.findAll({ include: Role });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ajouter un utilisateur (sans inscription)
exports.addUser = async (req, res) => {
    const { prenom, nom, email, mot_de_passe, id_role } = req.body;

    if (!prenom || !nom || !email || !mot_de_passe || !id_role) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    try {
        const user = await Utilisateur.create({ prenom, nom, email, mot_de_passe, id_role });
        res.json({ message: 'Utilisateur ajouté avec succès', data: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
