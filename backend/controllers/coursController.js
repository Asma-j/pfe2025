const Course = require('../models/Cours');
const Matiere = require('../models/Matiere');
const Utilisateur = require('../models/Utilisateur');
const Niveau = require('../models/Niveau');
const fs = require('fs');
const path = require('path');

exports.createCourse = async (req, res) => {
  try {
    const { titre, description, prix, module, status, matiere_id, niveau_id } = req.body;
    const image = req.files && req.files.image ? req.files.image[0].filename : null;
    const files = req.files && req.files.files ? req.files.files.map(file => file.filename) : [];
    const video = req.files && req.files.video ? req.files.video[0].filename : null;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Check if user has "enseignant" role (case-insensitive)
    const userRole = req.user.role ? String(req.user.role).toLowerCase() : null;
    if (userRole !== 'enseignant') {
      return res.status(403).json({ message: 'Seuls les enseignants peuvent créer des cours' });
    }

    // Validate matiere_id and niveau_id
    if (!matiere_id) {
      return res.status(400).json({ message: 'Le champ matiere_id est requis' });
    }
    if (!niveau_id) {
      return res.status(400).json({ message: 'Le champ niveau_id est requis' });
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
      niveau_id,
      created_by,
      image,
      files,
      video,
    });

    res.status(201).json({ message: 'Cours créé avec succès', course: newCourse });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la création du cours', error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { matiere_id, niveau_id } = req.query;
    const whereClause = {};
    if (matiere_id) whereClause.matiere_id = matiere_id;
    if (niveau_id) whereClause.niveau_id = niveau_id;

    const courses = await Course.findAll({
      where: whereClause,
      include: [
        { model: Matiere, attributes: ['nom'] },
        { model: Utilisateur, as: 'Creator', attributes: ['nom', 'prenom'] },
        { model: Niveau, attributes: ['nom'] },
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
        { model: Niveau, attributes: ['nom'] },
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
    const { titre, description, prix, module, status, matiere_id, niveau_id } = req.body;
    const newImage = req.files && req.files.image ? req.files.image[0].filename : null;
    const newFiles = req.files && req.files.files ? req.files.files.map(file => file.filename) : null;
    const newVideo = req.files && req.files.video ? req.files.video[0].filename : null;

    const oldCourse = await Course.findByPk(id);
    if (!oldCourse) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Handle image
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

    // Handle files
    let filesToUse = oldCourse.files;
    // Ensure filesToUse is an array
    if (filesToUse && !Array.isArray(filesToUse)) {
      if (typeof filesToUse === 'string') {
        try {
          filesToUse = JSON.parse(filesToUse);
          if (!Array.isArray(filesToUse)) {
            filesToUse = [];
          }
        } catch (e) {
          console.error('Error parsing oldCourse.files:', e);
          filesToUse = [];
        }
      } else {
        filesToUse = [];
      }
    }
    if (newFiles) {
      // If new files are uploaded, replace the old files
      if (Array.isArray(filesToUse) && filesToUse.length > 0) {
        filesToUse.forEach(file => {
          const filePath = path.join(__dirname, '../Uploads', file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      filesToUse = Array.isArray(newFiles) ? newFiles : [];
    }

    // Handle video
    let videoToUse = oldCourse.video;
    if (newVideo) {
      videoToUse = newVideo;
      if (oldCourse.video) {
        const oldVideoPath = path.join(__dirname, '../Uploads', oldCourse.video);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
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
        niveau_id,
        image: imageToUse,
        files: filesToUse,
        video: videoToUse,
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
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Delete associated files
    if (course.image) {
      const imagePath = path.join(__dirname, '../Uploads', course.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    if (course.files && course.files.length > 0) {
      course.files.forEach(file => {
        const filePath = path.join(__dirname, '../Uploads', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    if (course.video) {
      const videoPath = path.join(__dirname, '../Uploads', course.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Course.destroy({ where: { id } });
    res.status(200).json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du cours', error: error.message });
  }
};