const multer = require('multer');
const path = require('path');

// Configuration de stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Stocke les fichiers dans le dossier uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

// Filtrer les fichiers acceptés (uniquement images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier invalide (seules les images sont autorisées).'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
