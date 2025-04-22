const Planning = require('../models/Planning');
const Cours = require('../models/Cours');
const Classe = require('../models/Classe');
const Utilisateur = require('../models/Utilisateur');

// 📌 Créer un planning
exports.createPlanning = async (req, res) => {
  try {
    const { titre, date_debut, date_fin, cours_id, classe_id, statut } = req.body;

    // Validation des champs obligatoires
    if (!titre || !date_debut || !date_fin || !cours_id || !classe_id) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis" });
    }

    // Vérifier si le cours existe
    const cours = await Cours.findByPk(cours_id);
    if (!cours) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    // Vérifier si la classe existe
    const classe = await Classe.findByPk(classe_id);
    if (!classe) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }

    // Vérifier la cohérence des dates
    if (new Date(date_debut) >= new Date(date_fin)) {
      return res.status(400).json({ message: "La date de début doit être antérieure à la date de fin" });
    }

    // Créer le planning
    const newPlanning = await Planning.create({
      titre,
      date_debut,
      date_fin,
      cours_id,
      classe_id,
      statut: statut || 'Planifié', // Valeur par défaut si non fourni
    });

    res.status(201).json({ message: "Planning créé avec succès", planning: newPlanning });
  } catch (error) {
    console.error("Erreur lors de la création du planning:", error);
    res.status(500).json({ message: "Erreur lors de la création du planning", error: error.message });
  }
};

// 📌 Récupérer tous les plannings
exports.getAllPlannings = async (req, res) => {
  try {
    const plannings = await Planning.findAll({
      include: [
        {
          model: Cours,
          attributes: ['id', 'titre'], // Inclure uniquement les champs nécessaires
          include: [
            {
              model: Utilisateur,
              as: 'Creator', // Utiliser l'alias défini dans l'association
              attributes: ['id', 'nom'], // Récupérer le nom de l'enseignant
            },
          ],
        },
        {
          model: Classe,
          attributes: ['id', 'nom'], // Inclure uniquement les champs nécessaires
        },
      ],
      attributes: ['id', 'titre', 'date_debut', 'date_fin', 'statut'],
    });
    res.status(200).json(plannings);
  } catch (error) {
    console.error("Erreur lors de la récupération des plannings:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des plannings", error: error.message });
  }
};
// 📌 Récupérer un planning par ID
exports.getPlanningById = async (req, res) => {
  try {
    const planning = await Planning.findByPk(req.params.id, {
      include: [
        {
          model: Cours,
          attributes: ['id', 'titre'],
        },
        {
          model: Classe,
          attributes: ['id', 'nom'],
        },
      ],
      attributes: ['id', 'titre', 'date_debut', 'date_fin', 'statut', 'createdAt', 'updatedAt'],
    });

    if (!planning) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    res.status(200).json(planning);
  } catch (error) {
    console.error("Erreur lors de la récupération du planning:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du planning", error: error.message });
  }
};

// 📌 Mettre à jour un planning
exports.updatePlanning = async (req, res) => {
  try {
    const { titre, date_debut, date_fin, cours_id, classe_id, statut } = req.body;

    // Vérifier si le planning existe
    const planning = await Planning.findByPk(req.params.id);
    if (!planning) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    // Vérifier si le cours existe (si fourni)
    if (cours_id) {
      const cours = await Cours.findByPk(cours_id);
      if (!cours) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }
    }

    // Vérifier si la classe existe (si fournie)
    if (classe_id) {
      const classe = await Classe.findByPk(classe_id);
      if (!classe) {
        return res.status(404).json({ message: "Classe non trouvée" });
      }
    }

    // Vérifier la cohérence des dates (si fournies)
    if (date_debut && date_fin && new Date(date_debut) >= new Date(date_fin)) {
      return res.status(400).json({ message: "La date de début doit être antérieure à la date de fin" });
    }

    // Mettre à jour le planning
    const updated = await Planning.update(
      {
        titre: titre || planning.titre,
        date_debut: date_debut || planning.date_debut,
        date_fin: date_fin || planning.date_fin,
        cours_id: cours_id || planning.cours_id,
        classe_id: classe_id || planning.classe_id,
        statut: statut || planning.statut,
      },
      { where: { id: req.params.id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Aucune modification effectuée" });
    }

    res.status(200).json({ message: "Planning mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du planning:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du planning", error: error.message });
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
    res.status(500).json({ message: "Erreur lors de la suppression du planning", error: error.message });
  }
};