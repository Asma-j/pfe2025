import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  ListGroup,
  Row,
  Col,
  Spinner,
  Button,
} from "react-bootstrap";
import { FaPlayCircle, FaCalendarAlt, FaFilePdf, FaFileAlt, FaVideo } from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import axios from "axios";
import "./content.css";

const CourseContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planningsLoading, setPlanningsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planningsError, setPlanningsError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPlanningsError("Utilisateur non authentifié. Veuillez vous connecter.");
          setPlanningsLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserId(response.data.id);
        setUserRole(response.data.role);
        if (response.data.role !== 'Etudiant') {
          navigate('/teacher-dashboard');
        }
      } catch (err) {
        console.error("Fetch User Profile Error:", err);
        setPlanningsError("Erreur lors de la récupération du profil utilisateur: " + err.message);
        setPlanningsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Utilisateur non authentifié. Veuillez vous connecter.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `http://localhost:5000/api/cours/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Course data:', response.data);
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

  useEffect(() => {
    if (!userId || userRole !== 'Etudiant') return;

    const fetchPlannings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/plannings?cours_id=${id}&utilisateur_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Plannings data:', response.data);
        setPlannings(response.data);
        setPlanningsLoading(false);
      } catch (err) {
        console.error("Fetch Plannings Error:", err);
        setPlanningsError("Erreur lors de la récupération des plannings: " + err.message);
        setPlanningsLoading(false);
      }
    };

    fetchPlannings();
  }, [id, userId, userRole]);

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!course) return <div className="text-center mt-5">Cours non trouvé</div>;

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

  const isMeetingActive = (planning) => {
    if (planning.statut !== 'En cours') return false;
    const now = new Date().getTime();
    const start = new Date(planning.date_debut).getTime();
    const end = new Date(planning.date_fin).getTime();
    console.log('Current time (UTC ms):', now);
    console.log('Start time (UTC ms):', start);
    console.log('End time (UTC ms):', end);
    console.log('Is active:', now >= start && now <= end);
    return now >= start && now <= end;
  };

  const joinMeeting = (joinUrl) => {
    if (joinUrl) {
      window.open(joinUrl, '_blank');
    } else {
      alert("Lien de réunion non disponible.");
    }
  };

  return (
    <div className="course-content-container">
      <StudentNavbar />

      <div className="course-header">
        <h2>{course.titre || "Titre non disponible"}</h2>
      </div>

      <Row>
        <Col md={8}>
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

          <Card className="description-card mb-4">
            <Card.Body>
              <h4 className="section-title">Description du cours</h4>
              <p>
                {course.description || "Aucune description disponible pour ce cours."}
              </p>
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

        <Col md={4}>
          <Card className="schedule-card">
            <Card.Body>
              <h4 className="section-title">
                <FaCalendarAlt className="me-2" /> Planning du cours
              </h4>
              {planningsLoading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p>Chargement des plannings...</p>
                </div>
              ) : planningsError ? (
                <p className="text-danger">{planningsError}</p>
              ) : plannings.length > 0 ? (
                <ListGroup variant="flush">
                  {plannings.map((planning, index) => (
                    <ListGroup.Item key={index} className="schedule-item">
                      <span className="schedule-date">
                        {new Date(planning.date_debut).toLocaleDateString()}
                      </span>
                      : {planning.titre} (Classe: {planning.Classe?.nom || 'Inconnue'})
                      <br />
                      <small>
                        {new Date(planning.date_debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(planning.date_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                      {isMeetingActive(planning) ? (
                        planning.joinUrl ? (
                          <div className="mt-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => joinMeeting(planning.joinUrl)}
                            >
                              <FaVideo className="me-2" /> Rejoindre la réunion
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-2 text-danger">
                            Réunion en cours, mais le lien de réunion n'est pas disponible.
                          </div>
                        )
                      ) : null}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">Aucun planning disponible pour votre classe.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseContent;