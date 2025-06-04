import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown, Badge, Button, Modal } from 'react-bootstrap';
import { MortarboardFill, Gear, BoxArrowRight, Bell } from 'react-bootstrap-icons';
import axios from 'axios';
import defaultProfil from '../images/graduated.png';
import './student.css';


function StudentNavbar() {
  const [profile, setProfile] = useState({
    prenom: '',
    nom: '',
    role: '',
    photo: '',
    id: null,
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [matieres, setMatieres] = useState([]);
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
      
const token = localStorage.getItem(`token`);
        if (!token) {
          console.warn('No token found in localStorage');
          setNotificationError('Veuillez vous connecter');
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          prenom: response.data.prenom || '',
          nom: response.data.nom || '',
          role: response.data.role || 'Étudiant',
          photo: response.data.photo || '',
          id: response.data.id,
        });
      } catch (err) {
        console.error('Error fetching profile:', err.response?.data || err.message);
        setNotificationError('Erreur lors de la récupération du profil');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fetch matieres (subjects)
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found for fetching matieres');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/matieres', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched matieres data:', response.data);
        setMatieres(response.data);
      } catch (err) {
        console.error('Error fetching matieres:', err.response?.data || err.message);
        setNotificationError('Erreur lors de la récupération des matières');
      }
    };

    fetchMatieres();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!profile.id) return;

    const fetchNotifications = async () => {
      try {
        setNotificationLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setNotificationError('Veuillez vous connecter');
          setNotificationLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: profile.id },
        });
        console.log('Fetched notifications:', response.data);
        // Filter for unread quiz notifications
        const evaluationNotifications = response.data.filter(
          (notification) =>
            !notification.read &&
            notification.message.toLowerCase().includes('évaluation')
        );
        console.log('Filtered evaluation notifications:', evaluationNotifications);
        setNotifications(evaluationNotifications);
        setNotificationLoading(false);
      } catch (err) {
        console.error('Notification fetch error:', err.response?.data || err.message);
        setNotificationError('Erreur lors de la récupération des notifications');
        setNotificationLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [profile.id]);

  // Fetch quiz details for modal
  const fetchQuizDetails = async (matiereId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotificationError('Veuillez vous connecter');
        return null;
      }
      const response = await axios.get(`http://localhost:5000/api/quiz/matiere/${matiereId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching quiz details:', err.response?.data || err.message);
      setNotificationError(
        err.response?.status === 404
          ? 'Aucun quiz disponible pour cette matière. Veuillez contacter votre enseignant.'
          : err.response?.status === 401
          ? 'Session expirée. Veuillez vous reconnecter.'
          : err.response?.status === 400
          ? 'La matière sélectionnée est invalide.'
          : 'Erreur lors de la récupération des détails du quiz.'
      );
      return null;
    }
  };

  // Open modal and fetch quiz details
  const openQuizModal = async (notification) => {
    console.log('Processing notification:', notification);

    let matiereId = notification.matiereId;

    if (!matiereId) {
      const subjectMatch = notification.message.match(/pour la matière "([^"]+)"/);
      const subjectName = subjectMatch ? subjectMatch[1] : null;
      console.log('Extracted subject name:', subjectName);
      if (subjectName) {
        const matchedMatiere = matieres.find((matiere) => matiere.nom === subjectName);
        matiereId = matchedMatiere ? matchedMatiere.id : null;
        console.log('Matched matiere:', matchedMatiere, 'matiereId:', matiereId);
      }
    }

    if (!matiereId || isNaN(matiereId)) {
      setNotificationError('Identifiant de matière invalide pour ce quiz.');
      console.error('Invalid matiereId:', matiereId);
      return;
    }

    const quizData = await fetchQuizDetails(matiereId);
    if (quizData) {
      setSelectedQuiz({
        ...quizData,
        matiereId,
        notificationId: notification.id,
      });
      setShowModal(true);
    }
  };

  // Handle confirm (navigate to quiz page and mark as read)
  const handleConfirm = async () => {
    if (!selectedQuiz) {
      console.error('No selected quiz');
      setNotificationError('Aucun quiz sélectionné');
      setShowModal(false);
      return;
    }

    try {
      setNotificationLoading(true);
      const token = localStorage.getItem('token');
      const matiereId = selectedQuiz.matiereId;
      const notificationId = selectedQuiz.notificationId;
      console.log('Confirming quiz for matiereId:', matiereId, 'notificationId:', notificationId);

      if (!matiereId || isNaN(matiereId)) {
        console.error('Invalid matiereId:', matiereId);
        setNotificationError('Identifiant de matière invalide.');
        setShowModal(false);
        setNotificationLoading(false);
        return;
      }

      if (!notificationId) {
        console.error('Invalid notificationId:', notificationId);
        setNotificationError('Identifiant de notification invalide.');
        setShowModal(false);
        setNotificationLoading(false);
        return;
      }

      // Mark notification as read
      console.log('Marking notification as read:', notificationId);
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove notification from state
      console.log('Current notifications:', notifications);
      const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
      console.log('Updated notifications:', updatedNotifications);
      setNotifications(updatedNotifications);

      setShowModal(false);
      setSelectedQuiz(null);

      // Navigate to the quiz page
      console.log('Navigating to quiz:', `/quiz/matiere/${matiereId}`);
      navigate(`/quiz/matiere/${matiereId}`);
    } catch (err) {
      console.error('Error in handleConfirm:', err.response?.data || err.message);
      setNotificationError(
        err.response?.status === 404
          ? 'Notification non trouvée.'
          : err.response?.status === 401
          ? 'Session expirée. Veuillez vous reconnecter.'
          : 'Erreur lors de la mise à jour de la notification.'
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // Handle cancel (close modal)
  const handleCancel = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  };

  // Handle logout
  const handleLogout = () => {
localStorage.removeItem(`token`);

    window.location.href = '/';
  };

  return (
    <>
      <BootstrapNavbar
        expand="lg"
        fixed="top"
        className="bg-white shadow-sm"
      >
        <Container>
          <BootstrapNavbar.Brand href="#home" className="d-flex align-items-center">
            <MortarboardFill
              style={{ width: '32px', height: '32px', color: '#3b82f6' }}
              className="me-2"
            />
            <span className="fw-bold fs-4" style={{ color: '#3b82f6' }}>EduLearn</span>
          </BootstrapNavbar.Brand>

          <Nav className="ms-auto d-flex flex-row gap-4 align-items-center">
            <Link to="/" className="nav-link">Accueil</Link>
            <Link to="/cours" className="nav-link">Cours</Link>

            {/* Notification Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" id="dropdown-notifications" className="p-0 border-0 position-relative text-dark">
                <Bell style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                {notifications.length > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-circle" style={{ fontSize: '10px', padding: '4px 6px' }}>
                    {notifications.length}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm p-3 rounded border-0" style={{ minWidth: '350px', background: '#f1f5f9' }}>
                <Dropdown.Header style={{ fontWeight: 'bold', color: '#1f2937' }}>Notifications</Dropdown.Header>
                {notificationError && (
                  <Dropdown.ItemText className="text-danger">{notificationError}</Dropdown.ItemText>
                )}
                {notificationLoading ? (
                  <Dropdown.ItemText>Chargement...</Dropdown.ItemText>
                ) : notifications.length === 0 ? (
                  <Dropdown.ItemText>Aucune notification d'évaluation</Dropdown.ItemText>
                ) : (
                  notifications.map((notification) => (
                    <Dropdown.ItemText key={notification.id} className="py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ flex: 1, color: '#1f2937' }}>{notification.message}</span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openQuizModal(notification)}
                          disabled={notificationLoading || matieres.length === 0}
                          style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', border: 'none' }}
                        >
                          Passer
                        </Button>
                      </div>
                    </Dropdown.ItemText>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0 border-0 text-dark">
                <img
                  src={
                    profile.photo
                      ? `http://localhost:5000/Uploads/${profile.photo}?t=${Date.now()}`
                      : defaultProfil
                  }
                  alt="Profile"
                  className="rounded-circle border shadow"
                  style={{
                    width: '45px',
                    height: '40px',
                    objectFit: 'cover',
                    transition: '0.3s ease-in-out',
                  }}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm p-3 rounded border-0" style={{ minWidth: '200px', background: '#f1f5f9' }}>
                <div className="d-flex align-items-center px-3 py-3 bg-light rounded">
                  <img
                    src={
                      profile.photo
                        ? `http://localhost:5000/Uploads/${profile.photo}?t=${Date.now()}`
                        : defaultProfil
                    }
                    alt="Profile"
                    className="rounded-circle border me-2"
                    style={{
                      width: '55px',
                      height: '55px',
                      objectFit: 'cover',
                      border: '2px solid #3b82f6',
                    }}
                  />
                  <div>
                    <div className="fw-bold fs-6">
                      {profile.prenom} {profile.nom}
                    </div>
                    <small className="text-muted">{profile.role || 'Étudiant'}</small>
                  </div>
                </div>
                <Dropdown.Item as={Link} to="/profile" className="py-2">
                  <Gear className="me-2 text-primary" /> Profil
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                  <BoxArrowRight className="me-2" /> Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </BootstrapNavbar>

      {/* Quiz Modal */}
      <Modal show={showModal} onHide={handleCancel} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', color: '#ffffff' }}>
          <Modal.Title>Détails du Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#f1f5f9' }}>
          {selectedQuiz ? (
            <>
              <p><strong>Titre :</strong> {selectedQuiz.titre}</p>
              <p><strong>Matière :</strong> {selectedQuiz.Matiere?.nom || 'Non spécifié'}</p>
              <p><strong>Temps estimé :</strong> {selectedQuiz.setDuration} minutes</p>
              <p><strong>Nombre de questions :</strong> {selectedQuiz.QuizQuestions?.length || 'Non disponible'}</p>
            </>
          ) : (
            <p>Chargement des détails du quiz...</p>
          )}
          {notificationError && <div className="text-danger mt-2">{notificationError}</div>}
        </Modal.Body>
        <Modal.Footer style={{ background: '#f1f5f9' }}>
          <Button variant="secondary" onClick={handleCancel} disabled={notificationLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={notificationLoading || !selectedQuiz}
            style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', border: 'none' }}
          >
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default StudentNavbar;