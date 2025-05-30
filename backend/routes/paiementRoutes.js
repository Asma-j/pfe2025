const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');

// Routes for Paiement
router.get('/check-status', paiementController.checkPaymentStatus); 
router.post('/', paiementController.createPaiement);
router.get('/', paiementController.getAllPaiements);
router.get('/:id', paiementController.getPaiementById); 
router.put('/:id', paiementController.updatePaiementStatus);
router.delete('/:id', paiementController.deletePaiement);

module.exports = router;