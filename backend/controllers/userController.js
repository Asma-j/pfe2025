const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');
const UtilisateurClasse = require('../models/UtilisateurClasse');
const Classe = require('../models/Classe');

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
exports.getStudents = async (req, res) => {
  try {
      const students = await Utilisateur.findAll({
          include: [
              { model: Role, where: { id: 2 } }, 
              { model: Classe },
          ],
      });
      res.json(students);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};
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
// Récupérer les enseignants
exports.getTeachers = async (req, res) => {
  try {
      const teachers = await Utilisateur.findAll({
          include: Role,
          where: {
              id_role: 1003
          }
      });
      res.json(teachers);
  } catch (err) {
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
  
// Ajouter un utilisateur (sans inscription)
exports.addUser = async (req, res) => {
    const { prenom, nom, email, mot_de_passe, id_role } = req.body;

    if (!prenom || !nom || !email || !mot_de_passe || !id_role) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    try {
        const user = await Utilisateur.create({ prenom, nom, email, mot_de_passe, id_role });
        res.json({ message: 'Utilisateur ajouté avec succès', data: user });
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
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        if (user.Role.nom_role !== 'Enseignant') {
            return res.status(403).json({ error: "Accès réservé aux enseignants" });
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
exports.updateProfile = async (req, res) => {
  const { prenom, nom, email, mot_de_passe, photo } = req.body;

  try {
      const user = await Utilisateur.findByPk(req.user.id);

      if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      user.prenom = prenom || user.prenom;
      user.nom = nom || user.nom;
      user.email = email || user.email;
      user.photo = photo || user.photo;

      if (mot_de_passe) {
          user.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
      }

      await user.save();

      const updatedUser = await Utilisateur.findByPk(req.user.id, {
          include: [{ model: Role, attributes: ['nom_role'] }],
          attributes: ['id', 'prenom', 'nom', 'email', 'photo', 'status'],
      });

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
  } catch (err) {
      console.error('Erreur lors de la mise à jour du profil :', err);
      res.status(500).json({ error: err.message });
  }
};