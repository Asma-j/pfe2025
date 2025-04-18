const Niveau = require('../models/Niveau');

// ➤ Obtenir tous les niveaux
exports.getAllNiveaux = async (req, res) => {
    try {
        const niveaux = await Niveau.findAll();
        res.status(200).json(niveaux);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des niveaux", error: error.message });
    }
};

// ➤ Obtenir un niveau par ID
exports.getNiveauById = async (req, res) => {
    try {
        const niveau = await Niveau.findByPk(req.params.id);
        if (!niveau) {
            return res.status(404).json({ message: "Niveau non trouvé" });
        }
        res.status(200).json(niveau);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du niveau", error: error.message });
    }
};

// ➤ Ajouter un nouveau niveau
exports.createNiveau = async (req, res) => {
    try {
        const { nom, description } = req.body;
        if (!nom) {
            return res.status(400).json({ message: "Le nom du niveau est requis" });
        }
        const niveau = await Niveau.create({ nom, description });
        res.status(201).json({ message: "Niveau créé avec succès", niveau });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du niveau", error: error.message });
    }
};

// ➤ Mettre à jour un niveau
exports.updateNiveau = async (req, res) => {
    try {
        const niveau = await Niveau.findByPk(req.params.id);
        if (!niveau) {
            return res.status(404).json({ message: "Niveau non trouvé" });
        }
        const { nom, description } = req.body;
        await niveau.update({ nom, description });
        res.status(200).json({ message: "Niveau mis à jour avec succès", niveau });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du niveau", error: error.message });
    }
};

// ➤ Supprimer un niveau
exports.deleteNiveau = async (req, res) => {
    try {
        const niveau = await Niveau.findByPk(req.params.id);
        if (!niveau) {
            return res.status(404).json({ message: "Niveau non trouvé" });
        }
        await niveau.destroy();
        res.status(200).json({ message: "Niveau supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du niveau", error: error.message });
    }
};