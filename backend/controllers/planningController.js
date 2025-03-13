const Planning = require('../models/Planning');

// 📌 Créer un planning
exports.createPlanning = async (req, res) => {
  try {
    const { titre, date_debut, date_fin, cours_id } = req.body;
    const newPlanning = await Planning.create({ titre, date_debut, date_fin, cours_id });
    res.status(201).json({ message: "Planning créé avec succès", planning: newPlanning });
  } catch (error) {
    console.error("Erreur lors de la création du planning:", error);
    res.status(500).json({ message: "Erreur lors de la création du planning", error });
  }
};

// 📌 Récupérer tous les plannings
exports.getAllPlannings = async (req, res) => {
  try {
    const plannings = await Planning.findAll();
    res.status(200).json(plannings);
  } catch (error) {
    console.error("Erreur lors de la récupération des plannings:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des plannings", error });
  }
};

// 📌 Récupérer un planning par ID
exports.getPlanningById = async (req, res) => {
  try {
    const planning = await Planning.findByPk(req.params.id);
    if (!planning) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }
    res.status(200).json(planning);
  } catch (error) {
    console.error("Erreur lors de la récupération du planning:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du planning", error });
  }
};

// 📌 Mettre à jour un planning
exports.updatePlanning = async (req, res) => {
  try {
    const { titre, date_debut, date_fin, cours_id } = req.body;
    const updated = await Planning.update(
      { titre, date_debut, date_fin, cours_id },
      { where: { id: req.params.id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    res.status(200).json({ message: "Planning mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du planning:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du planning", error });
  }
};

// 📌 Supprimer un planning
exports.deletePlanning = async (req, res) => {
  try {
    const deleted = await Planning.destroy({ where: { id: req.params.id } });

    if (deleted === 0) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    res.status(200).json({ message: "Planning supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du planning:", error);
    res.status(500).json({ message: "Erreur lors de la suppression du planning", error });
  }
};
