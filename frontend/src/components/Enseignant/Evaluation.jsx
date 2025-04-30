import React, { useState, useEffect } from 'react';

const Evaluation = () => {
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!selectedMatiere) return;

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
          // Ensure options is an array for each question
          if (data.QuizQuestions) {
            data.QuizQuestions = data.QuizQuestions.map(question => ({
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
  }, [selectedMatiere]);

const handleGenerateQuiz = async () => {
  if (!selectedMatiere) {
    setError('Veuillez sélectionner une matière');
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
      body: JSON.stringify({ matiere_id: selectedMatiere }),
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
          quizData.QuizQuestions = quizData.QuizQuestions.map(question => ({
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Évaluations</h1>

      <div className="mb-4">
        <label htmlFor="matiere" className="block text-sm font-medium text-gray-700">
          Sélectionner une Matière
        </label>
        <select
          id="matiere"
          value={selectedMatiere}
          onChange={(e) => setSelectedMatiere(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Choisir une matière --</option>
          {matieres.map((matiere) => (
            <option key={matiere.id} value={matiere.id}>
              {matiere.nom}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerateQuiz}
        disabled={loading || !selectedMatiere}
        className={`mb-4 px-4 py-2 bg-blue-600 text-white rounded-md ${
          loading || !selectedMatiere ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {loading ? 'Génération en cours...' : 'Générer un Quiz'}
      </button>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : quiz ? (
        <div className="border p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-2">{quiz.titre}</h2>
          <p className="text-gray-600 mb-4">Matière ID: {quiz.matiere_id}</p>
          <h3 className="text-lg font-medium mb-2">Questions :</h3>
          {quiz.QuizQuestions && quiz.QuizQuestions.length > 0 ? (
            <ul className="space-y-4">
              {quiz.QuizQuestions.map((question, index) => (
                <li key={question.id} className="border-b pb-2">
                  <p className="font-medium">
                    {index + 1}. {question.text}
                  </p>
                  <ul className="ml-4 mt-1">
                    {Array.isArray(question.options) ? (
                      question.options.map((option, optIndex) => {
                        const maxDisplayLength = 200;
                        const displayText =
                          option.text.length > maxDisplayLength
                            ? `${option.text.substring(0, maxDisplayLength)}...`
                            : option.text;
                        return (
                          <li
                            key={optIndex}
                            className={`text-sm ${
                              option.isCorrect ? 'text-green-600 font-semibold' : 'text-gray-600'
                            }`}
                          >
                            {optIndex + 1}. {displayText} {option.isCorrect ? '(Correcte)' : ''}
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-sm text-red-600">Erreur : Options non valides</li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucune question disponible pour ce quiz.</p>
          )}
        </div>
      ) : (
        <p>Aucun quiz trouvé pour cette matière. Cliquez sur "Générer un Quiz" pour en créer un.</p>
      )}
    </div>
  );
};

export default Evaluation;