const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard', authMiddleware, statisticsController.getDashboardStats);
router.get('/engagement', authMiddleware, statisticsController.getEngagementStats);

module.exports = router;