const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  console.log('Auth Middleware - Token:', token);
  console.log('Auth Middleware - Session:', req.session.user);

  if (!token) {
    return res.status(401).json({ message: 'Authentification requise: token manquant' });
  }

  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentification requise: session invalide' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ message: 'Erreur de configuration du serveur' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    
    const user = await Utilisateur.findOne({
      where: { id: decoded.id },
      include: [{ model: Role, attributes: ['nom_role'] }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.session.user.id !== user.id || req.session.user.role !== user.Role.nom_role) {
      return res.status(401).json({ message: 'Session et token non correspondants' });
    }

    req.user = {
      id: user.id,
      role: user.Role ? user.Role.nom_role : null,
    };
    console.log('req.user:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré, veuillez vous reconnecter' });
    }
    res.status(401).json({ message: 'Token invalide', error: error.message });
  }
};

module.exports = authMiddleware;