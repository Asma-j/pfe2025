const express = require('express');
const router = express.Router();
const niveauController = require('../controllers/niveauController');

// Routes pour les niveaux
router.get('/', niveauController.getAllNiveaux); // Obtenir tous les niveaux
router.get('/:id', niveauController.getNiveauById); // Obtenir un niveau par ID
router.post('/', niveauController.createNiveau); // Ajouter un nouveau niveau
router.put('/:id', niveauController.updateNiveau); // Mettre à jour un niveau
router.delete('/:id', niveauController.deleteNiveau); // Supprimer un niveau

module.exports = router;