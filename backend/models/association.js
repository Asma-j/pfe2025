const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const Cours = require('./Cours');
const Matiere = require('./Matiere');
const Utilisateur = require('./Utilisateur');
const StudentAnswer = require('./StudentAnswer');
const Classe = require('./Classe');
const UtilisateurClasse = require('./UtilisateurClasse');
const Niveau = require('./Niveau');
const Paiement = require('./Paiement'); // Add this line

let associationsDefined = false;

module.exports = function defineAssociations() {
  if (associationsDefined) {
    console.log('Associations already defined, skipping...');
    return {
      Quiz,
      QuizQuestion,
      Cours,
      Matiere,
      Utilisateur,
      StudentAnswer,
      Classe,
      UtilisateurClasse,
      Niveau,
      Paiement // Add Paiement to the return object
    };
  }

  // Quiz associations
  Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });
  QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });

  // StudentAnswer associations
  StudentAnswer.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', onDelete: 'CASCADE' });
  StudentAnswer.belongsTo(QuizQuestion, { foreignKey: 'question_id', onDelete: 'CASCADE' });

  // Log existing associations before defining AssociatedClasses
  console.log('Utilisateur associations before AssociatedClasses:', Object.keys(Utilisateur.associations));
  Niveau.hasMany(Matiere, { foreignKey: 'niveauId', onDelete: 'CASCADE' });
  Matiere.belongsTo(Niveau, { foreignKey: 'niveauId' });

  // Utilisateur-Classe many-to-many association
  Utilisateur.belongsToMany(Classe, {
    through: UtilisateurClasse,
    foreignKey: 'utilisateur_id',
    otherKey: 'classe_id',
    as: 'AssociatedClasses' // New unique alias
  });

  Classe.belongsToMany(Utilisateur, {
    through: UtilisateurClasse,
    foreignKey: 'classe_id',
    otherKey: 'utilisateur_id',
    as: 'Utilisateurs'
  });

  // Paiement associations
  Paiement.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  Paiement.belongsTo(Cours, { foreignKey: 'cours_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

  // Log associations after defining AssociatedClasses
  console.log('Utilisateur associations after AssociatedClasses:', Object.keys(Utilisateur.associations));

  associationsDefined = true;

  // Return models for use elsewhere
  return {
    Quiz,
    QuizQuestion,
    Cours,
    Matiere,
    Utilisateur,
    StudentAnswer,
    Classe,
    UtilisateurClasse,
    Niveau,
    Paiement 
  };
};