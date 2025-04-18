const Course = require('../models/Cours');
const Matiere = require('../models/Matiere');
const Utilisateur = require('../models/Utilisateur');
const fs = require('fs');
const path = require('path');

exports.createCourse = async (req, res) => {
  try {
    const { titre, description, prix, module, status, matiere_id } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Check if user has "enseignant" role (case-insensitive)
    const userRole = req.user.role ? String(req.user.role).toLowerCase() : null;
    if (userRole !== 'enseignant') {
      return res.status(403).json({ message: 'Seuls les enseignants peuvent créer des cours' });
    }

    // Validate matiere_id
    if (!matiere_id) {
      return res.status(400).json({ message: 'Le champ matiere_id est requis' });
    }

    const created_by = req.user.id;

    // Create course using Sequelize
    const newCourse = await Course.create({
      titre,
      description,
      prix,
      module,
      status,
      matiere_id,
      created_by,
      image,
    });

    res.status(201).json({ message: 'Cours créé avec succès', course: newCourse });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la création du cours', error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { matiere_id } = req.query;
    const whereClause = matiere_id ? { matiere_id } : {};
    const courses = await Course.findAll({
      where: whereClause,
      include: [
        { model: Matiere, attributes: ['nom'] },
        { model: Utilisateur, as: 'Creator', attributes: ['nom', 'prenom'] },
      ],
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des cours', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id },
      include: [
        { model: Matiere, attributes: ['nom'] },
        { model: Utilisateur, as: 'Creator', attributes: ['nom', 'prenom'] },
      ],
    });
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du cours', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, prix, module, status, matiere_id } = req.body;
    const newImage = req.file ? req.file.filename : null;

    const oldCourse = await Course.findByPk(id);
    if (!oldCourse) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    let imageToUse = oldCourse.image;
    if (newImage) {
      imageToUse = newImage;
      if (oldCourse.image) {
        const oldImagePath = path.join(__dirname, '../Uploads', oldCourse.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

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
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    const updatedCourse = await Course.findByPk(id);
    res.status(200).json({ message: 'Cours mis à jour avec succès', course: updatedCourse });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du cours', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Course.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    res.status(200).json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du cours', error: error.message });
  }
};