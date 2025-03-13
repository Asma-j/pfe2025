const express = require('express');
const router = express.Router();
const matiereController = require('../controllers/matiereController');
const upload = require('../middleware/upload');

router.get('/', matiereController.getAllMatieres);
router.get('/:id', matiereController.getMatiereById);
router.post('/', upload.single('image'), matiereController.createMatiere); 
router.put('/:id', upload.single('image'), matiereController.updateMatiere); 
router.delete('/:id', matiereController.deleteMatiere);

module.exports = router;
