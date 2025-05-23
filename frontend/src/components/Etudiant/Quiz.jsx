import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Alert, ListGroup, Modal } from 'react-bootstrap';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import StudentNavbar from './StudentNavbar';
import "./quiz.css";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [userProfile, setUserProfile] = useState({ id: null, prenom: '', nom: '' });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [timeUp, setTimeUp] = useState(false);

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
        setUserProfile({ 
          id: response.data.id, 
          prenom: response.data.prenom || '', 
          nom: response.data.nom || '' 
        });
      } catch (err) {
        setError('Erreur lors de la récupération du profil utilisateur.');
        setLoading(false);
      }
    };

    const fetchQuiz = async () => {
      if (!id || isNaN(id) || id === 'undefined') {
        console.log('Invalid id:', id);
        setError('ID de matière invalide.');
        setLoading(false);
        setTimeout(() => navigate('/courses'), 2000);
        return;
      }

      // Reset all states for a fresh quiz attempt
      setAnswers({});
      setResult(null);
      setTimeUp(false);
      setShowSubmitModal(false);
      setRemainingTime(null);
      setStartTime(null);

      try {
        const token = localStorage.getItem('token');
        console.log('Fetching quiz with id:', id);
        const response = await axios.get(`http://localhost:5000/api/quiz/matiere/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Quiz data:', response.data);
        setQuiz(response.data);
        setStartTime(Date.now());
        setRemainingTime(response.data.setDuration * 60);
        setLoading(false);
      } catch (err) {
        setError('Aucun quiz disponible.');
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchQuiz();
  }, [id, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (remainingTime === null || result || timeUp) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = quiz.setDuration * 60 - elapsed;
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        setTimeUp(true);
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, startTime, quiz, result, timeUp]);

  const handleAnswerChange = (questionId, optionIndex) => {
    console.log(`Answer changed for question ${questionId}: Selected option index ${optionIndex}`);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    try {
      const endTime = Date.now();
      const timeTakenInSeconds = Math.floor((endTime - startTime) / 1000);

      const token = localStorage.getItem('token');
      const formattedAnswers = Object.keys(answers).map((question_id) => ({
        question_id: parseInt(question_id),
        selected_option: answers[question_id],
      }));
      console.log('Submitting answers:', formattedAnswers, 'Time taken (seconds):', timeTakenInSeconds);

      const response = await axios.post(
        'http://localhost:5000/api/quiz/submit',
        {
          utilisateur_id: userProfile.id,
          quiz_id: quiz.id,
          answers: formattedAnswers,
          duration: timeTakenInSeconds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resultsResponse = await axios.get('http://localhost:5000/api/quiz/results', {
        headers: { Authorization: `Bearer ${token}` },
        params: { utilisateur_id: userProfile.id, quiz_id: quiz.id },
      });

      setResult({
        ...response.data,
        answers: resultsResponse.data.answers,
        timeTaken: timeTakenInSeconds,
      });

      setShowSubmitModal(false);
      setTimeUp(true);
    } catch (err) {
      setError('Erreur lors de la soumission du quiz.');
      setShowSubmitModal(false);
    }
  };

  const handleSubmitClick = () => {
    console.log('Current answers state:', answers);
    if (Object.keys(answers).length !== quiz?.QuizQuestions?.length) {
      setShowSubmitModal(true);
    } else {
      handleSubmit();
    }
  };

  const generateCertificate = () => {
    const doc = new jsPDF();

    // Gradient header
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, 210, 50, 'F'); // Header background
    doc.setFillColor(139, 92, 246); // Purple
    doc.triangle(0, 50, 210, 50, 210, 0, 'F'); // Gradient effect

    // Double decorative border
    doc.setLineWidth(1.5);
    doc.setDrawColor(59, 130, 246); // Blue
    doc.rect(10, 10, 190, 280, 'D'); // Outer border
    doc.setLineWidth(0.5);
    doc.setDrawColor(139, 92, 246); // Purple
    doc.rect(14, 14, 182, 272, 'D'); // Inner border

    // Watermark
    doc.setFont('Times', 'italic');
    doc.setFontSize(60);
    doc.setTextColor(240, 240, 240); // Light gray
    doc.text('CERTIFICAT', 105, 150, { align: 'center', angle: 45 });

    // Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255); // White
    doc.text('CERTIFICAT DE RÉUSSITE', 105, 30, { align: 'center' });

    // Decorative line
    doc.setLineWidth(1);
    doc.setDrawColor(255, 215, 0); // Gold
    doc.line(40, 40, 170, 40);
    doc.setLineWidth(0.5);
    doc.setDrawColor(255, 255, 255);
    doc.line(40, 42, 170, 42);

    // User name
    doc.setFont('Times', 'normal');
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39); // Dark gray
    doc.text('Délivré à', 105, 70, { align: 'center' });
    doc.setFont('Times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`${userProfile.prenom} ${userProfile.nom}`.trim(), 105, 85, { align: 'center' });

    // Quiz details
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('Pour la réussite du quiz :', 105, 110, { align: 'center' });
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text(quiz.titre, 105, 125, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`Score obtenu : ${result.score} / ${result.maxScore}`, 105, 140, { align: 'center' });
    doc.text(`Pourcentage : ${result.percentage.toFixed(2)}%`, 105, 155, { align: 'center' });

    // Current date and time
    const today = new Date();
    const formattedDate = today.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', '');
    doc.text(`Date de délivrance : ${formattedDate}`, 105, 170, { align: 'center' });

    // Validation text
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99); // Gray
    doc.text('Ce certificat atteste que l’utilisateur a réussi le quiz avec un score supérieur à 70%,', 105, 200, { align: 'center' });
    doc.text('démontrant une maîtrise significative des compétences évaluées.', 105, 210, { align: 'center' });

    // Decorative seal
    doc.setDrawColor(255, 215, 0); // Gold
    doc.setFillColor(255, 255, 255);
    doc.circle(105, 250, 20, 'FD'); // Outer circle
    doc.setLineWidth(0.3);
    doc.setDrawColor(59, 130, 246);
    doc.circle(105, 250, 18, 'D'); // Inner circle
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text('Plateforme', 105, 245, { align: 'center' });
    doc.text('d’Apprentissage', 105, 255, { align: 'center' });

    // Signature
    doc.setFont('Times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('Émis par la Plateforme d’Apprentissage', 105, 280, { align: 'center' });

    // Download the PDF
    doc.save(`Certificat_${quiz.titre}_${userProfile.prenom}_${userProfile.nom}.pdf`);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
      <h2 className="quiz">Quiz: {quiz.titre}</h2>
      {!result && !timeUp && (
        <div className="bg-blue-100">
          <p>
            Durée totale: {formatTime(quiz.setDuration * 60)} | Temps restant: {remainingTime !== null ? formatTime(remainingTime > 0 ? remainingTime : 0) : 'Calcul...'}
          </p>
        </div>
      )}
      {timeUp && !result && (
        <Alert variant="warning" className="mb-4">
          Temps écoulé ! Le quiz est en cours de soumission...
        </Alert>
      )}
      {result && (
        <div className="result-card">
          <Alert variant={result.percentage >= 70 ? 'success' : 'warning'} className="result-alert mb-4">
            <h4 className="result-title">Résultat</h4>
            <div className="result-details">
              <p>Score: <span className="result-value">{result.score}</span> / <span className="result-value">{result.maxScore}</span></p>
              <p>Pourcentage: <span className="result-value">{result.percentage.toFixed(2)}%</span></p>
              <p>Temps pris: <span className="result-value">{formatTime(result.timeTaken)}</span></p>
            </div>
            {result.percentage >= 70 && (
              <Button variant="primary" className="certificate-btn mt-4" onClick={generateCertificate}>
                Télécharger le Certificat
              </Button>
            )}
            {result.percentage < 70 && (
              <p className="result-feedback">Continuez à vous entraîner pour améliorer votre score !</p>
            )}
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
                    {answer.score === 1 ? ' (Correct)' : ' (Incorrect)'}
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
      )}
      {!timeUp && (
        <Card className='quizcard'>
          <Card.Body className='bodycard'>
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
                              disabled={timeUp}
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
                            disabled={timeUp}
                          />
                        ));
                      }
                      return <Alert variant="warning">Options invalides</Alert>;
                    })()}
                  </Form>
                </div>
              ))}
              <Button onClick={handleSubmitClick} className="buttonSub mt-3" disabled={timeUp}>
                Soumettre
              </Button>
            </Card.Body>
          </Card>
        )}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton className='modalquiz'>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalquizbody'>Questions non répondues. Soumettre quand même ?</Modal.Body>
        <Modal.Footer className='modalquizfooter'>
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