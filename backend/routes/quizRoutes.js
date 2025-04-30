const express = require('express');
const router = express.Router();
const { generateQuiz, getQuiz, submitQuiz, getQuizResults } = require('../controllers/QuizController');
const authMiddleware = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');

router.post('/generate', authMiddleware, generateQuiz); // Teacher or admin only
router.get('/matiere/:matiereId', async (req, res) => {
    try {
      const { matiereId } = req.params;
      const quiz = await Quiz.findOne({
        where: { matiere_id: matiereId },
        include: [{ model: QuizQuestion, as: 'QuizQuestions' }],
        order: [['createdAt', 'DESC']], // Fetch the most recent quiz
      });
      if (!quiz) {
        console.log(`No quiz found for matiereId: ${matiereId}`);
        return res.status(404).json({ message: 'Aucun quiz trouvé pour cette matière' });
      }
      console.log(`Fetched quiz for matiereId ${matiereId}:`, {
        quizId: quiz.id,
        title: quiz.titre,
        questionCount: quiz.QuizQuestions ? quiz.QuizQuestions.length : 0,
      });
      res.json(quiz);
    } catch (error) {
      console.error('Erreur lors du chargement du quiz:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  });
router.post('/submit', authMiddleware, submitQuiz);
router.get('/results', authMiddleware, getQuizResults);

module.exports = router;