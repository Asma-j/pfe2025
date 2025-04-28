const cron = require('node-cron');
const Planning = require('../models/Planning');
const { Op } = require('sequelize');
// Schedule a task to run every hour to check for expired plannings
const startCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running cron job to check for expired plannings...');
    try {
      const now = new Date();
      const plannings = await Planning.findAll({
        where: {
          statut: ['Planifié', 'En cours'],
          date_fin: {
            [Op.lte]: now, // Find plannings where date_fin is less than or equal to now
          },
        },
      });

      for (const planning of plannings) {
        planning.statut = 'Terminé';
        await planning.save();
        console.log(`Planning ${planning.id} status updated to Terminé (date_fin expired)`);
      }

      console.log(`Cron job completed. Updated ${plannings.length} plannings.`);
    } catch (error) {
      console.error('Error in cron job updating plannings:', error);
    }
  });
};

module.exports = { startCronJobs };