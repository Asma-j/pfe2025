  const Utilisateur = require('../models/Utilisateur');
  const Role = require('../models/Role');
  const UtilisateurClasse = require('../models/UtilisateurClasse');
  const Classe = require('../models/Classe');
  const fs = require('fs');
  const path = require('path');
  const bcrypt = require('bcryptjs');
  const upload = require('../middleware/upload');
const Niveau = require('../models/Niveau');
const Matiere = require('../models/Matiere');
  //  Liste des utilisateurs avec leur rôle
  exports.getUsers = async (req, res) => {
      try {
          const users = await Utilisateur.findAll({ include: Role });
          res.json(users);
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
  };
  // Récupérer les étudiants

  exports.getStudentsByClasse = async (req, res) => {
    try {
        const { classeId } = req.params;
        const students = await Utilisateur.findAll({
            include: [
                { model: Role, where: { id: 2 } }, 
                {
                    model: Classe,
                    where: { id: classeId },
                },
            ],
        });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  };
  exports.addStudentToClasse = async (req, res) => {
    try {
        const { utilisateur_id, classe_id } = req.body;
        const utilisateurClasse = await UtilisateurClasse.create({ utilisateur_id, classe_id });
        res.status(201).json({ message: 'Étudiant ajouté à la classe', utilisateurClasse });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'étudiant à la classe', error });
    }
  };

