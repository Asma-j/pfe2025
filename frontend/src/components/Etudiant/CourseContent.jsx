import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  ListGroup,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { FaPlayCircle, FaCalendarAlt, FaFilePdf, FaFileAlt } from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import axios from "axios";
import "./content.css";

const CourseContent = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(
          `http://localhost:5000/api/cours/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Course data:', response.data); // Debug log
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Erreur lors de la récupération du contenu du cours");
        setLoading(false);
      }
    };
    fetchCourseContent();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!course) return <div className="text-center mt-5">Cours non trouvé</div>;

  const schedule = [
    { date: "2025-04-10", topic: "Introduction aux composants React" },
    { date: "2025-04-12", topic: "Gestion de l'état avec useState" },
    { date: "2025-04-14", topic: "Props et communication entre composants" },
  ];

  const baseUploadUrl = "http://localhost:5000/Uploads/";

  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="me-2" />;
    return <FaFileAlt className="me-2" />;
  };

  return (
    <div className="course-content-container">
      <StudentNavbar />

      {/* Course Title */}
      <div className="course-header">
        <h2>{course.titre || "Titre non disponible"}</h2>
      </div>

      <Row>
        {/* Main Content (Video and Description) */}
        <Col md={8}>
          {/* Video Section */}
          <Card className="video-card mb-4">
            <Card.Body>
              <h4 className="section-title">
                <FaPlayCircle className="me-2" /> Vidéo du cours
              </h4>
              {course.video ? (
                <>
                  {videoLoading && !videoError && (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Chargement de la vidéo...</p>
                    </div>
                  )}
                  {videoError ? (
                    <p className="text-danger">{videoError}</p>
                  ) : (
                    <video
                      width="100%"
                      height="400"
                      controls
                      className="video-player"
                      onCanPlay={() => setVideoLoading(false)}
                      onError={() => {
                        setVideoLoading(false);
                        setVideoError("Erreur lors du chargement de la vidéo.");
                      }}
                      style={{ display: videoLoading || videoError ? 'none' : 'block' }}
                    >
                      <source
                        src={`${baseUploadUrl}${course.video}`}
                        type="video/mp4"
                      />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  )}
                </>
              ) : (
                <p className="text-muted">Aucune vidéo disponible pour ce cours.</p>
              )}
            </Card.Body>
          </Card>

          {/* Description Section */}
          <Card className="description-card mb-4">
            <Card.Body>
              <h4 className="section-title">Description du cours</h4>
              <p>
                {course.description || "Aucune description disponible pour ce cours."}
              </p>
              {/* PDF Attachments */}
              <div className="attachment-section">
                <h5>Pièces jointes</h5>
                {course.files && ensureArray(course.files).length > 0 ? (
                  <ListGroup variant="flush">
                    {ensureArray(course.files).map((file, index) => (
                      <ListGroup.Item key={index} className="attachment-item">
                        <a
                          href={`${baseUploadUrl}${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          {getFileIcon(file)} {file}
                        </a>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted">Aucune pièce jointe disponible.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar (Schedule) */}
        <Col md={4}>
          <Card className="schedule-card">
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
      </Row>
    </div>
  );
};

export default CourseContent;