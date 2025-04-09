const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const Cours = require('../models/Cours');

// Create a new quiz for a course
exports.createQuiz = async (req, res) => {
  try {
    const { titre, description, cours_id, questions } = req.body;

    // Validate course existence
    const course = await Cours.findByPk(cours_id);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Create the quiz
    const quiz = await Quiz.create({
      titre,
      description,
      cours_id,
    });

    // Create associated questions
    if (questions && questions.length > 0) {
      const quizQuestions = questions.map((question) => ({
        quiz_id: quiz.id,
        question: question.question,
        options: {
          options: question.options,
          correctAnswer: question.correctAnswer,
        },
      }));
      await QuizQuestion.bulkCreate(quizQuestions);
    }

    // Fetch the quiz with its questions
    const createdQuiz = await Quiz.findByPk(quiz.id, {
      include: [QuizQuestion],
    });

    res.status(201).json({ message: 'Quiz créé avec succès', quiz: createdQuiz });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du quiz', error: error.message });
  }
};

// Get all quizzes for a specific course
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const { cours_id } = req.params;

    const quizzes = await Quiz.findAll({
      where: { cours_id },
      include: [QuizQuestion],
    });

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'Aucun quiz trouvé pour ce cours' });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des quizzes', error: error.message });
  }
};

// Get a specific quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [QuizQuestion],
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du quiz', error: error.message });
  }
};

// Submit a quiz attempt
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quiz_id, utilisateur_id, answers } = req.body;

    // Validate quiz and user
    const quiz = await Quiz.findByPk(quiz_id, { include: [QuizQuestion] });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    const user = await Utilisateur.findByPk(utilisateur_id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Calculate score
    const totalQuestions = quiz.QuizQuestions.length;
    if (totalQuestions === 0) {
      return res.status(400).json({ message: 'Ce quiz n\'a pas de questions' });
    }

    const scorePerQuestion = 100 / totalQuestions;
    let score = 0;

    quiz.QuizQuestions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.options.correctAnswer) {
        score += scorePerQuestion;
      }
    });

    // Round the score to the nearest integer
    score = Math.round(score);

    // Save the quiz attempt
    const quizAttempt = await QuizAttempt.create({
      utilisateur_id,
      quiz_id,
      score,
      answers,
    });

    res.status(201).json({ message: 'Quiz soumis avec succès', score, quizAttempt });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la soumission du quiz', error: error.message });
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, questions } = req.body;

    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    // Update quiz details
    await quiz.update({ titre, description });

    // Update questions (delete existing and create new ones)
    if (questions && questions.length > 0) {
      await QuizQuestion.destroy({ where: { quiz_id: id } }); // Delete existing questions
      const quizQuestions = questions.map((question) => ({
        quiz_id: id,
        question: question.question,
        options: {
          options: question.options,
          correctAnswer: question.correctAnswer,
        },
      }));
      await QuizQuestion.bulkCreate(quizQuestions);
    }

    // Fetch updated quiz
    const updatedQuiz = await Quiz.findByPk(id, { include: [QuizQuestion] });

    res.status(200).json({ message: 'Quiz mis à jour avec succès', quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du quiz', error: error.message });
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }
    await QuizQuestion.destroy({ where: { quiz_id: id } });
    await QuizAttempt.destroy({ where: { quiz_id: id } });
    await quiz.destroy();

    res.status(200).json({ message: 'Quiz supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du quiz', error: error.message });
  }
};