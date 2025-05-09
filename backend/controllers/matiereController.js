const Matiere = require('../models/Matiere');

// ➤ Obtenir toutes les matières
exports.getAllMatieres = async (req, res) => {
  try {
    const matieres = await Matiere.findAll();
    res.status(200).json(matieres);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des matières", error });
  }
};

// ➤ Obtenir une matière par ID
exports.getMatiereById = async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: "Matière non trouvée" });
    res.status(200).json(matiere);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la matière", error });
  }
};

// ➤ Créer une matière
exports.createMatiere = async (req, res) => {
  try {
    console.log('Uploaded files:', req.files); // Debug log
    const { nom, description } = req.body;
    if (!nom) {
      return res.status(400).json({ message: "Le nom est requis" });
    }
    const image = req.files && req.files.image ? req.files.image[0].filename : null;
    const matiere = await Matiere.create({ nom, description, image });
    res.status(201).json({ message: "Matière créée avec succès", matiere });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la matière", error });
  }
};

// ➤ Mettre à jour une matière
exports.updateMatiere = async (req, res) => {
  try {
    console.log('Uploaded files:', req.files); // Debug log
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: "Matière non trouvée" });

    const { nom, description } = req.body;
    if (!nom) {
      return res.status(400).json({ message: "Le nom est requis" });
    }
    const image = req.files && req.files.image ? req.files.image[0].filename : matiere.image;

    await matiere.update({ nom, description, image });
    res.status(200).json({ message: "Matière mise à jour avec succès", matiere });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la matière", error });
  }
};

// ➤ Supprimer une matière
exports.deleteMatiere = async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: "Matière non trouvée" });

    await matiere.destroy();
    res.status(200).json({ message: "Matière supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la matière", error });
  }
};