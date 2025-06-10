import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  ListGroup,
  Row,
  Col,
  Spinner,
  Button,
  Modal,
} from "react-bootstrap";
import { FaPlayCircle, FaCalendarAlt, FaFilePdf, FaFileAlt, FaVideo } from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import axios from "axios";
import "./content.css";
import Footer from "./Footer";

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
  const [userProfile, setUserProfile] = useState({ id: null, role: null, prenom: '', nom: '', email: '', photo: '' });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedJoinUrl, setSelectedJoinUrl] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = response.data;
        if (!profileData.prenom || !profileData.nom || !profileData.email) {
          throw new Error("Profil utilisateur incomplet.");
        }
        setUserProfile({
          id: profileData.id,
          role: profileData.role,
          prenom: profileData.prenom,
          nom: profileData.nom,
          email: profileData.email,
          photo: profileData.photo,
        });
        if (profileData.role !== 'Etudiant') {
          navigate('/teacher-dashboard');
        }
      } catch (err) {
        console.error("Fetch User Profile Error:", err);
        setPlanningsError(err.response?.data?.message || "Erreur lors de la récupération du profil utilisateur.");
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
          throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
        }
        const response = await axios.get(`http://localhost:5000/api/cours/${id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Course data:', response.data);
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || "Erreur lors de la récupération du contenu du cours.");
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [id]);

  useEffect(() => {
    if (!userProfile.id || userProfile.role !== 'Etudiant') return;

    const fetchPlannings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/plannings`, {
          withCredentials: true,
          params: { cours_id: id, utilisateur_id: userProfile.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Plannings data:', response.data);
        setPlannings(response.data);
        setPlanningsLoading(false);
      } catch (err) {
        console.error("Fetch Plannings Error:", err);
        setPlanningsError(err.response?.data?.message || "Erreur lors de la récupération des plannings.");
        setPlanningsLoading(false);
      }
    };

    fetchPlannings();
  }, [id, userProfile.id, userProfile.role]);

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
    const now = new Date();
    const start = new Date(planning.date_debut);
    const end = new Date(planning.date_fin);
    return now >= start && now <= end;
  };

  const handleJoinMeeting = (joinUrl) => {
    if (!joinUrl) {
      alert("Lien de réunion non disponible.");
      return;
    }
    if (!userProfile.prenom || !userProfile.nom || !userProfile.email) {
      alert("Erreur : Profil utilisateur incomplet. Veuillez vérifier vos informations de profil.");
      return;
    }
    setSelectedJoinUrl(joinUrl);
    setShowJoinModal(true);
  };

  const confirmJoinMeeting = async () => {
    if (!selectedJoinUrl) {
      alert("Erreur : Aucun lien de réunion sélectionné.");
      return;
    }
    try {
      const userName = encodeURIComponent(`${userProfile.prenom} ${userProfile.nom}`);
      const userEmail = encodeURIComponent(userProfile.email);

      const meetingIdMatch = selectedJoinUrl.match(/\/j\/(\d+)/);
      if (!meetingIdMatch) {
        throw new Error('Impossible d\'extraire l\'ID de la réunion.');
      }
      const meetingId = meetingIdMatch[1];

      const token = localStorage.getItem('token');
      const meetingResponse = await axios.get(`http://localhost:5000/api/zoom/meeting-details/${meetingId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      const meetingDetails = meetingResponse.data;
      if (meetingDetails.status !== 'started' && meetingDetails.status !== 'waiting') {
        throw new Error('La réunion n\'est pas active.');
      }

      const urlObj = new URL(selectedJoinUrl);
      urlObj.searchParams.set('userName', `${userProfile.prenom} ${userProfile.nom}`);
      urlObj.searchParams.set('userEmail', userProfile.email);
      const finalJoinUrl = urlObj.toString();

      const newWindow = window.open(finalJoinUrl, '_blank');
      if (!newWindow) {
        throw new Error('Échec de l\'ouverture de la réunion Zoom.');
      }

      setTimeout(async () => {
        try {
          const participantsResponse = await axios.get(`http://localhost:5000/api/zoom/meeting-participants/${meetingId}`, {
            withCredentials: true,
            params: { isOngoing: true },
            headers: { Authorization: `Bearer ${token}` },
          });
          const participants = participantsResponse.data.participants || [];
          const studentJoined = participants.some(participant =>
            participant.email === userProfile.email ||
            participant.name === `${userProfile.prenom} ${userProfile.nom}`
          );
          if (!studentJoined) {
            alert('Vous n\'avez pas été ajouté à la réunion.');
          }
        } catch (error) {
          console.error('Error checking participants:', error);
          alert('Erreur lors de la vérification des participants.');
        }
      }, 5000);

      setShowJoinModal(false);
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert(error.response?.data?.message || 'Erreur lors de la tentative de rejoindre la réunion.');
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!course) return <div className="text-center mt-5">Cours non trouvé</div>;

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
              <h3 className="section-title text-danger">Description du cours</h3>
              <h5 className="section-title text-dark">
                {course.description || "Aucune description disponible pour ce cours."}
              </h5>
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
          <Card className="schedule-card shadow-sm border-0">
            <Card.Body>
              <h4 className="mb-4 d-flex align-items-center text-primary fw-bold">
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
                plannings.map((planning, index) => {
                  const date = new Date(planning.date_debut);
                  const startTime = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTime = new Date(planning.date_fin).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={index}
                      className="planning-entry mb-4 p-3 rounded-4 shadow-sm bg-light border-start border-4 border-primary"
                    >
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center">
                          <div className="date-badge text-center me-3">
                            <div className="day">{String(date.getDate()).padStart(2, '0')}</div>
                            <div className="month">{date.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold">{planning.titre}</h6>
                            <small className="text-muted">
                              Classe : {planning.Classe?.nom || 'Inconnue'}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="time-range fw-semibold">
                            {startTime} - {endTime}
                          </div>
                          {isMeetingActive(planning) && planning.joinUrl ? (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleJoinMeeting(planning.joinUrl)}
                            >
                              <FaVideo className="me-1" /> Rejoindre
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted">Aucun planning disponible pour votre classe.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rejoindre la réunion Zoom</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <img
              src={
                userProfile.photo
                  ? `${baseUploadUrl}${userProfile.photo}?t=${Date.now()}`
                  : require('../images/graduated.png')
              }
              alt="Profile"
              className="rounded-circle border mb-3"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                border: '2px solid #ddd',
              }}
            />
            <h5>{userProfile.prenom} {userProfile.nom}</h5>
            <p className="text-muted">{userProfile.email}</p>
            <p>Vous rejoindrez la réunion avec ce profil.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJoinModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={confirmJoinMeeting}>
            Confirmer et rejoindre
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </div>
  );
};

export default CourseContent;