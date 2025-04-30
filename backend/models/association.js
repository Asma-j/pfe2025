const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const Cours = require('./Cours');
const Matiere = require('./Matiere');
const Utilisateur = require('./Utilisateur');
const StudentAnswer = require('./StudentAnswer');

module.exports = function defineAssociations() {
  // Quiz associations
  Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });

  // QuizQuestion associations
  QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });

  // StudentAnswer associations
  StudentAnswer.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', onDelete: 'CASCADE' });
  StudentAnswer.belongsTo(QuizQuestion, { foreignKey: 'question_id', onDelete: 'CASCADE' });

  // Return models for use elsewhere
  return {
    Quiz,
    QuizQuestion,
    Cours,
    Matiere,
    Utilisateur,
    StudentAnswer,
  };
};