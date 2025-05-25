const express = require('express');
const router = express.Router();
const matiereController = require('../controllers/matiereController');
const upload = require('../middleware/upload');

router.get('/', matiereController.getAllMatieres);
router.get('/niveau/:niveauId', matiereController.getMatieresByNiveau);
router.get('/:id', matiereController.getMatiereById);
router.post('/', upload, matiereController.createMatiere); 
router.put('/:id', upload, matiereController.updateMatiere); 
router.delete('/:id', matiereController.deleteMatiere);

module.exports = router;
