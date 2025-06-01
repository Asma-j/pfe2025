import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav, Card, Dropdown, Badge, Modal, ListGroup } from 'react-bootstrap';
import TopStudentsChart from './TopStudentsChart';
import StudentList from './StudentList';
import TeacherCalendar from './TeacherCalendar';
import CourseManager from './CourseManager';
import Evaluation from './Evaluation';
import './teacher.css';
import defaultProfil from '../images/businessman-310819_1280.png';
import {
    People,
    Book,
    Calendar,
    Gear,
    Search,
    Bell,
    MortarboardFill,
    Speedometer,
} from 'react-bootstrap-icons';
import Background3D from '../Admin/Background3D';
import axios from 'axios';
import { getSessionId } from '../Auth/session';

function TeacherDashboard() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]); // State for notifications
    const [showNotificationsModal, setShowNotificationsModal] = useState(false); // State for notification modal
     const sessionId = getSessionId();
    // Fetch teacher profile and notifications on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
           
const token = localStorage.getItem(`token_${sessionId}`);
                if (!token) {
                    setError('Veuillez vous connecter');
                    return;
                }

                const [profileResponse, notificationsResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
              
                ]);

                setProfile(profileResponse.data);
                setNotifications(notificationsResponse.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des données:', err);
                setError(err.response?.data?.error || 'Erreur lors de la récupération des données');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Handle notification action (e.g., mark as read)
    const handleNotificationAction = async (notificationId) => {
        try {
            await axios.post(
                `http://localhost:5000/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setNotifications(notifications.filter((notif) => notif.id !== notificationId));
        } catch (err) {
            console.error('Erreur lors de la gestion de la notification:', err);
        }
    };
   const handleLogout = () => {
localStorage.removeItem(`token_${sessionId}`);
localStorage.removeItem(`role_${sessionId}`);
sessionStorage.removeItem('sessionId');
    window.location.href = '/';
  };

    const views = {
        students: <StudentList />,
        courses: <CourseManager />,
        schedule: <TeacherCalendar />,
        evaluation: <Evaluation />,
        dashboard: (
            <>
                <Row>
                    {[
                        { icon: People, label: 'Total des étudiants', value: '1 234' },
                        { icon: Book, label: 'Cours actifs', value: '42' },
                        { icon: Calendar, label: 'Taux d\'achèvement', value: '87%' },
                        { icon: People, label: 'Nouvelles inscriptions', value: '+28' },
                    ].map(({ icon: Icon, label, value }) => (
                        <Col key={label} md={3}>
                            <Card className='mb-4 shadow-sm text-center p-3 card-custom'>
                                <Icon size={30} className='text-primary' />
                                <Card.Text className='text-muted mb-0 mt-2'>{label}</Card.Text>
                                <Card.Title className='mb-0'>{value}</Card.Title>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row>
                    <TopStudentsChart />
                </Row>
            </>
        ),
    };

    return (
        <div className='teacher'>
            <div className='dashboard-container'>
                <Background3D />
                <Container fluid className='min-vh-100 d-flex p-0'>
                    {/* Sidebar */}
                    <Nav className='flex-column bg-dark text-white shadow-sm p-3 sidebar' style={{ width: '250px' }}>
                        <div className='d-flex align-items-center pb-3 mb-4 mt-4 border-bottom border-secondary'>
                            <MortarboardFill style={{ width: '32px', height: '32px' }} className='me-2' />
                            <span className='fw-bold fs-4'>EduEnseignant</span>
                        </div>
                        {[
                            { icon: Speedometer, label: 'Tableau de bord', view: 'dashboard' },
                            { icon: People, label: 'Étudiants', view: 'students' },
                            { icon: Book, label: 'Cours', view: 'courses' },
                            { icon: Book, label: 'Évaluation', view: 'evaluation' },
                            { icon: Calendar, label: 'Emploi du temps', view: 'schedule' },
                       
                        ].map(({ icon: Icon, label, view }) => (
                            <Button
                                key={label}
                                variant='link'
                                onClick={() => setCurrentView(view)}
                                className={`d-flex align-items-center mb-2 text-white text-decoration-none sidebar-link ${currentView === view ? 'active' : ''}`}
                            >
                                <Icon className='me-2' size={20} />
                                {label}
                            </Button>
                        ))}
                    </Nav>

                    {/* Main Content */}
                    <div className='main-content flex-grow-1'>
                        {/* Navbar */}
                        <div className='navbar-teacher-container d-flex justify-content-between align-items-center mb-4'>
                            <Form className='search-form-teacher d-flex'>
                                <Form.Control
                                    type='text'
                                    placeholder='Rechercher...'
                                    className='me-2 search-input-teacher'
                                />
                                <Button variant='primary' className='search-btn-teacher'>
                                    <Search size={18} />
                                </Button>
                            </Form>
                            <div className='d-flex align-items-center'>
                                <div
                                    className='position-relative me-4 notification-bell-teacher'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowNotificationsModal(true)}
                                >
                                    <Bell size={24} />
                                    <Badge
                                        bg={notifications.length > 0 ? 'danger' : 'secondary'}
                                        className='position-absolute top-0 start-100 translate-middle badge-custom-teacher'
                                        pill
                                    >
                                        {notifications.length}
                                    </Badge>
                                </div>
                       
                                <Dropdown>
                                    <Dropdown.Toggle
                                        as='img'
                                        src={profile?.photo ? `http://localhost:5000/Uploads/${profile.photo}` : defaultProfil}
                                        alt='Profil'
                                        className='profile-img-teacher rounded-circle'
                                        style={{ cursor: 'pointer', width: '40px', height: '40px' }}
                                    />
                                    <Dropdown.Menu align='end' className='dropdown-menu-custom-teacher'>
                                        {loading ? (
                                            <Dropdown.ItemText>Chargement...</Dropdown.ItemText>
                                        ) : profile ? (
                                            <>
                                                <Dropdown.ItemText className='dropdown-header-teacher'>
                                                    <strong>{profile.prenom} {profile.nom}</strong>
                                                    <br />
                                                    <small>{profile.email}</small>
                                                    <br />
                                                    <small>Rôle: {profile.role}</small>
                                                </Dropdown.ItemText>
                                                <Dropdown.Divider />
                                                <Dropdown.Item
                                                    onClick={() => {
                                                        localStorage.removeItem('token');
                                                        localStorage.removeItem('role');
                                                        window.location.href = '/';
                                                    }}
                                                >
                                                    Déconnexion
                                                </Dropdown.Item>
                                            </>
                                        ) : (
                                            <Dropdown.ItemText>Profil non chargé</Dropdown.ItemText>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Notification Modal */}
                        <Modal
                            show={showNotificationsModal}
                            onHide={() => setShowNotificationsModal(false)}
                            centered
                            className='modal-custom'
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
                                                className='d-flex justify-content-between align-items-center notification-item'
                                            >
                                                <div>
                                                    <p className='mb-0'>{notif.message}</p>
                                                    <small className='text-muted'>
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </small>
                                                </div>
                                                <Button
                                                    variant='primary'
                                                    size='sm'
                                                    onClick={() => handleNotificationAction(notif.id)}
                                                    className='approve-btn'
                                                >
                                                    Marquer comme lu
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <p className='text-center'>Aucune notification</p>
                                )}
                            </Modal.Body>
                        </Modal>

                        {/* Main Content Area */}
                        <div className='p-4'>
                       
                            {views[currentView] || <div>View not found</div>}
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}

export default TeacherDashboard;