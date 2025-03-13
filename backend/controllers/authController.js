const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');
const nodemailer = require('nodemailer');

const SECRET_KEY = 'secret'; 


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
    console.log("Requête reçue :", req.body);
    const { prenom, nom, email, mot_de_passe, id_role } = req.body;
  
    if (!prenom || !nom || !email || !mot_de_passe || !id_role) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
  
    try {
      const utilisateurExiste = await Utilisateur.findOne({ where: { email } });
      if (utilisateurExiste) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }
  
      const role = await Role.findByPk(id_role);
      if (!role) return res.status(400).json({ error: "Rôle invalide" });
      console.log("Rôle trouvé :", role);
  
      console.log("Mot de passe avant hashage :", mot_de_passe);
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      console.log("Mot de passe après hashage :", hashedPassword);
  
      const user = await Utilisateur.create({
        prenom, nom, email, mot_de_passe: hashedPassword, id_role
      });
  
      // Variable pour indiquer si l'email a été envoyé ou non
      let emailSent = false;
      if (role.nom_role !== 'admin') {
        const mailOptions = {
          from: 'asmabenbrahem09@gmail.com',
          to: email,
          subject: 'Votre compte a été créé',
          text: `Bonjour ${prenom},\n\nVotre compte a été créé avec succès.\n\nEmail: ${email}\nMot de passe: ${mot_de_passe}\n\nMerci de vous connecter.\n\nCordialement,`
        };
        await transporter.sendMail(mailOptions);
        emailSent = true;
      }
  
      // Renvoyer le résultat avec un flag
      res.json({ message: 'Utilisateur inscrit avec succès', data: user, emailSent });
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      res.status(500).json({ error: err.message });
    }
  };
  
exports.login = async (req, res) => {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ error: "Email et mot de passe sont requis" });
    }

    try {
        const user = await Utilisateur.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: "Utilisateur non trouvé" });

        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user.id, role: user.id_role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: "Connexion réussie", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
