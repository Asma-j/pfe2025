const Paiement = require('../models/Paiement');
const Utilisateur = require('../models/Utilisateur');
const Cours = require('../models/Cours');

// Create a new payment
exports.createPaiement = async (req, res) => {
    try {
        const { montant, methode_paiement, utilisateur_id, cours_id } = req.body;

        // Validate required fields
        if (!montant || !methode_paiement || !utilisateur_id || !cours_id) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user and course exist
        const user = await Utilisateur.findByPk(utilisateur_id);
        const cours = await Cours.findByPk(cours_id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!cours) return res.status(404).json({ message: 'Course not found' });

        const paiement = await Paiement.create({
            montant,
            methode_paiement,
            utilisateur_id,
            cours_id
        });

        res.status(201).json({ message: 'Payment created successfully', paiement });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

// Get all payments
exports.getAllPaiements = async (req, res) => {
    try {
        const paiements = await Paiement.findAll({
            include: [
                { model: Utilisateur, attributes: ['id', 'prenom', 'nom', 'email'] },
                { model: Cours, attributes: ['id', 'titre'] }
            ]
        });
        res.status(200).json(paiements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

// Get payment by ID
exports.getPaiementById = async (req, res) => {
    try {
        const paiement = await Paiement.findByPk(req.params.id, {
            include: [
                { model: Utilisateur, attributes: ['id', 'prenom', 'nom', 'email'] },
                { model: Cours, attributes: ['id', 'titre'] }
            ]
        });
        
        if (!paiement) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        
        res.status(200).json(paiement);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment', error: error.message });
    }
};

// Update payment status
exports.updatePaiementStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const paiement = await Paiement.findByPk(req.params.id);
        
        if (!paiement) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (!['En attente', 'Complété', 'Échoué'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        await paiement.update({ status });
        res.status(200).json({ message: 'Payment status updated', paiement });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment', error: error.message });
    }
};

// Delete payment
exports.deletePaiement = async (req, res) => {
    try {
        const paiement = await Paiement.findByPk(req.params.id);
        
        if (!paiement) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        
        await paiement.destroy();
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
};