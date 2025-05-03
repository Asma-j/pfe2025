const express = require('express');
const router = express.Router();
const { generateQuiz, getQuiz, submitQuiz, getQuizResults } = require('../controllers/QuizController');
const authMiddleware = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');

router.post('/generate', authMiddleware, generateQuiz); // Teacher or admin only
router.get('/matiere/:matiereId', authMiddleware, getQuiz); // Use the validated getQuiz function
router.post('/submit', authMiddleware, submitQuiz);
router.get('/results', authMiddleware, getQuizResults);

module.exports = router;