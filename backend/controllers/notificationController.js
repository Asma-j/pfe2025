const { Notification, Utilisateur } = require('../models/userNotif');

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId est requis' });
    }

    // Fetch all notifications for the given userId
    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'prenom', 'nom', 'email', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    console.error('Erreur lors de la récupération des notifications :', err);
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marquée comme lue' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la notification :', err);
    res.status(500).json({ error: err.message });
  }
};