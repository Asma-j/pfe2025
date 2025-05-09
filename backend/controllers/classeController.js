const Classe = require('../models/Classe');
const Niveau = require('../models/Niveau');

// ➤ Obtenir toutes les classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Classe.findAll({
            include: [{ model: Niveau, attributes: ['id', 'nom'] }],
        });
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des classes", error });
    }
};

// ➤ Obtenir une classe par ID
exports.getClasseById = async (req, res) => {
    try {
        const classe = await Classe.findByPk(req.params.id, {
            include: [{ model: Niveau, attributes: ['id', 'nom'] }],
        });
        if (!classe) return res.status(404).json({ message: "Classe non trouvée" });
        res.status(200).json(classe);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la classe", error });
    }
};

// ➤ Obtenir les classes par niveau ID
exports.getClassesByNiveauId = async (req, res) => {
    try {
        const niveauId = req.params.niveauId;
        const classes = await Classe.findAll({
            where: { niveau_id: niveauId },
            include: [{ model: Niveau, attributes: ['nom'] }],
        });
        if (!classes.length) {
            return res.status(404).json({ message: "Aucune classe trouvée pour ce niveau" });
        }
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des classes pour ce niveau", error: error.message });
    }
};

// ➤ Ajouter une nouvelle classe
exports.createClasse = async (req, res) => {
    try {
        const classe = await Classe.create(req.body);
        const classeWithNiveau = await Classe.findByPk(classe.id, {
            include: [{ model: Niveau, attributes: ['id', 'nom'] }],
        });
        res.status(201).json({ message: "Classe créée avec succès", classe: classeWithNiveau });
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
        const updatedClasse = await Classe.findByPk(classe.id, {
            include: [{ model: Niveau, attributes: ['id', 'nom'] }],
        });
        res.status(200).json({ message: "Classe mise à jour avec succès", classe: updatedClasse });
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