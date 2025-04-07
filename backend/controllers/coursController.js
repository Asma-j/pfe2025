const Course = require('../models/Cours'); 


exports.createCourse = async (req, res) => {
  try {
    const { titre, description, prix, module, status,image } = req.body;

    const newCourse = new Course({
      titre,
      description,
      prix,
      module,
      status,
      image,
    });

    await newCourse.save();
    res.status(201).json({ message: 'Cours créé avec succès', course: newCourse });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du cours', error });
  }
};

// Récupérer tous les cours


exports.getAllCourses = async (req, res) => {
    try {
      const courses = await Course.findAll();
      res.status(200).json(courses);
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des cours", error });
    }
  };
  

// Récupérer un cours par ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du cours', error });
  }
};

// Mettre à jour un cours


exports.updateCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await Course.update(req.body, { where: { id } });
  
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
  
