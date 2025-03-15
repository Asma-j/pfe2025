import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Form, Badge } from 'react-bootstrap';
import { People, Book, Calendar, BarChart, Gear, Search, Bell, Clock, Star, MortarboardFill, Speedometer } from 'react-bootstrap-icons';
import Students from './Students';
import Courses from './Courses';
import Schedule from './Schedule';
import './admin.css';
import profil from '../images/businessman-310819_1280.png';
import Background3D from './Background3D';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="dashboard-container">
      {/* Background 3D en arrière-plan */}
      <Background3D />

      <Container fluid className="min-vh-100 d-flex p-0">
        {/* Sidebar */}
        <Nav className="flex-column bg-light shadow-sm p-3 sidebar">
          <div className="d-flex align-items-center p-3">
            <MortarboardFill style={{ width: '32px', height: '32px' }} className="text-White me-2" />
            <span className="fw-bold fs-4 text-White">EduAdmin</span>
          </div>
          {[ 
            { icon: Speedometer, label: 'Dashboard', view: 'dashboard' },
            { icon: People, label: 'Students', view: 'students' },
            { icon: Book, label: 'Courses', view: 'courses' },
            { icon: Calendar, label: 'Schedule', view: 'schedule' },
            { icon: BarChart, label: 'Analytics', view: 'analytics' },
            { icon: Gear, label: 'Settings', view: 'settings' },
          ].map(({ icon: Icon, label, view }) => (
            <Button key={label} variant="light" onClick={() => setCurrentView(view)} className="d-flex align-items-center mb-2 text-start">
              <Icon className="me-2" />
              {label}
            </Button>
          ))}
        </Nav>

        {/* Main content */}
        <div className="main-content flex-grow-1 p-4">
          {/* Navbar */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form className="d-flex">
              <Form.Control type="text" placeholder="Search..." className="me-2" />
              <Button variant="outline-secondary">
                <Search />
              </Button>
            </Form>
            <div className="d-flex align-items-center">
              <Bell className="me-4 " />
              <img src={profil} alt="Profile" className="profile-img rounded-circle " />
            </div>
          </div>

          {/* Render Content */}
          {currentView === 'students' ? <Students /> :
            currentView === 'courses' ? <Courses /> :
              currentView === 'schedule' ? <Schedule /> :
                <>
           <Row>
  {[
    { icon: People, label: 'Total Students', value: '1,234' },
    { icon: Book, label: 'Active Courses', value: '42' },
    { icon: Calendar, label: 'Completion Rate', value: '87%' },
    { icon: People, label: 'New Enrollments', value: '+28' },
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
                    {[{
                      title: 'Recent Students',
                      data: [
                        { name: 'Emma Wilson', email: 'emma.w@example.com', courses: 3, time: '2 hours ago' },
                        { name: 'James Rodriguez', email: 'james.r@example.com', courses: 4, time: '1 day ago' },
                      ],
                      render: ({ name, email, courses, time }) => (
                        <Row key={name} className="align-items-center border-bottom p-2">
                          <Col>
                            <div>{name}</div>
                            <small className="text-muted">{email}</small>
                          </Col>
                          <Col xs="auto">
                            <Badge bg="primary">{courses} courses</Badge>
                          </Col>
                          <Col xs="auto">
                            <Clock size={16} className="me-1" />
                            <small className="text-muted">{time}</small>
                          </Col>
                        </Row>
                      )
                    }, {
                      title: 'Popular Courses',
                      data: [
                        { title: 'Advanced JavaScript Development', instructor: 'Dr. Alan Smith', students: 156, duration: '12 weeks' },
                      ],
                      render: ({ title, instructor, students, duration }) => (
                        <Row key={title} className="align-items-center border-bottom p-2">
                          <Col>
                            <div>{title}</div>
                            <small className="text-muted">{instructor}</small>
                          </Col>
                          <Col xs="auto">
                            <Star size={16} className="me-1" />
                            <small className="text-muted">{students} students</small>
                          </Col>
                          <Col xs="auto">
                            <small className="text-muted">{duration}</small>
                          </Col>
                        </Row>
                      )
                    }].map(({ title, data, render }) => (
                      <Col key={title} md={6}>
                        <Card className="p-3">
                          <Card.Title>{title}</Card.Title>
                          {data.map(render)}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
          }
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;
