import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav, Card, Dropdown } from 'react-bootstrap';
import TopStudentsChart from './TopStudentsChart';
import StudentList from './StudentList';
import TeacherCalendar from './TeacherCalendar';
import CourseManager from './CourseManager';
import Evaluation from './Evaluation';
import './teacher.css';
import defaultProfil from "../images/businessman-310819_1280.png";
import {
    People,
    Book,
    Calendar,
    Gear,
    Search,
    Bell,
    MortarboardFill,
    Speedometer,
} from "react-bootstrap-icons";
import Background3D from '../Admin/Background3D';
import axios from 'axios';

function TeacherDashboard() {
    const [currentView, setCurrentView] = useState("dashboard");
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch teacher profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Veuillez vous connecter');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProfile(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération du profil:', err);
                setError(err.response?.data?.error || 'Erreur lors de la récupération du profil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const views = {
        students: <StudentList />,
        courses: <CourseManager />,
        schedule: <TeacherCalendar />,
        evaluation: <Evaluation/>,
        dashboard: (
            <>
                <Row>
                    {[
                        { icon: People, label: "Total des étudiants", value: "1 234" },
                        { icon: Book, label: "Cours actifs", value: "42" },
                        { icon: Calendar, label: "Taux d'achèvement", value: "87%" },
                        { icon: People, label: "Nouvelles inscriptions", value: "+28" },
                    ].map(({ icon: Icon, label, value }) => (
                        <Col key={label} md={3}>
                            <Card className="mb-4 shadow-sm text-center p-3 card-custom">
                                <Icon size={30} className="text-primary" />
                                <Card.Text className="text-muted mb-0 mt-2">{label}</Card.Text>
                                <Card.Title className="mb-0">{value}</Card.Title>
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
        <div className="teacher">
            <div className="dashboard-container">
                <Background3D />
                <Container fluid className="min-vh-100 d-flex p-0">
                    {/* Sidebar */}
                    <Nav className="flex-column bg-light shadow-sm p-3 sidebar">
                        <div className="d-flex align-items-center pb-3">
                            <MortarboardFill
                                style={{ width: "32px", height: "32px" }}
                                className="text-white me-2"
                            />
                            <span className="fw-bold fs-4 text-white">EduEnseignant</span>
                        </div>
                        {[
                            { icon: Speedometer, label: "Tableau de bord", view: "dashboard" },
                            { icon: People, label: "Étudiants", view: "students" },
                            { icon: Book, label: "Cours", view: "courses" },
                            { icon: Book, label: "evaluation", view: "evaluation" },
                            { icon: Calendar, label: "Emploi du temps", view: "schedule" },
                            { icon: Gear, label: "Paramètres", view: "settings" },
                        ].map(({ icon: Icon, label, view }) => (
                            <Button
                                key={label}
                                variant="light"
                                onClick={() => setCurrentView(view)}
                                className="d-flex align-items-center mb-2 text-start"
                            >
                                <Icon className="me-2" />
                                {label}
                            </Button>
                        ))}
                    </Nav>

                    {/* Main Content */}
                    <div className="main-content flex-grow-1 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Form className="d-flex">
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="me-2"
                                />
                                <Button variant="outline-secondary">
                                    <Search />
                                </Button>
                            </Form>
                            <div className="d-flex align-items-center">
                                <Bell className="me-4" />
                                <Dropdown>
                                    <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0">
                                        <img
                                            src={profile?.photo || defaultProfil}
                                            alt="Profil"
                                            className="profile-img rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu align="end">
                                        {loading ? (
                                            <Dropdown.ItemText>Chargement...</Dropdown.ItemText>
                                        ) : profile ? (
                                            <>
                                                <Dropdown.ItemText>
                                                    <strong>{profile.prenom} {profile.nom}</strong>
                                                    <br />
                                                    <small>{profile.email}</small>
                                                    <br />
                                                    <small>Rôle: {profile.role}</small>
                                                </Dropdown.ItemText>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={() => {
                                                    localStorage.removeItem('token');
                                                    localStorage.removeItem('role');
                                                    window.location.href = '/login';
                                                }}>
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

                        {error && <div className="alert alert-danger">{error}</div>}
                        {views[currentView] || <div>View not found</div>}
                    </div>
                </Container>
            </div>
        </div>
    );
}

export default TeacherDashboard;