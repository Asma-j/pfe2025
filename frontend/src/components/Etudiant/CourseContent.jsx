import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Button,
  ListGroup,
  Form,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import { FaPlayCircle, FaCalendarAlt, FaQuestionCircle } from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import axios from "axios";
import "./content.css";

const CourseContent = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/cours/?${id}`
        );
        setCourse(response.data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Erreur lors de la récupération du contenu du cours");
        setLoading(false);
      }
    };
    fetchCourseContent();
  }, [id]);

  const handleQuizChange = (questionId, answer) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    setQuizSubmitted(true);

    const score = quizQuestions.reduce((acc, question) => {
      return quizAnswers[question.id] === question.correctAnswer
        ? acc + 50
        : acc;
    }, 0);
    setProgress(score);
    console.log("Quiz Answers:", quizAnswers);
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!course) return <div className="text-center mt-5">Cours non trouvé</div>;

  const schedule = [
    { date: "2025-04-10", topic: "Introduction aux composants React" },
    { date: "2025-04-12", topic: "Gestion de l'état avec useState" },
    { date: "2025-04-14", topic: "Props et communication entre composants" },
  ];

  const quizQuestions = [
    {
      id: 1,
      question: "Que fait le hook useState dans React ?",
      options: [
        "Gère les effets secondaires",
        "Gère l'état d'un composant",
        "Rend un composant réactif",
        "Crée des routes",
      ],
      correctAnswer: "Gère l'état d'un composant",
    },
    {
      id: 2,
      question: "Quelle est la syntaxe correcte pour passer des props ?",
      options: [
        "<Component props={value} />",
        "<Component {...props} />",
        "<Component value={props} />",
        "<Component props />",
      ],
      correctAnswer: "<Component {...props} />",
    },
  ];

  return (
    <div className="course-content-container">
      <StudentNavbar />

      {/* Course Title and Progress */}
      <div className="course-header">
        <h2>{course.titre || "Titre non disponible"}</h2>
      </div>

      <Row>
        {/* Main Content (Video and Schedule) */}
        <Col md={8}>
          {/* Video Section */}
          <Card className="video-card mb-4">
            <Card.Body>
              <h4 className="section-title">
                <FaPlayCircle className="me-2" /> Vidéo du cours
              </h4>
              <video
                width="100%"
                height="400"
                controls
                className="video-player"
              >
                <source
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  type="video/mp4"
                />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </Card.Body>
          </Card>

          {/* Schedule Section */}
          <Card className="schedule-card mb-4">
            <Card.Body>
              <h4 className="section-title">
                <FaCalendarAlt className="me-2" /> Planning du cours
              </h4>
              <ListGroup variant="flush">
                {schedule.map((item, index) => (
                  <ListGroup.Item key={index} className="schedule-item">
                    <span className="schedule-date">{item.date}</span>:{" "}
                    {item.topic}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar (Quiz) */}
        <Col md={4}>
          <Card className="quiz-card">
            <Card.Body>
              <h4 className="section-title">
                <FaQuestionCircle className="me-2" /> Quiz d'évaluation
              </h4>
              <Form onSubmit={handleQuizSubmit}>
                {quizQuestions.map((question) => (
                  <div key={question.id} className="mb-4 quiz-question">
                    <p className="question-text">{question.question}</p>
                    {question.options.map((option, index) => (
                      <Form.Check
                        key={index}
                        type="radio"
                        label={option}
                        name={`question-${question.id}`} // Fixed syntax
                        value={option}
                        onChange={() => handleQuizChange(question.id, option)}
                        disabled={quizSubmitted}
                        className="quiz-option"
                      />
                    ))}
                    {quizSubmitted && (
                      <p
                        className={
                          quizAnswers[question.id] === question.correctAnswer
                            ? "text-success mt-2"
                            : "text-danger mt-2"
                        }
                      >
                        {quizAnswers[question.id] === question.correctAnswer
                          ? "Correct !"
                          : `Incorrect. La bonne réponse est : ${question.correctAnswer}`}{" "}
                        {/* Fixed syntax */}
                      </p>
                    )}
                  </div>
                ))}
                {!quizSubmitted && (
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-50 custom-button"
                  >
                    Soumettre le quiz
                  </Button>
                )}
                {quizSubmitted && (
                  <Button
                    variant="secondary"
                    className="w-100 custom-button"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                      setProgress(0);
                    }}
                  >
                    Recommencer
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseContent;
