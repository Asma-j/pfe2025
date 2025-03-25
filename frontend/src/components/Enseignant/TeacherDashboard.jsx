import React, { useState }  from 'react';
import { Container, Row, Col, Form, Button, Nav,Card } from 'react-bootstrap';
import Sidebar from '../Admin/Sidebar';
import TopStudentsChart from './TopStudentsChart';
import StudentList from './StudentList';
import TeacherCalendar from './TeacherCalendar';
import CourseManager from './CourseManager';
import './teacher.css';
import profil from "../images/businessman-310819_1280.png";
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
function TeacherDashboard() {
      const [currentView, setCurrentView] = useState("dashboard");
      const views = {
        students: <StudentList />,
        courses: <CourseManager />,
        schedule: <TeacherCalendar />,
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
       <TopStudentsChart/>
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
              <img
                src={profil}
                alt="Profil"
                className="profile-img rounded-circle"
              />
            </div>
          </div>

          {views[currentView] || <div>View not found</div>}
        </div>
      </Container>
    </div>

  
    </div>
  );
}

export default TeacherDashboard;