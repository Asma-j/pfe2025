const Course = require('../models/Cours'); 
const Matiere = require('../models/Matiere');
const fs = require('fs');
const path = require('path');

exports.createCourse = async (req, res) => {
  try {
    const { titre, description, prix, module, status, matiere_id } = req.body; // Ajouter matiere_id
    const image = req.file ? req.file.filename : null; // Gérer l'image uploadée

    // Vérifier que matiere_id est fourni
    if (!matiere_id) {
      return res.status(400).json({ message: 'Le champ matiere_id est requis' });
    }

    const newCourse = new Course({
      titre,
      description,
      prix,
      module,
      status,
      matiere_id, // Inclure matiere_id
      image,
    });

    await newCourse.save();
    res.status(201).json({ message: 'Cours créé avec succès', course: newCourse });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la création du cours', error });
  }
};

// Récupérer tous les cours


exports.getAllCourses = async (req, res) => {
  try {
    const { matiere_id } = req.query; 
    const whereClause = matiere_id ? { matiere_id } : {};
    const courses = await Course.findAll({
      where: whereClause,
      include: [{ model: Matiere, attributes: ['nom'] }], // Inclure le nom de la matière
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des cours", error });
  }
};
  

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ where: { id: req.params.id } }); // Use findOne instead of findById
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.status(200).json(course); // Returns a single object
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du cours', error });
  }
};




exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, prix, module, status, matiere_id } = req.body;
    const newImage = req.file ? req.file.filename : null; // Nouvelle image uploadée

    // Récupérer l'ancien cours pour vérifier l'image existante
    const oldCourse = await Course.findByPk(id);
    if (!oldCourse) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    // Déterminer l'image à utiliser
    let imageToUse = oldCourse.image; // Par défaut, conserver l'image existante
    if (newImage) {
      // Si une nouvelle image est uploadée, utiliser celle-ci
      imageToUse = newImage;

      // Supprimer l'ancienne image si elle existe
      if (oldCourse.image) {
        const oldImagePath = path.join(__dirname, '../uploads', oldCourse.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Mettre à jour le cours
    const [updated] = await Course.update(
      {
        titre,
        description,
        prix,
        module,
        status,
        matiere_id,
        image: imageToUse,
      },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    const updatedCourse = await Course.findByPk(id);
    res.status(200).json({ message: "Cours mis à jour avec succès", course: updatedCourse });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du cours", error });
  }
};

// Supprimer un cours


exports.deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Course.destroy({ where: { id } });
  
      if (!deleted) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }
  
      res.status(200).json({ message: "Cours supprimé avec succès" });
  
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du cours", error });
    }
  };
  
