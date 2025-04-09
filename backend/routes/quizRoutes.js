const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/QuizController');

// Create a new quiz
router.post('/', QuizController.createQuiz);

// Get all quizzes for a specific course
router.get('/course/:cours_id', QuizController.getQuizzesByCourse);

// Get a specific quiz by ID
router.get('/:id', QuizController.getQuizById);

// Submit a quiz attempt
router.post('/attempt', QuizController.submitQuizAttempt);

// Update a quiz
router.put('/:id', QuizController.updateQuiz);

// Delete a quiz
router.delete('/:id', QuizController.deleteQuiz);

module.exports = router;