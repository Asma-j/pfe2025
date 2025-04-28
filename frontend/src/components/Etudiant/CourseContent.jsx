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
          setPlanningsError("Utilisateur non authentifié. Veuillez vous connecter.");
          setPlanningsLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profileData = response.data;
        if (!profileData.prenom || !profileData.nom || !profileData.email) {
          throw new Error("Profil utilisateur incomplet : prénom, nom ou email manquant.");
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
    if (!userProfile.id || userProfile.role !== 'Etudiant') return;

    const fetchPlannings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/plannings?cours_id=${id}&utilisateur_id=${userProfile.id}`,
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
    const now = new Date().getTime();
    const start = new Date(planning.date_debut).getTime();
    const end = new Date(planning.date_fin).getTime();
    console.log('Current time (UTC ms):', now);
    console.log('Start time (UTC ms):', start);
    console.log('End time (UTC ms):', end);
    console.log('Is active:', now >= start && now <= end);
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
    console.log('Original joinUrl:', joinUrl);
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
  
      // Extract meeting ID from the joinUrl
      const meetingIdMatch = selectedJoinUrl.match(/\/j\/(\d+)/);
      if (!meetingIdMatch) {
        throw new Error('Impossible d\'extraire l\'ID de la réunion à partir du lien.');
      }
      const meetingId = meetingIdMatch[1];
  
      // Check meeting status
      let meetingDetails = null;
      const token = localStorage.getItem('token');
      try {
        const meetingResponse = await axios.get(
          `http://localhost:5000/api/zoom/meeting-details/${meetingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        meetingDetails = meetingResponse.data;
        console.log('Meeting details:', meetingDetails);
        console.log('Meeting status:', meetingDetails.status);
  
        if (meetingDetails.status !== 'started' && meetingDetails.status !== 'waiting') {
          throw new Error('La réunion n\'est pas active. Veuillez attendre que l\'hôte démarre la réunion.');
        }
      } catch (meetingError) {
        console.error('Failed to fetch meeting details:', meetingError.response?.data || meetingError.message);
        throw new Error('Impossible de vérifier l\'état de la réunion.');
      }
  
      // Append user information to the joinUrl
      let finalJoinUrl = selectedJoinUrl;
      const urlObj = new URL(selectedJoinUrl);
      urlObj.searchParams.set('userName', `${userProfile.prenom} ${userProfile.nom}`);
      urlObj.searchParams.set('userEmail', userProfile.email);
      finalJoinUrl = urlObj.toString();
  
      console.log('Joining meeting with URL:', finalJoinUrl);
      console.log('Student profile used:', {
        prenom: userProfile.prenom,
        nom: userProfile.nom,
        email: userProfile.email,
      });
  
      const newWindow = window.open(finalJoinUrl, '_blank');
      if (!newWindow) {
        throw new Error('Échec de l\'ouverture de la réunion Zoom. Vérifiez les paramètres de votre navigateur.');
      }
  
      // Verify if the student joined the meeting
      setTimeout(async () => {
        try {
          const participantsResponse = await axios.get(
            `http://localhost:5000/api/zoom/meeting-participants/${meetingId}?isOngoing=true`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const participants = participantsResponse.data.participants || [];
          console.log('Current participants:', participants);
          const studentJoined = participants.some(participant =>
            participant.email === userProfile.email ||
            participant.name === `${userProfile.prenom} ${userProfile.nom}`
          );
          if (!studentJoined) {
            alert('Vous n\'avez pas été ajouté à la réunion. Vérifiez les paramètres Zoom.');
          } else {
            console.log('Student successfully joined the meeting.');
          }
        } catch (error) {
          console.error('Error checking participants:', error.message);
          alert('Erreur lors de la vérification des participants: ' + error.message);
        }
      }, 5000);
  
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error joining meeting:', error.message);
      alert('Erreur lors de la tentative de rejoindre la réunion: ' + error.message);
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
                              onClick={() => handleJoinMeeting(planning.joinUrl)}
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
                  : require('../images/aupair-2380047_1920.png')
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
    </div>
  );
};

export default CourseContent;