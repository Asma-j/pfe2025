import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Alert, ListGroup, Modal } from 'react-bootstrap';
import axios from 'axios';
import StudentNavbar from './StudentNavbar';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [userProfile, setUserProfile] = useState({ id: null });
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  console.log('id from useParams:', id);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Utilisateur non authentifié.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile({ id: response.data.id });
      } catch (err) {
        setError('Erreur profil utilisateur.');
        setLoading(false);
      }
    };

    const fetchQuiz = async () => {
      if (!id || isNaN(id) || id === 'undefined') {
        console.log('Invalid id:', id);
        setError('ID matière invalide.');
        setLoading(false);
        setTimeout(() => navigate('/courses'), 2000);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('Fetching quiz with id:', id);
        const response = await axios.get(`http://localhost:5000/api/quiz/matiere/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Quiz data:', response.data);
        setQuiz(response.data);
        setLoading(false);
      } catch (err) {
        setError('Aucun quiz disponible.');
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchQuiz();
  }, [id, navigate]);

  const handleAnswerChange = (questionId, optionIndex) => {
    console.log(`Answer changed for question ${questionId}: Selected option index ${optionIndex}`);
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedAnswers = Object.keys(answers).map((question_id) => ({
        question_id: parseInt(question_id),
        selected_option: answers[question_id],
      }));

      console.log('Submitting answers:', formattedAnswers);

      const response = await axios.post(
        'http://localhost:5000/api/quiz/submit',
        { utilisateur_id: userProfile.id, quiz_id: quiz.id, answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resultsResponse = await axios.get('http://localhost:5000/api/quiz/results', {
        headers: { Authorization: `Bearer ${token}` },
        params: { utilisateur_id: userProfile.id, quiz_id: quiz.id },
      });

      setResult({
        ...response.data,
        answers: resultsResponse.data.answers,
      });

      setShowSubmitModal(false);
    } catch (err) {
      setError('Erreur soumission quiz.');
      setShowSubmitModal(false);
    }
  };

  const handleSubmitClick = () => {
    if (Object.keys(answers).length !== quiz?.QuizQuestions?.length) {
      setShowSubmitModal(true);
    } else {
      handleSubmit();
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return (
    <div className="container mt-4">
      <StudentNavbar />
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => navigate('/courses')}>Retour</Button>
    </div>
  );
  if (!quiz) return (
    <div className="container mt-4">
      <StudentNavbar />
      <Alert variant="info">Quiz non trouvé</Alert>
      <Button onClick={() => navigate('/courses')}>Retour</Button>
    </div>
  );

  return (
    <div className="container mt-4">
      <StudentNavbar />
      <h2 className="mb-2">Quiz: {quiz.titre}</h2>
      {result ? (
        <div>
          <Alert variant="success" className="mb-4">
            <h4>Résultat</h4>
            <p>Score: {result.score} / {result.maxScore}</p>
            <p>Pourcentage: {result.percentage.toFixed(2)}%</p>
          </Alert>
          <h4 className="mb-2">Détails :</h4>
          <ListGroup>
            {result.answers.map((answer, index) => {
              let parsedOptions = answer.QuizQuestion.options;
              if (typeof parsedOptions === 'string') {
                try {
                  parsedOptions = JSON.parse(parsedOptions);
                } catch (e) {
                  console.error('Parse error:', e);
                  parsedOptions = [];
                }
              }
              if (!Array.isArray(parsedOptions)) parsedOptions = [];

              return (
                <ListGroup.Item
                  key={answer.id}
                  variant={answer.score === 1 ? 'success' : 'danger'}
                  className="mb-2"
                >
                  <strong>Question {index + 1}: {answer.QuizQuestion.text}</strong>
                  <p className="mt-1">
                    Votre réponse: {parsedOptions[answer.selected_option]?.text || 'Non répondu'}
                    {answer.score === 1 ? ' ✅' : ' ❌'}
                  </p>
                  {answer.score === 0 && (
                    <p>Réponse correcte: {parsedOptions.find(opt => opt.isCorrect)?.text || 'N/A'}</p>
                  )}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          <Button className="mt-3" onClick={() => navigate('/courses')}>
            Retour
          </Button>
        </div>
      ) : (
        <Card>
          <Card.Body>
            {quiz.QuizQuestions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <h5 className="mb-2">{index + 1}. {question.text}</h5>
                <Form>
                  {(() => {
                    if (!question.options) return <Alert variant="warning">Options manquantes</Alert>;
                    if (typeof question.options === 'string') {
                      try {
                        const parsedOptions = JSON.parse(question.options);
                        if (Array.isArray(parsedOptions)) {
                          console.log(`Options for question ${question.id}:`, parsedOptions);
                          return parsedOptions.map((option, optIndex) => (
                            <Form.Check
                              key={optIndex}
                              type="radio"
                              label={<span>{option.text}</span>}
                              name={`question-${question.id}`}
                              checked={answers[question.id] === optIndex}
                              onChange={() => handleAnswerChange(question.id, optIndex)}
                              className="mb-2"
                            />
                          ));
                        }
                      } catch (e) {
                        return <Alert variant="warning">Options invalides</Alert>;
                      }
                    }
                    if (Array.isArray(question.options)) {
                      console.log(`Options for question ${question.id}:`, question.options);
                      return question.options.map((option, optIndex) => (
                        <Form.Check
                          key={optIndex}
                          type="radio"
                          label={<span>{option.text}</span>}
                          name={`question-${question.id}`}
                          checked={answers[question.id] === optIndex}
                          onChange={() => handleAnswerChange(question.id, optIndex)}
                          className="mb-2"
                        />
                      ));
                    }
                    return <Alert variant="warning">Options invalides</Alert>;
                  })()}
                </Form>
              </div>
            ))}
            <Button onClick={handleSubmitClick} className="mt-3">
              Soumettre
            </Button>
          </Card.Body>
        </Card>
      )}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Questions non répondues. Soumettre quand même?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Soumettre
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Quiz;