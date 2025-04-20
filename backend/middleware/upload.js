const multer = require('multer');
const path = require('path');

// Configuration de stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads/'); // Stocke les fichiers dans le dossier uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtrer les fichiers acceptés (images, PDFs, Word, PowerPoint, vidéos)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'video/mpeg',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier invalide. Formats autorisés : images, PDFs, Word, PowerPoint, vidéos.'), false);
    }
};

// Configuration pour accepter plusieurs types de fichiers
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // Increase limit to 500MB per file
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'files', maxCount: 10 },
    { name: 'video', maxCount: 1 },
]);

module.exports = upload;