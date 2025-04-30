const { Quiz, QuizQuestion, StudentAnswer, Cours, Matiere } = require('../models/association')();
const sanitizeHtml = require('sanitize-html');
// Note : Les dépendances suivantes ne sont pas utilisées dans cette version, mais conservées au cas où vous souhaiteriez utiliser l'API Hugging Face ultérieurement
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const Bottleneck = require('bottleneck');

// Configuration retry d’Axios (non utilisé ici, mais conservé)
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`Nouvelle tentative #${retryCount}`);
    return retryCount * 2000;
  },
  retryCondition: (error) => {
    return error.response && error.response.status === 429;
  },
});

const limiter = new Bottleneck({
  minTime: 2000, // 2 secondes entre chaque appel pour respecter les 30 RPM
});



exports.generateQuiz = async (req, res) => {
  const cleanText = (text) => {
    if (!text) return 'Correct Answer (Default)';
    let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    const maxLength = 2000;
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength - 3) + '...';
    }
    return cleaned.length > 0 ? cleaned : 'Correct Answer (Default)';
  };

  try {
    const { matiere_id } = req.body;
    const matiere = await Matiere.findByPk(matiere_id);
    if (!matiere) return res.status(404).json({ message: 'Matière non trouvée' });

    const courses = await Cours.findAll({ where: { matiere_id } });
    if (!courses.length) return res.status(404).json({ message: 'Aucun cours trouvé pour cette matière' });

    const response = await limiter.schedule(() =>
      axios.get('https://api.stackexchange.com/2.3/questions', {
        params: {
          order: 'desc',
          sort: 'votes',
          site: 'stackoverflow',
          pagesize: 50,
          key: process.env.STACK_OVERFLOW_API_KEY,
        },
      })
    );

    const stackOverflowQuestions = response.data.items;
    if (!stackOverflowQuestions || stackOverflowQuestions.length === 0) {
      return res.status(404).json({ message: 'Aucune question trouvée pour ReactJS sur Stack Overflow' });
    }

    const selectedQuestions = stackOverflowQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    const cours_id = courses[0].id;

    const quiz = await Quiz.create({
      matiere_id,
      cours_id,
      titre: `${matiere.nom} Comprehensive Evaluation`,
    });

    let createdQuestionCount = 0;

    for (const q of selectedQuestions) {
      const answerResponse = await limiter.schedule(() =>
        axios.get(`https://api.stackexchange.com/2.3/questions/${q.question_id}/answers`, {
          params: {
            order: 'desc',
            sort: 'votes',
            site: 'stackoverflow',
            filter: 'withbody',
            key: process.env.STACK_OVERFLOW_API_KEY,
          },
        })
      );

      const answers = answerResponse.data.items;
      if (!answers || answers.length === 0) {
        console.warn(`No answers found for question ${q.question_id}`);
        continue;
      }

      const acceptedAnswer = answers.find(ans => ans.is_accepted) || answers[0];

      // Use other answers (not the accepted one) as distractors
      const otherAnswers = answers
        .filter(ans => ans.answer_id !== acceptedAnswer.answer_id) // Exclude the accepted answer
        .sort((a, b) => b.score - a.score) // Sort by score to pick the most plausible ones
        .slice(0, 3); // Take up to 3 other answers as distractors

      let correctAnswerText = 'Correct Answer (Default)';
      if (acceptedAnswer && acceptedAnswer.body) {
        correctAnswerText = sanitizeHtml(acceptedAnswer.body, {
          allowedTags: [],
          allowedAttributes: {},
          transformTags: {
            'code': (tagName, attribs) => ({ tagName: 'span', attribs }),
            'pre': (tagName, attribs) => ({ tagName: 'span', attribs }),
          },
        });
        correctAnswerText = cleanText(correctAnswerText);
      }

      // Generate distractors from other answers or fallback to variations
      const distractors = [];
      for (let i = 0; i < 3; i++) {
        if (otherAnswers[i] && otherAnswers[i].body) {
          let distractorText = sanitizeHtml(otherAnswers[i].body, {
            allowedTags: [],
            allowedAttributes: {},
            transformTags: {
              'code': (tagName, attribs) => ({ tagName: 'span', attribs }),
              'pre': (tagName, attribs) => ({ tagName: 'span', attribs }),
            },
          });
          distractorText = cleanText(distractorText);
          distractors.push(distractorText);
        } else {
          // Fallback: Generate a plausible incorrect option by modifying the correct answer
          distractors.push(generatePlausibleIncorrectOption(correctAnswerText, i));
        }
      }

      const options = [
        { text: correctAnswerText, isCorrect: true },
        { text: distractors[0], isCorrect: false },
        { text: distractors[1], isCorrect: false },
        { text: distractors[2], isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      const isValidOptions = options.every(opt => opt.text && typeof opt.isCorrect === 'boolean');
      if (!isValidOptions) {
        console.warn(`Invalid options structure for question ${q.question_id}:`, options);
        continue;
      }

      try {
        const serializedOptions = JSON.stringify(options);
        if (serializedOptions.length > 65535) {
          console.warn(`Options for question ${q.question_id} are very large: ${serializedOptions.length} characters`);
        }
      } catch (err) {
        console.warn(`Invalid JSON for question ${q.question_id}:`, options, err);
        continue;
      }

      console.log(`Creating question ${q.question_id}, sanitized answer:`, correctAnswerText);

      try {
        await QuizQuestion.create({
          quiz_id: quiz.id,
          text: q.title || 'Default question',
          options,
        });
        createdQuestionCount++;
      } catch (err) {
        console.error(`Failed to create question ${q.question_id} for quiz ${quiz.id}:`, err);
        continue;
      }
    }

    if (createdQuestionCount === 0) {
      await Quiz.destroy({ where: { id: quiz.id } });
      return res.status(400).json({ message: 'Aucune question valide disponible pour ce quiz' });
    }

    res.status(201).json({
      message: `Quiz généré avec ${createdQuestionCount} question(s) à partir de Stack Overflow`,
      quiz,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du quiz :', error);
    res.status(500).json({ message: 'Erreur lors de la génération du quiz', error: error.message });
  }
};

// Helper function to generate plausible incorrect options
const generatePlausibleIncorrectOption = (correctAnswer, index) => {
  // Basic logic to modify the correct answer for distractors
  // This can be improved based on the type of question
  if (correctAnswer.includes('git')) {
    // For Git-related questions, provide common Git mistakes
    const gitDistractors = [
      'git ignore ...', // Misnaming .gitignore
      'git rm ...', // Incorrect command for ignoring
      'git add -f ...', // Forcing add instead of ignoring
    ];
    return gitDistractors[index] || `Incorrect Git Option ${index + 1}`;
  } else if (correctAnswer.includes('push')) {
    // For Git push-related questions, provide common push mistakes
    const pushDistractors = [
      'git push origin master', // Pushing to wrong branch
      'git push -u origin', // Missing branch name
      'git pull ...', // Wrong command (pull instead of push)
    ];
    return pushDistractors[index] || `Incorrect Push Option ${index + 1}`;
  }
  // Fallback for generic incorrect options
  return `Incorrect Option ${index + 1} (Modified)`;
};;
// Rest of the controller remains unchanged
exports.getQuiz = async (req, res) => {
  try {
    const { matiere_id } = req.params;
    const quiz = await Quiz.findOne({
      where: { matiere_id },
      include: [{ model: QuizQuestion }],
      logging: console.log,
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz non trouvé' });
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { utilisateur_id, quiz_id, answers } = req.body;
    let totalScore = 0;

    for (const answer of answers) {
      const question = await QuizQuestion.findByPk(answer.question_id);
      if (!question) continue;

      const isCorrect = question.options[answer.selected_option]?.isCorrect || false;
      const score = isCorrect ? 1 : 0;
      totalScore += score;

      await StudentAnswer.create({
        utilisateur_id,
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        score,
      });
    }

    const maxScore = answers.length;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    res.status(200).json({ message: 'Quiz submitted', score: totalScore, maxScore, percentage });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const { utilisateur_id, quiz_id } = req.query;
    const answers = await StudentAnswer.findAll({
      where: {
        utilisateur_id,
        question_id: {
          [Op.in]: (await QuizQuestion.findAll({ where: { quiz_id } })).map(q => q.id),
        },
      },
      include: [{ model: QuizQuestion }],
    });

    const totalScore = answers.reduce((sum, ans) => sum + ans.score, 0);
    const maxScore = answers.length;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    res.status(200).json({ answers, totalScore, maxScore, percentage });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Error fetching quiz results', error: error.message });
  }
};