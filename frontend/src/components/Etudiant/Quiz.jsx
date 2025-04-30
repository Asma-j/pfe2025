import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import StudentNavbar from './StudentNavbar';

const Quiz = () => {
  const { matiere_id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [userProfile, setUserProfile] = useState({ id: null });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Utilisateur non authentifié. Veuillez vous connecter.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile({ id: response.data.id });
      } catch (err) {
        setError('Erreur lors de la récupération du profil utilisateur');
        setLoading(false);
      }
    };

    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/quiz/matiere/${matiere_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(response.data);
        setLoading(false);
      } catch (err) {
        setError('Aucun quiz disponible pour cette matière');
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchQuiz();
  }, [matiere_id]);

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedAnswers = Object.keys(answers).map((question_id) => ({
        question_id: parseInt(question_id),
        selected_option: answers[question_id],
      }));

      const response = await axios.post(
        'http://localhost:5000/api/quiz/submit',
        { utilisateur_id: userProfile.id, quiz_id: quiz.id, answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
    } catch (err) {
      setError('Erreur lors de la soumission du quiz');
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return (
    <div className="container mt-4">
      <StudentNavbar />
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => navigate('/courses')}>Retour aux cours</Button>
    </div>
  );
  if (!quiz) return (
    <div className="container mt-4">
      <StudentNavbar />
      <Alert variant="info">Quiz non trouvé</Alert>
      <Button onClick={() => navigate('/courses')}>Retour aux cours</Button>
    </div>
  );

  return (
    <div className="container mt-4">
      <StudentNavbar />
      <h2>Quiz: {quiz.titre}</h2>
      {result ? (
        <Alert variant="success">
          <h4>Résultat</h4>
          <p>Score: {result.score} / {result.maxScore}</p>
          <p>Pourcentage: {result.percentage.toFixed(2)}%</p>
          <Button onClick={() => navigate('/courses')}>Retour aux cours</Button>
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            {quiz.QuizQuestions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <h5>{index + 1}. {question.text}</h5>
                <Form>
                  {question.options.map((option, optIndex) => (
                    <Form.Check
                      key={optIndex}
                      type="radio"
                      label={option.text}
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optIndex}
                      onChange={() => handleAnswerChange(question.id, optIndex)}
                    />
                  ))}
                </Form>
              </div>
            ))}
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.QuizQuestions.length}
            >
              Soumettre
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Quiz;