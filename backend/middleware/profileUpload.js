const multer = require('multer');
const path = require('path');

// Configuration de stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/'); // Stocke les fichiers dans le dossier Uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filtrer les fichiers acceptés (images uniquement pour le profil)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Seules les images (JPEG, PNG, JPG) sont autorisées.'),
      false
    );
  }
};

// Configuration pour un seul fichier avec le champ 'photo'
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
}).single('photo'); // Accepte un seul fichier avec le nom de champ 'photo'

module.exports = upload;