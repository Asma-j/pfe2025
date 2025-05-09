const { Quiz, QuizQuestion, StudentAnswer, Cours, Matiere } = require('../models/association')();
const sanitizeHtml = require('sanitize-html');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const Bottleneck = require('bottleneck');
const { Op } = require('sequelize');
const he = require('he');

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
  minTime: 2000,
});

exports.generateQuiz = async (req, res) => {
  const cleanText = (text) => {
    if (!text) return 'Reponse correcte par defaut';
    let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    const sentences = cleaned.split('. ').filter(s => s.trim().length > 0);
    const limitedText = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
    const maxLength = 2000;
    if (limitedText.length > maxLength) {
      return limitedText.substring(0, maxLength - 3) + '...';
    }
    return limitedText.length > 0 ? limitedText : 'Reponse correcte par defaut';
  };

  function generateDynamicDistractors(correctAnswer, subjectTag) {
    const distractors = [];
    const words = correctAnswer.split(' ').filter(word => word.length > 3);
    if (words.length === 0) words.push('technology');

    const sentences = correctAnswer.split('. ').filter(s => s.trim().length > 0);
    const baseSentence = sentences[0] || correctAnswer;

    for (let i = 0; i < 3; i++) {
      let distractor = baseSentence;
      switch (i) {
        case 0:
          distractor = distractor.replace(words[0], `non${words[0]}`).replace('is', 'is not');
          break;
        case 1:
          const replacements = {
            'javascript': 'typescript',
            'reactjs': 'angular',
            'node.js': 'express',
            'python': 'java',
            'java': 'kotlin',
          };
          distractor = distractor.replace(words[0], replacements[subjectTag] || 'alternative');
          break;
        case 2:
          distractor += ` using ${words.length > 1 ? words[1] : 'outdated'} methods`;
          break;
      }
      distractors.push(cleanText(distractor));
    }
    return distractors;
  }

  try {
    const { matiere_id, setDuration } = req.body;
    console.log('Generation du quiz pour matiere_id:', matiere_id, 'setDuration:', setDuration);

    const matiere = await Matiere.findByPk(matiere_id);
    if (!matiere) {
      console.log('Matiere non trouvee pour l ID:', matiere_id);
      return res.status(404).json({ message: 'Matiere non trouvee' });
    }
    console.log('Matiere trouvee:', matiere.nom);

    const courses = await Cours.findAll({ where: { matiere_id } });
    if (!courses.length) {
      console.log('Aucun cours trouve pour matiere_id:', matiere_id);
      return res.status(404).json({ message: 'Aucun cours trouve pour cette matiere' });
    }
    console.log('Cours trouves:', courses.length);

    const tagMap = {
      'NodeJS': 'node.js',
      'ReactJS': 'reactjs',
      'Python': 'python',
      'Java': 'java',
      'JavaScript': 'javascript',
    };

    const subjectTag = tagMap[matiere.nom] || matiere.nom.toLowerCase().replace(/\s+/g, '');
    console.log('Utilisation du tag Stack Overflow:', subjectTag);

    let stackOverflowQuestions;
    try {
      const response = await limiter.schedule(() =>
        axios.get('https://api.stackexchange.com/2.3/questions', {
          params: {
            order: 'desc',
            sort: 'votes',
            site: 'stackoverflow',
            pagesize: 50,
            tagged: subjectTag,
            key: process.env.STACK_OVERFLOW_API_KEY,
          },
        })
      );
      console.log('Statut de la reponse API Stack Overflow:', response.status);
      console.log('Donnees de la reponse API Stack Overflow:', response.data);

      stackOverflowQuestions = response.data.items;
    } catch (apiError) {
      console.error('Echec de la recuperation des questions depuis Stack Overflow:', apiError.message);
      stackOverflowQuestions = [
        {
          question_id: 'fallback-1',
          title: `Qu est ce que ${matiere.nom} ?`,
          answers: [{ body: `${matiere.nom} est une technologie ou un langage utilise en programmation.`, is_accepted: true }],
        },
        {
          question_id: 'fallback-2',
          title: `Quelle est une fonctionnalite cle de ${matiere.nom} ?`,
          answers: [{ body: `Une fonctionnalite cle de ${matiere.nom} est sa capacite a gerer des taches specifiques.`, is_accepted: true }],
        },
        {
          question_id: 'fallback-3',
          title: `Comment ${matiere.nom} est il utilise dans le developpement ?`,
          answers: [{ body: `${matiere.nom} est utilise pour creer des applications de maniere efficace.`, is_accepted: true }],
        },
      ];
    }

    if (!stackOverflowQuestions || stackOverflowQuestions.length === 0) {
      console.log('Aucune question trouvee via l API Stack Overflow, utilisation des questions de secours');
      stackOverflowQuestions = [
        {
          question_id: 'fallback-1',
          title: `Qu est ce que ${matiere.nom} ?`,
          answers: [{ body: `${matiere.nom} est une technologie ou un langage utilise en programmation.`, is_accepted: true }],
        },
        {
          question_id: 'fallback-2',
          title: `Quelle est une fonctionnalite cle de ${matiere.nom} ?`,
          answers: [{ body: `Une fonctionnalite cle de ${matiere.nom} est sa capacite a gerer des taches specifiques.`, is_accepted: true }],
        },
        {
          question_id: 'fallback-3',
          title: `Comment ${matiere.nom} est il utilise dans le developpement ?`,
          answers: [{ body: `${matiere.nom} est utilise pour creer des applications de maniere efficace.`, is_accepted: true }],
        },
      ];
    }
    console.log('Questions recuperees:', stackOverflowQuestions.length);

    const selectedQuestions = stackOverflowQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);
    console.log('Questions selectionnees:', selectedQuestions.length);

    const cours_id = courses[0].id;
    console.log('Cours_id selectionne:', cours_id);

    const existingQuizzes = await Quiz.findAll({ where: { matiere_id } });
    if (existingQuizzes.length > 0) {
      console.log(`Trouve ${existingQuizzes.length} quiz existants pour matiere_id ${matiere_id}, suppression...`);
      for (const quiz of existingQuizzes) {
        await QuizQuestion.destroy({ where: { quiz_id: quiz.id } });
        await quiz.destroy();
      }
      console.log('Quiz existants supprimes');
    }

    console.log('Creating quiz with setDuration:', setDuration);
    const quiz = await Quiz.create({
      matiere_id,
      cours_id,
      titre: `Evaluation complete de ${matiere.nom}`,
      setDuration: setDuration || 30,
    });
    console.log('Quiz created with setDuration:', quiz.setDuration);

    let createdQuestionCount = 0;

    for (const q of selectedQuestions) {
      console.log('Traitement de la question ID:', q.question_id);
      let answerResponse;
      try {
        answerResponse = await limiter.schedule(() =>
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
        console.log('Statut de la reponse API pour la question', q.question_id, ':', answerResponse.status);
      } catch (err) {
        console.warn(`Echec de la recuperation des reponses pour la question ${q.question_id}:`, err.message);
        answerResponse = { data: { items: [] } };
      }

      const answers = answerResponse.data.items || q.answers || [];
      console.log('Reponses trouvees pour la question', q.question_id, ':', answers.length);

      const acceptedAnswer = answers.find(ans => ans.is_accepted) || answers[0] || null;

      let correctAnswerText = 'Reponse correcte par defaut';
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
      console.log('Reponse nettoyee pour la question', q.question_id, ':', correctAnswerText);

      const distractors = generateDynamicDistractors(correctAnswerText, subjectTag);

      const options = [
        { text: correctAnswerText, isCorrect: true },
        { text: distractors[0], isCorrect: false },
        { text: distractors[1], isCorrect: false },
        { text: distractors[2], isCorrect: false },
      ].sort(() => Math.random() - 0.5);
      console.log('Options generees pour la question', q.question_id, ':', options);

      const isValidOptions = Array.isArray(options) && options.every(opt => opt.text && typeof opt.isCorrect === 'boolean');
      if (!isValidOptions) {
        console.warn(`Structure d options invalide pour la question ${q.question_id}:`, options);
        continue;
      }

      let serializedOptions;
      try {
        serializedOptions = JSON.stringify(options);
        JSON.parse(serializedOptions);
      } catch (err) {
        console.warn(`JSON invalide pour la question ${q.question_id}:`, options, err);
        continue;
      }

      console.log(`Creation de la question ${q.question_id}, reponse nettoyee:`, correctAnswerText);

      try {
        const cleanedTitle = cleanText(q.title || 'Question par defaut');
        await QuizQuestion.create({
          quiz_id: quiz.id,
          text: cleanedTitle,
          options,
        });
        createdQuestionCount++;
        console.log(`Question ${q.question_id} creee avec succes pour le quiz ${quiz.id}`);
      } catch (err) {
        console.error(`Echec de la creation de la question ${q.question_id} pour le quiz ${quiz.id}:`, err);
        continue;
      }
    }

    console.log('Nombre total de questions creees:', createdQuestionCount);

    if (createdQuestionCount === 0) {
      console.log('Aucune question creee; suppression du quiz:', quiz.id);
      try {
        await Quiz.destroy({ where: { id: quiz.id } });
        console.log('Quiz supprime avec succes');
      } catch (err) {
        console.error('Echec de la suppression du quiz:', err);
      }
      return res.status(400).json({ message: 'Aucune question valide disponible pour ce quiz' });
    }

    res.status(201).json({
      message: `Quiz genere avec ${createdQuestionCount} question(s)`,
      quiz,
    });
  } catch (error) {
    console.error('Erreur lors de la generation du quiz :', error);
    res.status(500).json({ message: 'Erreur lors de la generation du quiz', error: error.message });
  }
};
// Other exports remain unchanged
exports.getQuiz = async (req, res) => {
  try {
    const { matiereId } = req.params;

    const matiere_id_num = parseInt(matiereId, 10);
    if (isNaN(matiere_id_num) || matiereId === 'undefined' || matiere_id_num <= 0) {
      console.log(`Invalid matiereId: ${matiereId}`);
      return res.status(400).json({ message: 'Identifiant de matiere invalide' });
    }

    console.log(`Fetching quiz for matiere_id: ${matiere_id_num}`);
    const quiz = await Quiz.findOne({
      where: { matiere_id: matiere_id_num },
      include: [{ model: QuizQuestion }],
      logging: console.log,
    });

    if (!quiz) {
      console.log(`No quiz found for matiere_id: ${matiere_id_num}`);
      return res.status(404).json({ message: 'Quiz non trouve' });
    }

    console.log(`Quiz found: ${quiz.id}, title: ${quiz.titre}`);
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};


exports.getQuiz = async (req, res) => {
  try {
    const { matiereId } = req.params;

    const matiere_id_num = parseInt(matiereId, 10);
    if (isNaN(matiere_id_num) || matiereId === 'undefined' || matiere_id_num <= 0) {
      console.log(`Invalid matiereId: ${matiereId}`);
      return res.status(400).json({ message: 'Identifiant de matière invalide' });
    }

    console.log(`Fetching quiz for matiere_id: ${matiere_id_num}`);
    const quiz = await Quiz.findOne({
      where: { matiere_id: matiere_id_num },
      include: [{ model: QuizQuestion }],
      logging: console.log,
    });

    if (!quiz) {
      console.log(`No quiz found for matiere_id: ${matiere_id_num}`);
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    console.log(`Quiz found: ${quiz.id}, title: ${quiz.titre}`);
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { utilisateur_id, quiz_id, answers, duration } = req.body;
    let totalScore = 0;

    const totalQuestions = await QuizQuestion.count({ where: { quiz_id } });

    // Update the Quiz record with the timeTaken (previously duration)
    await Quiz.update(
      { timeTaken: duration },
      { where: { id: quiz_id } }
    );

    for (const answer of answers) {
      const question = await QuizQuestion.findByPk(answer.question_id);
      console.log('Question options:', question.options, 'Selected option:', answer.selected_option);
      if (!question) continue;

      let parsedOptions = question.options;
      if (typeof parsedOptions === 'string') {
        try {
          parsedOptions = JSON.parse(parsedOptions);
        } catch (e) {
          console.error('Error parsing options:', e);
          continue;
        }
      }

      if (!Array.isArray(parsedOptions)) {
        console.error('Options is not an array:', parsedOptions);
        continue;
      }

      const correctAnswer = parsedOptions.find(option => option.isCorrect)?.text;
      if (!correctAnswer) {
        console.warn('No correct answer found for question:', answer.question_id);
        continue;
      }

      const selectedAnswerText = parsedOptions[answer.selected_option]?.text;
      const isCorrect = selectedAnswerText === correctAnswer;
      const score = isCorrect ? 1 : 0;
      totalScore += score;

      console.log(`Question ${answer.question_id}: Selected "${selectedAnswerText}", Correct "${correctAnswer}", Match: ${isCorrect}`);

      await StudentAnswer.create({
        utilisateur_id,
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        score,
      });
    }

    const maxScore = totalQuestions;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    res.status(200).json({ message: 'Quiz submitted', score: totalScore, maxScore, percentage, timeTaken: duration });
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
    const quiz = await Quiz.findByPk(quiz_id);
    const totalScore = answers.reduce((sum, ans) => sum + ans.score, 0);
    const totalQuestions = await QuizQuestion.count({ where: { quiz_id } });
    const maxScore = totalQuestions;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    res.status(200).json({ answers, totalScore, maxScore, percentage, timeTaken: quiz.timeTaken, setDuration: quiz.setDuration });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Error fetching quiz results', error: error.message });
  }
};