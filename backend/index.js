const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cors = require('cors');
const { sequelize } = require('./db');
const defineAssociations = require('./models/association');
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
const presenceRoutes = require('./routes/presenceRoutes');
const statisticsRoutes = require('./routes/statistics');
const zoomRoutes = require('./routes/zoomRoutes');
const { startCronJobs } = require('./middleware/cronJobs');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://192.168.0.148',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());

// Session middleware
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Session',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

// Debug session middleware
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session.user);
  next();
});

// Sync session store and database
sessionStore.sync()
  .then(() => console.log('Session store synchronized'))
  .catch(err => console.error('Session store sync error:', err));

sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync error:', err));

// Define model associations
defineAssociations();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/plannings', planningRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/classes', classeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/niveaux', niveauRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/zoom', zoomRoutes);

// Serve static files
app.use('/Uploads', express.static('Uploads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  },
}));

// Start cron jobs
startCronJobs();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});