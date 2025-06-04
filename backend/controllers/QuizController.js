const { Quiz, QuizQuestion, StudentAnswer, Cours, Matiere } = require('../models/association')();
const sanitizeHtml = require('sanitize-html');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const Bottleneck = require('bottleneck');
const { Op } = require('sequelize');
const he = require('he');
const { pipeline } = require('transformers'); 


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

let questionGenerator;
try {
  console.log('Loading question generation model...');
  questionGenerator = pipeline('text2text-generation', 't5-small'); // T5 is better for question generation
  console.log('Question generation model loaded successfully');
} catch (err) {
  console.error('Failed to load question generation model:', err);
}

exports.generateQuiz = async (req, res) => {
  const cleanText = (text) => {
    if (!text) return 'Default correct answer';
    let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    const sentences = cleaned.split('. ').filter(s => s.trim().length > 0);
    const limitedText = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
    const maxLength = 2000;
    if (limitedText.length > maxLength) {
      return limitedText.substring(0, maxLength - 3) + '...';
    }
    return limitedText.length > 0 ? limitedText : 'Default correct answer';
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

  async function generateQuestionsFromCourseContent(course, subjectTag, level, numQuestions = 3) {
    const questions = [];
    const content = [
      course.titre || '',
      course.description || '',
      course.module || '',
      course.video_script || '',
    ].join(' ').trim();

    if (!content) {
      console.log('No content available for course:', course.id);
      return questions;
    }

    // Map level to difficulty description
    const levelMap = {
      '1': 'beginner-level, focusing on basic concepts and definitions',
      '2': 'intermediate-level, focusing on practical applications and problem-solving',
      '3': 'advanced-level, focusing on complex scenarios and optimizations',
    };
    const levelDescription = levelMap[level] || 'general-level';

    try {
      for (let i = 0; i < numQuestions; i++) {
        const prompt = `Generate a ${levelDescription} multiple-choice question based on the following content about ${subjectTag}: "${content.substring(0, 500)}". Provide the question, one correct answer, and three incorrect answers. Format as JSON: { "question": "", "correct_answer": "", "incorrect_answers": ["", "", ""] }`;
        const response = await questionGenerator(prompt, {
          max_length: 300,
          num_return_sequences: 1,
        });

        const generated = response[0].generated_text;
        let parsed;
        try {
          parsed = JSON.parse(generated);
        } catch (err) {
          console.warn('Failed to parse generated question:', generated);
          continue;
        }

        if (
          parsed.question &&
          parsed.correct_answer &&
          Array.isArray(parsed.incorrect_answers) &&
          parsed.incorrect_answers.length === 3
        ) {
          const options = [
            { text: cleanText(parsed.correct_answer), isCorrect: true },
            ...parsed.incorrect_answers.map(text => ({ text: cleanText(text), isCorrect: false })),
          ].sort(() => Math.random() - 0.5);

          questions.push({
            text: cleanText(parsed.question),
            options,
          });
        }
      }
    } catch (err) {
      console.error('Error generating questions from course content:', err);
    }

    return questions;
  }

  try {
    const { matiere_id, setDuration, niveau } = req.body;
    console.log('Generating quiz for matiere_id:', matiere_id, 'setDuration:', setDuration, 'niveau:', niveau);

    // Validate input
    if (!matiere_id || !setDuration || !niveau) {
      return res.status(400).json({ message: 'matiere_id, setDuration, and niveau are required' });
    }
    if (!['1', '2', '3'].includes(niveau)) {
      return res.status(400).json({ message: 'Invalid niveau; must be 1, 2, or 3' });
    }

    // Fetch subject
    const matiere = await Matiere.findByPk(matiere_id);
    if (!matiere) {
      console.log('Subject not found for ID:', matiere_id);
      return res.status(404).json({ message: 'Subject not found' });
    }
    console.log('Subject found:', matiere.nom);

    // Fetch courses for the specified level
    const courses = await Cours.findAll({
      where: {
        matiere_id,
        niveau, // Assumes Cours model has a niveau field
      },
    });

    if (!courses.length) {
      console.log(`No courses found for matiere_id: ${matiere_id} and niveau: ${niveau}`);

      const fallbackCourses = await Cours.findAll({ where: { matiere_id } });
      if (!fallbackCourses.length) {
        return res.status(404).json({ message: 'No courses found for this subject' });
      }
      console.log('Falling back to all courses:', fallbackCourses.length);
      courses.push(...fallbackCourses);
    }
    console.log('Courses found:', courses.length);

    // Map subject to Stack Overflow tag
    const tagMap = {
      'NodeJS': 'node.js',
      'ReactJS': 'reactjs',
      'Python': 'python',
      'Java': 'java',
      'JavaScript': 'javascript',
    };
    const subjectTag = tagMap[matiere.nom] || matiere.nom.toLowerCase().replace(/\s+/g, '');
    console.log('Using Stack Overflow tag:', subjectTag);

    // Generate questions from course content
    let allQuestions = [];
    for (const course of courses) {
      const courseQuestions = await generateQuestionsFromCourseContent(course, subjectTag, niveau);
      allQuestions = [...allQuestions, ...courseQuestions];
      console.log(`Generated ${courseQuestions.length} questions for course ${course.id}`);
    }

    // Supplement with Stack Overflow questions if needed
    const minQuestions = 10;
    if (allQuestions.length < minQuestions) {
      console.log('Insufficient course-based questions, fetching from Stack Overflow');
      let stackOverflowQuestions;
      try {
        // Adjust Stack Overflow query based on level
        const levelFilters = {
          '1': { min_votes: 10, max_votes: 50 }, // Beginner: simpler questions
          '2': { min_votes: 50, max_votes: 100 }, // Intermediate: moderately complex
          '3': { min_votes: 100 }, // Advanced: complex questions
        };
        const filter = levelFilters[niveau] || {};

        const response = await limiter.schedule(() =>
          axios.get('https://api.stackexchange.com/2.3/questions', {
            params: {
              order: 'desc',
              sort: 'votes',
              site: 'stackoverflow',
              pagesize: 50,
              tagged: subjectTag,
              key: process.env.STACK_OVERFLOW_API_KEY,
              ...filter,
            },
          })
        );
        console.log('Stack Overflow API response status:', response.status);
        stackOverflowQuestions = response.data.items;
      } catch (apiError) {
        console.error('Failed to fetch questions from Stack Overflow:', apiError.message);
        stackOverflowQuestions = [
          {
            question_id: `fallback-1-${niveau}`,
            title: `What is ${matiere.nom} at level ${niveau}?`,
            answers: [{ body: `${matiere.nom} is a technology or language used in programming at level ${niveau}.`, is_accepted: true }],
          },
          {
            question_id: `fallback-2-${niveau}`,
            title: `What is a key feature of ${matiere.nom} at level ${niveau}?`,
            answers: [{ body: `A key feature of ${matiere.nom} is its ability to handle specific tasks at level ${niveau}.`, is_accepted: true }],
          },
          {
            question_id: `fallback-3-${niveau}`,
            title: `How is ${matiere.nom} used in development at level ${niveau}?`,
            answers: [{ body: `${matiere.nom} is used to create applications efficiently at level ${niveau}.`, is_accepted: true }],
          },
        ];
      }

      const selectedQuestions = stackOverflowQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, minQuestions - allQuestions.length);

      for (const q of selectedQuestions) {
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
        } catch (err) {
          console.warn(`Failed to fetch answers for question ${q.question_id}:`, err.message);
          answerResponse = { data: { items: [] } };
        }

        const answers = answerResponse.data.items || q.answers || [];
        const acceptedAnswer = answers.find(ans => ans.is_accepted) || answers[0] || null;

        let correctAnswerText = 'Default correct answer';
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

        const distractors = generateDynamicDistractors(correctAnswerText, subjectTag);
        const options = [
          { text: correctAnswerText, isCorrect: true },
          { text: distractors[0], isCorrect: false },
          { text: distractors[1], isCorrect: false },
          { text: distractors[2], isCorrect: false },
        ].sort(() => Math.random() - 0.5);

        allQuestions.push({
          text: cleanText(q.title || 'Default question'),
          options,
        });
      }
    }

    // Delete existing quizzes
    const existingQuizzes = await Quiz.findAll({ where: { matiere_id } });
    if (existingQuizzes.length > 0) {
      console.log(`Found ${existingQuizzes.length} existing quizzes for matiere_id ${matiere_id}, deleting...`);
      for (const quiz of existingQuizzes) {
        await QuizQuestion.destroy({ where: { quiz_id: quiz.id } });
        await quiz.destroy();
      }
      console.log('Existing quizzes deleted');
    }

    // Create new quiz
    const cours_id = courses[0].id;
    const levelName = { '1': 'Beginner', '2': 'Intermediate', '3': 'Advanced' }[niveau] || 'General';
    const quiz = await Quiz.create({
      matiere_id,
      cours_id,
      titre: `${levelName} ${matiere.nom} Assessment`,
      setDuration: setDuration || 30,
    });
    console.log('Quiz created with ID:', quiz.id);

    // Save questions
    let createdQuestionCount = 0;
    for (const q of allQuestions) {
      try {
        await QuizQuestion.create({
          quiz_id: quiz.id,
          text: q.text,
          options: q.options,
        });
        createdQuestionCount++;
        console.log(`Question created for quiz ${quiz.id}`);
      } catch (err) {
        console.error('Failed to create question:', err);
        continue;
      }
    }

    if (createdQuestionCount === 0) {
      console.log('No questions created; deleting quiz:', quiz.id);
      await Quiz.destroy({ where: { id: quiz.id } });
      return res.status(400).json({ message: 'No valid questions available for this quiz' });
    }

    res.status(201).json({
      message: `Quiz generated with ${createdQuestionCount} question(s)`,
      quiz,
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ message: 'Error generating quiz', error: error.message });
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
    if (totalQuestions !== 20) {
      console.warn(`Expected 20 questions, but found ${totalQuestions} for quiz_id: ${quiz_id}`);
    }

    // Clear previous answers for this user and quiz
    await StudentAnswer.destroy({
      where: {
        utilisateur_id,
        question_id: {
          [Op.in]: (await QuizQuestion.findAll({ where: { quiz_id } })).map(q => q.id),
        },
      },
    });
    console.log(`Cleared previous answers for utilisateur_id: ${utilisateur_id}, quiz_id: ${quiz_id}`);

    // Update the Quiz record with the timeTaken
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