import React from 'react';
import { Link } from 'react-router-dom';
import {
Container, 
  Row,
  Col,
  Card,
  Button,

} from 'react-bootstrap';
import {
  StarFill,
} from 'react-bootstrap-icons';
import './student.css';
import StudentNavbar from './StudentNavbar';
import Footer from './Footer';

function StudentDashboard() {


  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
<StudentNavbar/>
    <section className="pt-5 hero-section">
  <Container fluid className="px-0">
    <Row className="align-items-center gy-4">
      <Col md={12} className="position-relative">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
          alt="Students learning"
          className="img-fluid hero-image"
        />

        <div className="overlay" />

        {/* Barre de recherche centrée */}
        <div className="search-container">
          <div className="d-flex justify-content-center align-items-center">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Rechercher des cours."
            />
            <Button
              variant="primary"
              className="search-button"
            >
              Recherche
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  </Container>
</section>

<section className="mb-4">
  <Container>
    <div className="text-center mb-3">
      <h2 className="fw-bold">Liste des Matières</h2>
      <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
        Découvrez nos cours les plus populaires et commencez votre parcours d'apprentissage dès aujourd'hui.
      </p>
    </div>
    <Row className="g-4">
      {[
        {
          title: 'Web Development Bootcamp',
          instructor: 'Sarah Johnson',
          rating: 4.9,
          students: 12500,
          image:
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80'
        },
        {
          title: 'Data Science Fundamentals',
          instructor: 'Michael Chen',
          rating: 4.8,
          students: 9800,
          image:
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        },
        {
          title: 'Digital Marketing Mastery',
          instructor: 'Emma Wilson',
          rating: 4.7,
          students: 7300,
          image:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1415&q=80'
        }
      ].map((course, idx) => (
        <Col key={idx} md={4}>
          <Link
            to={{
              pathname: `/cours/${encodeURIComponent(course.title)}`,
              state: { course }
            }}
            className="text-decoration-none"
          >
            <Card className="border-0 shadow-sm h-100">
              <Card.Img
                variant="top"
                src={course.image}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title className="fw-semibold">{course.title}</Card.Title>
                <Card.Text className="text-muted mb-3">
                  by {course.instructor}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-1">
                    <StarFill className="text-warning" />
                    <span className="fw-semibold">{course.rating}</span>
                  </div>
                  <small className="text-muted">
                    {course.students.toLocaleString()} students
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  </Container>
</section>


  <Footer/>


    </div>
  );
}

export default StudentDashboard;
