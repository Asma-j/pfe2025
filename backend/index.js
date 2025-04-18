const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./db');
const path = require('path');


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

const app = express();
app.use(cors());
app.use(express.json());

// Connexion et synchronisation de la base de données
connectDB().then(() => {
    sequelize.sync()
        .then(() => console.log("Base de données synchronisée"))
        .catch(err => console.error("Erreur de synchronisation :", err));
});

// Utilisation des routes
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
