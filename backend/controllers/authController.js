const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const UtilisateurClasse = require('../models/UtilisateurClasse');
const UtilisateurMatiere = require('../models/UtilisateurMatiere');
const Matiere = require('../models/Matiere');
const Classe = require('../models/Classe');
const SECRET_KEY = process.env.JWT_SECRET || 'secret';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  const { prenom, nom, email, mot_de_passe, id_role, niveau_id, classes, matieres } = req.body;

  if (!prenom || !nom || !email || !mot_de_passe || !id_role || !niveau_id) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
  }

  try {
    const utilisateurExiste = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExiste) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    const role = await Role.findByPk(id_role);
    if (!role) return res.status(400).json({ error: 'Rôle invalide' });

    if (matieres && matieres.length > 0) {
      const validMatieres = await Matiere.findAll({ where: { id: matieres } });
      if (validMatieres.length !== matieres.length) {
        return res.status(400).json({ error: 'Une ou plusieurs matières sont invalides' });
      }
    }

    if (classes && classes.length > 0) {
      const validClasses = await Classe.findAll({ where: { id: classes } });
      if (validClasses.length !== classes.length) {
        return res.status(400).json({ error: 'Une ou plusieurs classes sont invalides' });
      }
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const isAdmin = role.nom_role.toLowerCase() === 'admin';
    const isEnseignant = role.nom_role.toLowerCase() === 'enseignant';

    const user = await Utilisateur.create({
      prenom,
      nom,
      email,
      mot_de_passe: hashedPassword,
      id_role,
      niveau_id,
      status: isAdmin ? 'approved' : 'pending',
    });

    if (isEnseignant && Array.isArray(classes) && classes.length > 0) {
      const utilisateurClasseData = classes.map(classeId => ({
        utilisateur_id: user.id,
        classe_id: classeId,
      }));
      await UtilisateurClasse.bulkCreate(utilisateurClasseData);
    }

    if (isEnseignant && Array.isArray(matieres) && matieres.length > 0) {
      const utilisateurMatiereData = matieres.map(matiereId => ({
        utilisateur_id: user.id,
        matiere_id: matiereId,
      }));
      await UtilisateurMatiere.bulkCreate(utilisateurMatiereData);
    }

    if (!isAdmin) {
      const notification = await Notification.create({
        message: `Nouvelle inscription en attente: ${prenom} ${nom} (${email})`,
        userId: user.id,
      });
      console.log('Notification créée :', notification.toJSON());
    }

    res.json({
      message: isAdmin
        ? 'Compte administrateur créé avec succès.'
        : 'Inscription en attente d’approbation par l’admin.',
    });
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    res.status(500).json({ error: err.message });
  }
};

exports.approveRegistration = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await Utilisateur.findByPk(userId);
    if (!user || user.status !== 'pending') {
      return res.status(400).json({ error: 'Utilisateur invalide ou déjà approuvé' });
    }

    user.status = 'approved';
    await user.save();

    const role = await Role.findByPk(user.id_role);

    const mailOptions = {
      from: 'asmabenbrahem09@gmail.com',
      to: user.email,
      subject: 'Votre compte a été approuvé',
      text: `Bonjour ${user.prenom},\n\nVotre compte a été approuvé.\n\nEmail: ${user.email}\nMot de passe: [le mot de passe choisi lors de l'inscription]\nRôle: ${role.nom_role}\n\nMerci de vous connecter.\n\nCordialement,`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Utilisateur approuvé et email envoyé.' });
  } catch (err) {
    console.error('Erreur lors de l’approbation :', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  console.log('Login attempt:', { email });

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  try {
    const user = await Utilisateur.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['nom_role'] }],
    });

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const roleName = user.Role.nom_role.toLowerCase();
    if (['etudiant', 'enseignant'].includes(roleName) && user.status !== 'approved') {
      return res.status(403).json({
        error: "Votre compte n'est pas encore approuvé. Veuillez attendre l'approbation de l'administrateur.",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Set session data before regeneration
    req.session.user = {
      id: user.id,
      role: user.Role.nom_role,
    };

    // Save session explicitly before regenerating
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session before regeneration:', err);
        return res.status(500).json({ error: 'Erreur lors de la création de la session' });
      }

      req.session.regenerate((err) => {
        if (err) {
          console.error('Error regenerating session:', err);
          return res.status(500).json({ error: 'Erreur lors de la création de la session' });
        }
        // Reassign session data after regeneration
        req.session.user = {
          id: user.id,
          role: user.Role.nom_role,
        };
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session after regeneration:', err);
            return res.status(500).json({ error: 'Erreur lors de la création de la session' });
          }
          console.log('Session created:', req.session.user, 'Session ID:', req.sessionID);
          res.json({
            message: "Connexion réussie",
            token,
            userId: user.id,
            role: user.Role.nom_role,
          });
        });
      });
    });
  } catch (err) {
    console.error('Erreur lors de la connexion :', err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  console.log('Logout attempt:', req.session.user);
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    console.log('Session destroyed');
    res.json({ message: 'Déconnexion réussie' });
  });
};