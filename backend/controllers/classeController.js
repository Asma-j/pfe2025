const Classe = require('../models/Classe');

// ➤ Obtenir toutes les classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Classe.findAll();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des classes", error });
    }
};

// ➤ Obtenir une classe par ID
exports.getClasseById = async (req, res) => {
    try {
        const classe = await Classe.findByPk(req.params.id);
        if (!classe) return res.status(404).json({ message: "Classe non trouvée" });
        res.status(200).json(classe);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la classe", error });
    }
};

// ➤ Ajouter une nouvelle classe
exports.createClasse = async (req, res) => {
    try {
        const classe = await Classe.create(req.body);
        res.status(201).json({ message: "Classe créée avec succès", classe });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de la classe", error });
    }
};

// ➤ Mettre à jour une classe
exports.updateClasse = async (req, res) => {
    try {
        const classe = await Classe.findByPk(req.params.id);
        if (!classe) return res.status(404).json({ message: "Classe non trouvée" });

        await classe.update(req.body);
        res.status(200).json({ message: "Classe mise à jour avec succès", classe });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la classe", error });
    }
};

// ➤ Supprimer une classe
exports.deleteClasse = async (req, res) => {
    try {
        const classe = await Classe.findByPk(req.params.id);
        if (!classe) return res.status(404).json({ message: "Classe non trouvée" });

        await classe.destroy();
        res.status(200).json({ message: "Classe supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la classe", error });
    }
};
