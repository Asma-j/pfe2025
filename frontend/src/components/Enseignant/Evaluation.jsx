import React, { useState, useEffect } from 'react';
import './Evaluation.css';

const Evaluation = () => {
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [quizDuration, setQuizDuration] = useState(30); // Default duration in minutes
  const [niveau, setNiveau] = useState(''); // New state for level
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Define level options
  const levelOptions = [
    { value: '1', label: 'Beginner' },
    { value: '2', label: 'Intermediate' },
    { value: '3', label: 'Advanced' },
  ];

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matieres', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMatieres(data);
          if (data.length > 0) {
            setSelectedMatiere(data[0].id);
            setNiveau('1'); // Default to Beginner
          }
        } else {
          setError(data.message || 'Erreur lors du chargement des matières');
        }
      } catch (err) {
        setError('Erreur réseau lors du chargement des matières');
      }
    };

    fetchMatieres();
  }, []);

  useEffect(() => {
    if (!selectedMatiere || !niveau) return;

    const fetchQuiz = async () => {
      setLoading(true);
      setError('');
      setQuiz(null);

      try {
        const response = await fetch(`http://localhost:5000/api/quiz/matiere/${selectedMatiere}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          if (data.QuizQuestions) {
            data.QuizQuestions = data.QuizQuestions.map((question) => ({
              ...question,
              options: Array.isArray(question.options)
                ? question.options
                : typeof question.options === 'string'
                ? JSON.parse(question.options)
                : [{ text: 'Default Option', isCorrect: false }],
            }));
          }
          setQuiz(data);
        } else {
          setError(data.message || 'Erreur lors du chargement du quiz');
        }
      } catch (err) {
        setError('Erreur réseau lors du chargement du quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [selectedMatiere, niveau]); // Add niveau to dependencies

  const handleGenerateQuiz = async () => {
    if (!selectedMatiere) {
      setError('Veuillez sélectionner une matière');
      return;
    }
    if (!niveau) {
      setError('Veuillez sélectionner un niveau');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/quiz/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matiere_id: selectedMatiere,
          setDuration: quizDuration,
          niveau, // Include niveau in the request
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const quizResponse = await fetch(`http://localhost:5000/api/quiz/matiere/${selectedMatiere}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const quizData = await quizResponse.json();
        if (quizResponse.ok) {
          if (quizData.QuizQuestions) {
            quizData.QuizQuestions = quizData.QuizQuestions.map((question) => ({
              ...question,
              options: Array.isArray(question.options)
                ? question.options
                : typeof question.options === 'string'
                ? JSON.parse(question.options)
                : [{ text: 'Default Option', isCorrect: false }],
            }));
          }
          setQuiz(quizData);
        } else {
          setError(quizData.message || 'Erreur lors du chargement du quiz généré');
        }
      } else {
        setError(data.message || 'Erreur lors de la génération du quiz');
      }
    } catch (err) {
      setError('Erreur réseau lors de la génération du quiz');
    } finally {
      setLoading(false);
    }
  };

  const isGenericOption = (text) => {
    const genericPatterns = [
      /Incorrect Option/,
      /Alternative Option/,
      /Try updating/,
      /Check if your internet/,
      /Use a different framework/,
      /It’s a frontend issue/,
      /Modified version/,
      /Common misconception/,
    ];
    return genericPatterns.some((pattern) => pattern.test(text));
  };

  return (
    <div className="evaluation-container">
      <div className="evaluation-card">
        <h1 className="evaluation-title">Gestion des Évaluations</h1>
        {error && <div className="error-alert">{error}</div>}
        <div className="evaluation-controls">
          <div className="form-group">
            <label htmlFor="matiere" className="form-label">
              Sélectionner une Matière
            </label>
            <select
              id="matiere"
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="form-select"
            >
              <option value="">-- Choisir une matière --</option>
              {matieres.map((matiere) => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="niveau" className="form-label">
              Sélectionner un Niveau
            </label>
            <select
              id="niveau"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value)}
              className="form-select"
            >
              <option value="">-- Choisir un niveau --</option>
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quizDuration" className="form-label">
              Durée du Quiz (en minutes)
            </label>
            <input
              type="number"
              id="quizDuration"
              value={quizDuration}
              onChange={(e) => setQuizDuration(Number(e.target.value))}
              min="1"
              className="form-input"
              placeholder="Entrez la durée en minutes"
            />
          </div>
          <button
            onClick={handleGenerateQuiz}
            disabled={loading || !selectedMatiere || !niveau}
            className={`generate-button ${loading || !selectedMatiere || !niveau ? 'disabled' : ''}`}
          >
            {loading ? (
              <span className="loading-spinner">Génération en cours...</span>
            ) : (
              'Générer un Quiz'
            )}
          </button>
        </div>
      </div>

      <div className="quiz-display">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : quiz ? (
          <div className="quiz-card">
            <h2 className="quiz-title">{quiz.titre}</h2>
            <div className="quiz-info">
              <p>
                Matière:{' '}
                {matieres.find((m) => m.id === quiz.matiere_id)?.nom || 'Inconnue'}
              </p>
              <p>
                Niveau:{' '}
                {levelOptions.find((opt) => opt.value === niveau)?.label || 'Inconnu'}
              </p>
              <p>Durée: {quiz.setDuration} minutes</p>
            </div>
            <h3 className="questions-title">Questions</h3>
            {quiz.QuizQuestions && quiz.QuizQuestions.length > 0 ? (
              <ul className="questions-list">
                {quiz.QuizQuestions.map((question, index) => {
                  const hasGenericOptions = question.options.some((option) =>
                    isGenericOption(option.text)
                  );
                  return (
                    <li key={question.id} className="question-item">
                      <p className="question-text">
                        {index + 1}. {question.text}
                      </p>
                      {hasGenericOptions && (
                        <p className="warning-text">
                          Certaines options semblent génériques. Essayez de régénérer.
                        </p>
                      )}
                      <ul className="options-list">
                        {Array.isArray(question.options) ? (
                          question.options.map((option, optIndex) => (
                            <li
                              key={optIndex}
                              className={`option-item ${option.isCorrect ? 'correct' : ''}`}
                            >
                              {optIndex + 1}. {option.text}{' '}
                              {option.isCorrect ? (
                                <span className="correct-badge">Correcte</span>
                              ) : null}
                            </li>
                          ))
                        ) : (
                          <li className="error-text">Options invalides</li>
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="no-questions">Aucune question disponible.</p>
            )}
          </div>
        ) : (
          <div className="no-quiz">
            <p>Aucun quiz trouvé. Veuillez en générer un.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluation;