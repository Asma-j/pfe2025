const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, presenceController.saveAttendance);
router.get('/:planningId', authMiddleware, presenceController.getAttendance);
router.post('/notify-quiz', authMiddleware, presenceController.sendQuizNotification);

module.exports = router;