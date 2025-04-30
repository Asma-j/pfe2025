const Presence = require('../models/Presence');
const Planning = require('../models/Planning');
const Utilisateur = require('../models/Utilisateur');
const Cours = require('../models/Cours');
const Matiere = require('../models/Matiere');
const Notification = require('../models/Notification'); // Adjust path if needed
const Quiz = require('../models/Quiz');

exports.saveAttendance = async (req, res) => {
  // Existing code (unchanged)
  try {
    const { planningId, attendance } = req.body;
    console.log('Saving attendance for planningId:', planningId, 'Attendance:', attendance);

    const planning = await Planning.findByPk(planningId);
    if (!planning) {
      console.log(`Planning with ID ${planningId} not found`);
      return res.status(404).json({ message: 'Planning non trouvé' });
    }

    for (const { utilisateur_id } of attendance) {
      const user = await Utilisateur.findByPk(utilisateur_id);
      if (!user) {
        console.log(`Utilisateur with ID ${utilisateur_id} not found`);
        return res.status(404).json({ message: `Utilisateur avec ID ${utilisateur_id} non trouvé` });
      }
    }

    await Presence.bulkCreate(
      attendance.map(({ utilisateur_id, present }) => ({
        utilisateur_id,
        planning_id: planningId,
        present,
      })),
      { validate: true }
    );
    res.status(201).json({ message: 'Présence enregistrée' });
  } catch (error) {
    console.error('Error in saveAttendance:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la présence', error: error.message });
  }
};
exports.sendQuizNotification = async (req, res) => {
    try {
      const { planningId } = req.body;
      console.log('Sending quiz notifications for planningId:', planningId);
  
      // Fetch the planning and its associated cours and matiere
      const planning = await Planning.findByPk(planningId, {
        include: [{ model: Cours, include: [{ model: Matiere }] }],
      });
      if (!planning) {
        console.log(`Planning with ID ${planningId} not found`);
        return res.status(404).json({ message: 'Planning non trouvé' });
      }
  
      const matiere = planning.Cour?.Matiere;
      if (!matiere) {
        console.log('No matiere associated with this planning');
        return res.status(404).json({ message: 'Matière non trouvée pour ce planning' });
      }
  
      // Fetch quiz for the matiere
      const quiz = await Quiz.findOne({ where: { matiere_id: matiere.id } });
      if (!quiz) {
        console.log('No quiz found for this matiere');
        return res.status(404).json({ message: 'Aucun quiz trouvé pour cette matière' });
      }
  
      // Fetch attendance for the planning
      const attendance = await Presence.findAll({
        where: { planning_id: planningId, present: true },
        include: [{ model: Utilisateur, attributes: ['id', 'prenom', 'nom', 'email'] }],
      });
  
      if (!attendance.length) {
        console.log('No present students found for this planning');
        return res.status(404).json({ message: 'Aucun étudiant présent trouvé pour ce planning' });
      }
  
      // Create notifications with quiz link
      const notifications = attendance.map(({ Utilisateur }) => ({
        userId: Utilisateur.id,
        message: `Vous avez assisté au cours "${planning.titre}". Veuillez passer l'évaluation pour la matière "${matiere.nom}" ici: /quiz/matiere/${matiere.id}`,
        read: false,
      }));
  
      await Notification.bulkCreate(notifications);
      console.log(`Sent ${notifications.length} quiz notifications`);
  
      res.status(201).json({ message: `${notifications.length} notifications envoyées aux étudiants présents` });
    } catch (error) {
      console.error('Error in sendQuizNotification:', {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: 'Erreur lors de l\'envoi des notifications', error: error.message });
    }
  };
exports.getAttendance = async (req, res) => {
  // Existing code (unchanged)
  try {
    const { planningId } = req.params;
    console.log('Fetching attendance for planningId:', planningId);

    const planning = await Planning.findByPk(planningId);
    if (!planning) {
      console.log(`Planning with ID ${planningId} not found`);
      return res.status(404).json({ message: 'Planning non trouvé' });
    }

    const attendance = await Presence.findAll({
      where: { planning_id: planningId },
      include: [{ model: Utilisateur, attributes: ['id', 'prenom', 'nom', 'email'] }],
    });
    console.log('Attendance records found:', attendance.length);
    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error in getAttendance:', {
      message: error.message,
      stack: error.stack,
      planningId: req.params.planningId,
    });
    res.status(500).json({ message: 'Erreur lors de la récupération de la présence', error: error.message });
  }
};

exports.sendQuizNotification = async (req, res) => {
  try {
    const { planningId } = req.body;
    console.log('Sending quiz notifications for planningId:', planningId);

    // Fetch the planning and its associated cours and matiere
    const planning = await Planning.findByPk(planningId, {
      include: [
        { model: Cours, include: [{ model: Matiere }] },
      ],
    });
    if (!planning) {
      console.log(`Planning with ID ${planningId} not found`);
      return res.status(404).json({ message: 'Planning non trouvé' });
    }

    const matiere = planning.Cour?.Matiere;
    if (!matiere) {
      console.log('No matiere associated with this planning');
      return res.status(404).json({ message: 'Matière non trouvée pour ce planning' });
    }

    // Fetch attendance for the planning
    const attendance = await Presence.findAll({
      where: { planning_id: planningId, present: true },
      include: [{ model: Utilisateur, attributes: ['id', 'prenom', 'nom', 'email'] }],
    });

    if (!attendance.length) {
      console.log('No present students found for this planning');
      return res.status(404).json({ message: 'Aucun étudiant présent trouvé pour ce planning' });
    }

    // Create notifications for present students
    const notifications = attendance.map(({ Utilisateur }) => ({
      userId: Utilisateur.id,
      message: `Vous avez assisté au cours "${planning.titre}". Veuillez passer l'évaluation pour la matière "${matiere.nom}".`,
      read: false,
    }));

    await Notification.bulkCreate(notifications);
    console.log(`Sent ${notifications.length} quiz notifications`);

    res.status(201).json({ message: `${notifications.length} notifications envoyées aux étudiants présents` });
  } catch (error) {
    console.error('Error in sendQuizNotification:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Erreur lors de l\'envoi des notifications', error: error.message });
  }
};