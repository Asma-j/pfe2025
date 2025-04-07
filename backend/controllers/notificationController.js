const { Notification, Utilisateur } = require('../models/userNotif'); 

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { read: false },
      include: [
        {
          model: Utilisateur,
          where: { status: "pending" },
          attributes: ["id", "prenom", "nom", "email", "status"],
        },
      ],
    });
    res.json(notifications);
  } catch (err) {
    console.error("Erreur lors de la récupération des notifications :", err);
    res.status(500).json({ error: err.message });
  }
};