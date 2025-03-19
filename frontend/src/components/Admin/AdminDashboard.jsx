import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Form, Badge, Image } from 'react-bootstrap';
import { People, Book, Calendar, BarChart, Gear, Search, Bell, Clock, Star, MortarboardFill, Speedometer } from 'react-bootstrap-icons';
import Students from './Students';
import Courses from './Courses';
import Schedule from './Schedule';
import './admin.css';
import profil from '../images/businessman-310819_1280.png';
import Background3D from './Background3D';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const students = [
    { name: 'Emma Wilson', email: 'emma.w@example.com', courses: 3, time: 'Il y a 2 heures', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { name: 'James Rodriguez', email: 'james.r@example.com', courses: 4, time: 'Il y a 1 jour', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ];

  const courses = [
    { title: 'Développement JavaScript Avancé', instructor: 'Dr. Alan Smith', students: 156, duration: '12 semaines', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80' },
    { title: 'Fondamentaux du Design UX/UI', instructor: 'Maria Garcia', students: 89, duration: '8 semaines', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80' },
  ];

  const views = {
    students: <Students />,
    courses: <Courses />,
    schedule: <Schedule />,
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
              <Card className="mb-4 shadow-sm text-center p-3 card-custom">
                <Icon size={30} className="text-primary" />
                <Card.Text className="text-muted mb-0 mt-2">{label}</Card.Text>
                <Card.Title className="mb-0">{value}</Card.Title>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-4">
          <Col md={6}>
            <Card className="p-3 shadow-sm">
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>Étudiants récents</span>
                <Button variant="link" className="text-primary">Voir tout</Button>
              </Card.Title>
              {students.map(({ name, email, courses, time, image }) => (
                <Row key={name} className="align-items-center p-2 border-bottom">
                  <Col xs="auto">
                    <Image src={image} roundedCircle width={40} height={40} />
                  </Col>
                  <Col>
                    <div className="fw-bold">{name}</div>
                    <small className="text-muted">{email}</small>
                  </Col>
                  <Col xs="auto" className="text-end">
                    <Badge bg="primary">{courses} cours</Badge>
                    <div className="text-muted small">
                      <Clock size={14} className="me-1" /> {time}
                    </div>
                  </Col>
                </Row>
              ))}
            </Card>
          </Col>

          <Col md={6}>
            <Card className="p-3 shadow-sm">
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>Cours populaires</span>
                <Button variant="link" className="text-primary">Voir tout</Button>
              </Card.Title>
              {courses.map(({ title, instructor, students, duration, image }) => (
                <Row key={title} className="align-items-center p-2 border-bottom">
                  <Col xs="auto">
                    <Image src={image} rounded width={50} height={40} />
                  </Col>
                  <Col>
                    <div className="fw-bold">{title}</div>
                    <small className="text-muted">{instructor}</small>
                  </Col>
                  <Col xs="auto" className="text-end">
                    <small className="text-muted">
                      <MortarboardFill size={14} className="me-1" /> {students} étudiants
                    </small>
                    <div className="text-muted small">{duration}</div>
                  </Col>
                </Row>
              ))}
            </Card>
          </Col>
        </Row>
      </>
    ),
  };

  return (
    <div className="dashboard-container">
      <Background3D />
      <Container fluid className="min-vh-100 d-flex p-0">
        {/* Sidebar */}
        <Nav className="flex-column bg-light shadow-sm p-3 sidebar">
          <div className="d-flex align-items-center p-3">
            <MortarboardFill style={{ width: '32px', height: '32px' }} className="text-white me-2" />
            <span className="fw-bold fs-4 text-white">EduAdmin</span>
          </div>
          {[ 
            { icon: Speedometer, label: 'Tableau de bord', view: 'dashboard' },
            { icon: People, label: 'Étudiants', view: 'students' },
            { icon: Book, label: 'Cours', view: 'courses' },
            { icon: Calendar, label: 'Emploi du temps', view: 'schedule' },
            { icon: BarChart, label: 'Analytique', view: 'analytics' },
            { icon: Gear, label: 'Paramètres', view: 'settings' },
          ].map(({ icon: Icon, label, view }) => (
            <Button key={label} variant="light" onClick={() => setCurrentView(view)} className="d-flex align-items-center mb-2 text-start">
              <Icon className="me-2" />
              {label}
            </Button>
          ))}
        </Nav>

        {/* Main Content */}
        <div className="main-content flex-grow-1 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form className="d-flex">
              <Form.Control type="text" placeholder="Rechercher..." className="me-2" />
              <Button variant="outline-secondary"><Search /></Button>
            </Form>
            <div className="d-flex align-items-center">
              <Bell className="me-4" />
              <img src={profil} alt="Profil" className="profile-img rounded-circle" />
            </div>
          </div>

          {views[currentView]}
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;
