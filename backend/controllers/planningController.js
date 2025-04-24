const Planning = require('../models/Planning');
const Cours = require('../models/Cours');
const Classe = require('../models/Classe');
const Utilisateur = require('../models/Utilisateur');
const UtilisateurClasse = require('../models/UtilisateurClasse');

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
    const { cours_id, utilisateur_id } = req.query;

    const where = {};
    if (cours_id) {
      where.cours_id = cours_id;
    }

    const include = [
      {
        model: Cours,
        attributes: ['id', 'titre'],
        include: [
          {
            model: Utilisateur,
            as: 'Creator',
            attributes: ['id', 'nom'],
          },
        ],
      },
      {
        model: Classe,
        attributes: ['id', 'nom'],
      },
    ];

    if (utilisateur_id) {
      const userClasses = await UtilisateurClasse.findAll({
        where: { utilisateur_id },
        attributes: ['classe_id'],
      });
      const classeIds = userClasses.map((uc) => uc.classe_id);
      console.log('Classes de l\'utilisateur:', classeIds);

      if (classeIds.length === 0) {
        return res.status(200).json([]);
      }

      include[1].where = { id: classeIds };
    }

    const plannings = await Planning.findAll({
      where,
      include,
      attributes: [
        'id',
        'titre',
        'date_debut',
        'date_fin',
        'statut',
        'meetingNumber',
        'joinUrl',
        'password',
      ],
    });

    console.log('Plannings récupérés:', plannings);
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
exports.updatePlanningStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const planning = await Planning.findByPk(id);
    if (!planning) {
      return res.status(404).json({ message: "Planning non trouvé" });
    }

    planning.statut = statut;
    await planning.save();

    res.status(200).json({ message: "Statut du planning mis à jour", planning });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du planning:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut", error: error.message });
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