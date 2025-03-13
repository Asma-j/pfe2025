const Role = require('../models/Role');

// Liste des rôles
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ajouter un rôle
exports.addRole = async (req, res) => {
    const { nom_role } = req.body;

    if (!nom_role) {
        return res.status(400).json({ error: "Le nom du rôle est requis" });
    }

    try {
        const role = await Role.create({ nom_role });
        res.json({ message: 'Rôle ajouté avec succès', data: role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
