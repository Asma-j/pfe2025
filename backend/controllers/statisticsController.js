// controllers/statisticsController.js
const { Op } = require('sequelize');
const Utilisateur = require('../models/Utilisateur');
const Cours = require('../models/Cours');
const Planning = require('../models/Planning');
const Notification = require('../models/Notification');
const Presence = require('../models/Presence');
const Role = require('../models/Role');
const UtilisateurClasse = require('../models/UtilisateurClasse');
const Classe = require('../models/Classe');
const sequelize = require('../db'); // Import sequelize for fn and literal

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total students (id_role: 2, status: 'approved')
    const totalStudents = await Utilisateur.count({
      where: { id_role: 2, status: 'approved' },
    });

    // Active courses (status: 'active')
    const activeCourses = await Cours.count({
      where: { status:('Payé', 'Gratuit') },
    });

    // Completion rate (percentage of plannings with status: 'Terminé')
    const totalPlannings = await Planning.count();
    const completedPlannings = await Planning.count({
      where: { statut: 'Terminé' },
    });
    const completionRate = totalPlannings > 0 ? ((completedPlannings / totalPlannings) * 100).toFixed(0) : 0;

    // New registrations (pending users)
    const newRegistrations = await Utilisateur.count({
      where: { status: 'pending' },
    });

    // Top teachers by student count
    const topTeachers = await Utilisateur.findAll({
      where: { id_role: 1003, status: 'approved' }, // Teachers
      include: [
        {
          model: Classe,
          as: 'AssociatedClasses',
          through: { attributes: [] },
          include: [
            {
              model: Utilisateur,
              as: 'Utilisateurs', // Use correct alias
              through: { attributes: [] },
              where: { id_role: 2, status: 'approved' }, // Students
              required: false,
            },
          ],
        },
      ],
      attributes: ['id', 'prenom', 'nom'],
    });

    const formattedTopTeachers = topTeachers
      .map(teacher => {
        const studentCount = teacher.AssociatedClasses.reduce(
          (count, classe) => count + (classe.Utilisateurs ? classe.Utilisateurs.length : 0),
          0
        );
        return {
          name: `${teacher.prenom} ${teacher.nom}`,
          students: studentCount,
        };
      })
      .filter(teacher => teacher.students > 0) // Only include teachers with students
      .sort((a, b) => b.students - a.students) // Sort by student count
      .slice(0, 5); // Top 5 teachers

    res.json({
      totalStudents,
      activeCourses,
      completionRate: `${completionRate}%`,
      newRegistrations: `+${newRegistrations}`,
      topTeachers: formattedTopTeachers,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

// Get student engagement data for AnalyticsChart
exports.getEngagementStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query; // Default to current year
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31); // December 31st

    // Fetch attendance data grouped by month
    const attendanceData = await Presence.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN present = 1 THEN 1 ELSE 0 END')), 'present'],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
      raw: true,
    });

    // Map months to engagement rate (percentage of present students)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const engagementData = Array(12).fill(0).map((_, index) => {
      const monthData = attendanceData.find(d => parseInt(d.month) === index + 1);
      if (monthData && monthData.total > 0) {
        return Math.round((monthData.present / monthData.total) * 100);
      }
      return 0;
    });

    res.json({
      labels: months,
      data: engagementData,
    });
  } catch (error) {
    console.error('Error fetching engagement stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques d\'engagement', error: error.message });
  }
};