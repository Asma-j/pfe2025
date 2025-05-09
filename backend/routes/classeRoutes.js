const express = require('express');
const router = express.Router();
const classeController = require('../controllers/classeController');

router.get('/', classeController.getAllClasses);
router.get('/:id', classeController.getClasseById);
router.get('/niveau/:niveauId', classeController.getClassesByNiveauId); // New endpoint
router.post('/', classeController.createClasse);
router.put('/:id', classeController.updateClasse);
router.delete('/:id', classeController.deleteClasse);

module.exports = router;