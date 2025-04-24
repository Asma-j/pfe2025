const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const authMiddleware = require('../middleware/auth');
// Routes CRUD
router.post('/', planningController.createPlanning);
router.get('/', planningController.getAllPlannings);
router.get('/:id', planningController.getPlanningById);
router.put('/:id', planningController.updatePlanning);
router.delete('/:id', planningController.deletePlanning);
router.put('/:id/status', authMiddleware, planningController.updatePlanningStatus);
module.exports = router;
