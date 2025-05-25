const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./db');
const path = require('path');



const defineAssociations = require('./models/association');
const zoomRoutes = require('./routes/zoomRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const coursRoutes = require('./routes/coursRoutes');
const planningRoutes = require('./routes/planningRoutes');
const matiereRoutes = require('./routes/matiereRoutes');
const classeRoutes = require('./routes/classeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const quizRoutes = require('./routes/quizRoutes');
const niveauRoutes = require('./routes/niveauRoutes');
const presenceRoutes= require('./routes/presenceRoutes')
const statisticsRoutes = require('./routes/statistics');
const { startCronJobs } = require('./middleware/cronJobs');
startCronJobs();
const app = express();
app.use(cors());
app.use(express.json());

// Connexion et synchronisation de la base de données
connectDB().then(() => {
    sequelize.sync()
        .then(() => console.log("Base de données synchronisée"))
        .catch(err => console.error("Erreur de synchronisation :", err));
});

defineAssociations();

app.use('/api/statistics', statisticsRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/classes', classeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plannings', planningRoutes);
app.use('/api/niveaux', niveauRoutes);
app.use('/Uploads', express.static('Uploads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));
app.get('/api/items', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM items');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error fetching data from DB:', error);
      res.status(500).send('Internal Server Error');
    }
  });
// Démarrage du serveur
app.listen(5000, () => {
    console.log('Serveur démarré sur le port 5000');
});
