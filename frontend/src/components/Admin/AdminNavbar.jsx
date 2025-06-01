// AdminNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Button, Form, ListGroup, Modal, Dropdown } from 'react-bootstrap';
import { Bell, Search, Gear } from 'react-bootstrap-icons';
import profil from '../images/businessman-310819_1280.png';
import './admin.css';
import { getSessionId } from '../Auth/session';

const AdminNavbar = ({
  notifications,
  setNotifications,
  showNotificationsModal,
  setShowNotificationsModal,
  handleApprove,
  userPhoto,
  setCurrentView,
  setActiveTab,
}) => {
  const [userProfile, setUserProfile] = useState(null);
 const sessionId = getSessionId();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(`token_${sessionId}`);
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem({token})}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

   const handleLogout = () => {
localStorage.removeItem(`token_${sessionId}`);
localStorage.removeItem(`role_${sessionId}`);
sessionStorage.removeItem('sessionId');
    window.location.href = '/';
  };


  const handleManageUsers = (tab = 'teachers') => {
    setCurrentView('user');
    setActiveTab(tab);
  };

  const handleManageLevels = () => {
    setCurrentView('niveau');
  };

  const handleManageClasses = () => {
    setCurrentView('classe');
  };

  const handleManageSubjects = () => {
    setCurrentView('matiere');
  };

  return (
    <>
      <div className="navbar-container d-flex justify-content-between align-items-center mb-4">
        <Form className="search-form d-flex">
          <Form.Control
            type="text"
            placeholder="Rechercher..."
            className="me-2 search-input"
          />
          <Button variant="primary" className="search-btn">
            <Search size={18} />
          </Button>
        </Form>
        <div className="d-flex align-items-center">
          <div
            className="position-relative me-4 notification-bell"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowNotificationsModal(true)}
          >
            <Bell size={24} />
            <Badge
              bg={notifications.length > 0 ? 'danger' : 'secondary'}
              className="position-absolute top-0 start-100 translate-middle badge-custom"
              pill
            >
              {notifications.length}
            </Badge>
          </div>
          <Dropdown className="me-4">
            <Dropdown.Toggle
              as="div"
              className="settings-icon"
              style={{ cursor: 'pointer' }}
            >
              <Gear size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="dropdown-menu-custom">
              <Dropdown.Item onClick={() => handleManageUsers('teachers')}>
                Gestion des utilisateurs (Enseignants)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleManageUsers('students')}>
                Gestion des utilisateurs (Étudiants)
              </Dropdown.Item>
              <Dropdown.Item onClick={handleManageLevels}>
                Gestion niveau
              </Dropdown.Item>
              <Dropdown.Item onClick={handleManageClasses}>
                Gestion classe
              </Dropdown.Item>
              <Dropdown.Item onClick={handleManageSubjects}>
                Gestion matière
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle
              as="img"
              src={userPhoto ? `/Uploads/${userPhoto}` : profil}
              alt="Profil"
              className="profile-img rounded-circle"
              style={{ cursor: 'pointer', width: '40px', height: '40px' }}
            />
            <Dropdown.Menu align="end" className="dropdown-menu-custom">
              <Dropdown.ItemText className="dropdown-header">
                <strong>
                  {userProfile ? `${userProfile.prenom} ${userProfile.nom}` : 'Admin'}
                </strong>
                <br />
                <small>{userProfile ? userProfile.role : 'admin'}</small>
              </Dropdown.ItemText>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => handleManageUsers('teachers')}>
                <Gear className="me-2" size={16} /> Gestion des utilisateurs
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Déconnexion</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <Modal
        show={showNotificationsModal}
        onHide={() => setShowNotificationsModal(false)}
        centered
        className="modal-custom"
      >
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length > 0 ? (
            <ListGroup>
              {notifications.map((notif) => (
                <ListGroup.Item
                  key={notif.id}
                  className="d-flex justify-content-between align-items-center notification-item"
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={notif.Utilisateur?.photo ? `/Uploads/${notif.Utilisateur.photo}` : profil}
                      alt="User"
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div>
                      <p className="mb-0">
                        Nouvelle inscription en attente: {notif.Utilisateur?.prenom} {notif.Utilisateur?.nom}
                      </p>
                      <small className="text-muted">
                        ({notif.Utilisateur?.email})
                      </small>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      await handleApprove(notif.userId);
                    }}
                    className="approve-btn"
                  >
                    Approuver
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-center">Aucune inscription</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminNavbar;