import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown, Badge, Button, Modal } from 'react-bootstrap';
import { MortarboardFill, Gear, BoxArrowRight, Bell } from 'react-bootstrap-icons';
import axios from 'axios';
import defaultProfil from '../images/aupair-2380047_1920.png';
import './student.css';

function StudentNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
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
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found in localStorage');
          setNotificationError('Veuillez vous connecter');
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
      }
    };

    fetchProfile();
  }, []);

  // Fetch notifications when profile.id changes
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
        console.log('Notifications fetched:', response.data);
        const evaluationNotifications = response.data.filter((notification) =>
          notification.message.toLowerCase().includes('évaluation')
        );
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
      const response = await axios.get(`http://localhost:5000/api/quiz/matiere/${matiereId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching quiz details:', err.response?.data || err.message);
      setNotificationError('Erreur lors de la récupération des détails du quiz');
      return null;
    }
  };

  // Open modal and fetch quiz details
  const openQuizModal = async (notification) => {
    const matiereId = notification.message.includes('/quiz/matiere/')
      ? notification.message.split('/quiz/matiere/')[1].split(' ')[0]
      : null;
    if (matiereId) {
      const quizData = await fetchQuizDetails(matiereId);
      if (quizData) {
        setSelectedQuiz({
          ...quizData,
          matiereId,
          notificationId: notification.id,
        });
        setShowModal(true);
      }
    } else {
      setNotificationError('Impossible de trouver les détails du quiz');
    }
  };

  // Handle confirm (navigate to quiz page and mark as read)
  const handleConfirm = async () => {
    if (selectedQuiz) {
      try {
        setNotificationLoading(true);
        const token = localStorage.getItem('token');
        await axios.patch(
          `http://localhost:5000/api/notifications/${selectedQuiz.notificationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(notifications.filter((n) => n.id !== selectedQuiz.notificationId));
        setShowModal(false);
        navigate(`/quiz/matiere/${selectedQuiz.matiereId}`);
      } catch (err) {
        console.error('Error marking notification as read:', err.response?.data || err.message);
        setNotificationError('Erreur lors de la mise à jour de la notification');
      } finally {
        setNotificationLoading(false);
      }
    }
  };

  // Handle cancel (close modal)
  const handleCancel = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <>
      <BootstrapNavbar
        expand="lg"
        fixed="top"
        className={`transition-all shadow-sm ${isScrolled ? 'bg-white py-2 navbar-light' : 'bg-transparent py-3 navbar-dark'}`}
      >
        <Container>
          <BootstrapNavbar.Brand href="#home" className="d-flex align-items-center">
            <MortarboardFill
              style={{ width: '32px', height: '32px' }}
              className="text-primary me-2"
            />
            <span className="fw-bold fs-4 text-primary">EduLearn</span>
          </BootstrapNavbar.Brand>

          <Nav className="ms-auto d-flex flex-row gap-4 align-items-center">
            <Link to="/" className="nav-link text-primary">Accueil</Link>
            <Link to="/courses" className="nav-link text-primary">Cours</Link>

            {/* Notification Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" id="dropdown-notifications" className="p-0 border-0 position-relative">
                <Bell className="text-primary" style={{ width: '24px', height: '24px' }} />
                {notifications.length > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-circle" style={{ fontSize: '10px', padding: '4px 6px' }}>
                    {notifications.length}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm p-3 rounded border-0" style={{ minWidth: '350px' }}>
                <Dropdown.Header>Notifications</Dropdown.Header>
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
                        <Link
                          to={notification.message.includes('/quiz/matiere/') ? notification.message.split('ici: ')[1] : '#'}
                          className="text-decoration-none text-dark"
                          style={{ flex: 1 }}
                        >
                          {notification.message.split('ici: ')[0]}
                        </Link>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openQuizModal(notification)}
                          disabled={notificationLoading}
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
              <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0 border-0">
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
              <Dropdown.Menu className="shadow-sm p-3 rounded border-0" style={{ minWidth: '200px' }}>
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
                      border: '2px solid #ddd',
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
        <Modal.Header closeButton>
          <Modal.Title>Détails du Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuiz ? (
            <>
              <p><strong>Titre :</strong> {selectedQuiz.titre}</p>
              <p><strong>Matière :</strong> {selectedQuiz.Matiere?.nom || 'Non spécifié'}</p>
              <p><strong>Temps estimé :</strong> 30 minutes</p>
              <p><strong>Nombre de questions :</strong> {selectedQuiz.QuizQuestions?.length || 'Non disponible'}</p>
            </>
          ) : (
            <p>Chargement des détails du quiz...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel} disabled={notificationLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={notificationLoading || !selectedQuiz}
          >
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default StudentNavbar;