// controllers/userController.js
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Utilisateur.findAll({
      where: { id_role: 1003 },
      include: [
        { model: Role, attributes: ['nom_role'] },
        { model: Niveau, attributes: ['nom'], as: 'Niveau', required: false },
        { model: Matiere, attributes: ['nom'], as: 'Matiere', required: false },
        { 
          model: Classe, 
          attributes: ['id', 'nom'], 
          through: { attributes: [] }, 
          as: 'AssociatedClasses', // Updated alias
          required: false 
        }
      ],
      attributes: [
        'id', 'prenom', 'nom', 'email', 'status', 'photo', 
        'id_role', 'niveau_id', 'matiere_id'
      ]
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      prenom: teacher.prenom,
      nom: teacher.nom,
      email: teacher.email,
      status: teacher.status,
      photo: teacher.photo,
      id_role: teacher.id_role,
      role: teacher.Role?.nom_role || null,
      niveau_id: teacher.niveau_id,
      niveau_nom: teacher.Niveau?.nom || null,
      matiere_id: teacher.matiere_id,
      matiere_nom: teacher.Matiere?.nom || null,
      classe_ids: teacher.AssociatedClasses?.map(classe => classe.id) || [],
      classe_noms: teacher.AssociatedClasses?.map(classe => classe.nom) || []
    }));

    res.json(formattedTeachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update getStudents, addUser, and getStudentsByClasse similarly
exports.getStudents = async (req, res) => {
  try {
    const students = await Utilisateur.findAll({
      where: { id_role: 2 },
      include: [
        { model: Role, attributes: ['nom_role'] },
        { model: Niveau, attributes: ['nom'], as: 'Niveau', required: false },
        { 
          model: Classe, 
          attributes: ['id', 'nom'], 
          through: { attributes: [] }, 
          as: 'AssociatedClasses', // Updated alias
          required: false 
        }
      ],
      attributes: [
        'id', 'prenom', 'nom', 'email', 'status', 'photo', 
        'id_role', 'niveau_id'
      ]
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      prenom: student.prenom,
      nom: student.nom,
      email: student.email,
      status: student.status,
      photo: student.photo,
      id_role: student.id_role,
      role: student.Role?.nom_role || null,
      niveau_id: student.niveau_id,
      niveau_nom: student.Niveau?.nom || null,
      classe_ids: student.AssociatedClasses?.map(classe => classe.id) || [],
      classe_noms: student.AssociatedClasses?.map(classe => classe.nom) || []
    }));

    res.json(formattedStudents);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.addUser = async (req, res) => {
  const { prenom, nom, email, mot_de_passe, id_role, niveau_id, matiere_id, classe_ids } = req.body;

  if (!prenom || !nom || !email || !mot_de_passe || !id_role) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    const user = await Utilisateur.create({
      prenom, nom, email, mot_de_passe: hashedPassword, id_role, status: 'pending',
      niveau_id, matiere_id,
    });

    console.log('Received classe_ids:', classe_ids);

    if (classe_ids && classe_ids.length > 0) {
      const associations = classe_ids.map(classe_id => ({
        utilisateur_id: user.id,
        classe_id: parseInt(classe_id),
      }));
      await UtilisateurClasse.bulkCreate(associations);
      console.log('Associations created:', associations);
    }

    const createdUser = await Utilisateur.findByPk(user.id, {
      include: [
        { model: Role, attributes: ['nom_role'] },
        { model: Niveau, as: 'Niveau' },
        { model: Matiere, as: 'Matiere' },
        { model: Classe, as: 'AssociatedClasses', through: { attributes: [] } } // Updated alias
      ]
    });

    const formattedUser = {
      id: createdUser.id,
      prenom: createdUser.prenom,
      nom: createdUser.nom,
      email: createdUser.email,
      status: createdUser.status,
      photo: createdUser.photo,
      id_role: createdUser.id_role,
      role: createdUser.Role ? createdUser.Role.nom_role : null,
      niveau_id: createdUser.niveau_id,
      niveau_nom: createdUser.Niveau ? createdUser.Niveau.nom : null,
      matiere_id: createdUser.matiere_id,
      matiere_nom: createdUser.Matiere ? createdUser.Matiere.nom : null,
      classe_ids: createdUser.AssociatedClasses ? createdUser.AssociatedClasses.map(classe => classe.id) : [],
      classe_noms: createdUser.AssociatedClasses ? createdUser.AssociatedClasses.map(classe => classe.nom) : []
    };

    res.json({ message: 'Utilisateur ajouté avec succès', data: formattedUser });
  } catch (err) {
    console.error('Error adding user:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsByClasse = async (req, res) => {
  try {
    const { classeId } = req.params;
    const students = await Utilisateur.findAll({
      include: [
        { model: Role, where: { id: 2 }, attributes: ['nom_role'] },
        {
          model: Classe,
          where: { id: classeId },
          as: 'AssociatedClasses',
          through: { attributes: [] },
          attributes: ['id', 'nom'],
        },
        { model: Niveau, attributes: ['nom'], as: 'Niveau', required: false }, // Add Niveau include
      ],
      attributes: [
        'id', 'prenom', 'nom', 'email', 'status', 'photo', 
        'id_role', 'niveau_id'
      ],
    });

    // Format the response to match the frontend expectations
    const formattedStudents = students.map(student => ({
      id: student.id,
      prenom: student.prenom,
      nom: student.nom,
      email: student.email,
      status: student.status,
      photo: student.photo,
      id_role: student.id_role,
      role: student.Role?.nom_role || null,
      niveau_id: student.niveau_id,
      niveau_nom: student.Niveau?.nom || null, // Include niveau_nom
      classe_ids: student.AssociatedClasses?.map(classe => classe.id) || [],
      classe_noms: student.AssociatedClasses?.map(classe => classe.nom) || []
    }));

    res.json(formattedStudents);
  } catch (err) {
    console.error('Error fetching students by classe:', err);
    res.status(500).json({ error: err.message });
  }
};
  // Récupérer uniquement les utilisateurs approuvés
  exports.getApprovedUsers = async (req, res) => {
      try {
        const approvedUsers = await Utilisateur.findAll({
          where: { status: 'approved' }, // Filtrer par statut approuvé
          include: Role, // Inclure le rôle de chaque utilisateur
        });
        res.json(approvedUsers);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
    

  // Mettre à jour un utilisateur
  exports.updateUser = async (req, res) => {
      const { id } = req.params;
      const { prenom, nom, email, status } = req.body;
    
      try {
        const user = await Utilisateur.findByPk(id);
    
        if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
    
        // Mise à jour des informations de l'utilisateur
        user.prenom = prenom || user.prenom;
        user.nom = nom || user.nom;
        user.email = email || user.email;
        user.status = status || user.status;
        await user.save();
    
        res.json({ message: 'Utilisateur mis à jour avec succès', data: user });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
    
    // Supprimer un utilisateur
    exports.deleteUser = async (req, res) => {
      const { id } = req.params;
    
      try {
        const user = await Utilisateur.findByPk(id);
    
        if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
    
        await user.destroy(); // Supprimer l'utilisateur
    
        res.json({ message: 'Utilisateur supprimé avec succès' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
    // Récupérer le profil de l'utilisateur connecté
    exports.getProfile = async (req, res) => {
      try {
        const user = await Utilisateur.findByPk(req.user.id, {
          include: [{ model: Role, attributes: ['nom_role'] }],
          attributes: ['id', 'prenom', 'nom', 'email', 'photo', 'status', 'id_role'],
        });
    
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
    
        res.json({
          id: user.id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          photo: user.photo,
          role: user.Role.nom_role,
          status: user.status,
        });
      } catch (err) {
        console.error('Erreur lors de la récupération du profil :', err);
        res.status(500).json({ error: err.message });
      }
    };
  // Mettre à jour le profil de l'utilisateur connecté
  exports.updateProfile = (req, res) => {


    const { prenom, nom, email, mot_de_passe } = req.body;

    try {
      // Handle multer errors
      if (req.fileValidationError) {
        console.error('File validation error:', req.fileValidationError);
        return res.status(400).json({ error: req.fileValidationError.message });
      }

      // Find user
      Utilisateur.findByPk(req.user.id).then((user) => {
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Update user fields
        user.prenom = prenom || user.prenom;
        user.nom = nom || user.nom;
        user.email = email || user.email;

        // Update password if provided
        if (mot_de_passe) {
          return bcrypt.hash(mot_de_passe, 10).then((hashedPassword) => {
            user.mot_de_passe = hashedPassword;
            return user;
          });
        }
        return user;
      }).then((user) => {
        // Update photo if a new file is uploaded
        if (req.file) {
          // Delete old photo if it exists
          if (user.photo) {
            const oldPhotoPath = path.join(__dirname, '../Uploads', user.photo);
            if (fs.existsSync(oldPhotoPath)) {
              fs.unlinkSync(oldPhotoPath);
            }
          }
          user.photo = req.file.filename; // Save the new filename
        }

        // Save user
        return user.save();
      }).then(() => {
        // Fetch updated user with role
        return Utilisateur.findByPk(req.user.id, {
          include: [{ model: Role, attributes: ['nom_role'] }],
          attributes: ['id', 'prenom', 'nom', 'email', 'photo', 'status'],
        });
      }).then((updatedUser) => {
        res.json({
          message: 'Profil mis à jour avec succès',
          user: {
            id: updatedUser.id,
            prenom: updatedUser.prenom,
            nom: updatedUser.nom,
            email: updatedUser.email,
            photo: updatedUser.photo,
            role: updatedUser.Role.nom_role,
            status: updatedUser.status,
          },
        });
      }).catch((err) => {
        console.error('Erreur lors de la mise à jour du profil :', err);
        res.status(500).json({ error: err.message });
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: err.message });
    }
  };