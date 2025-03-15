import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Navbar, Nav, Container, Dropdown,
  Row,
  Col,
  Card,
  Button,Form
} from 'react-bootstrap';
import {
  MortarboardFill,
  PersonCircle, Gear, BoxArrowRight,
  StarFill,
  EnvelopeFill,
  TelephoneFill,
  GeoAltFill,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'react-bootstrap-icons';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import './student.css';
import profil from'../images/aupair-2380047_1920.png';
function StudentDashboard() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => setShowRegisterModal(false);
  const handleProfileClick = () => {
    console.log('Profile clicked');
  };
  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      <Navbar
      expand="lg"
      fixed="top"
      className={`transition-all shadow-sm ${isScrolled ? 'bg-white py-2 navbar-light' : 'bg-transparent py-3 navbar-dark'}`}
    >
      <Container>
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <MortarboardFill
            style={{ width: '32px', height: '32px' }}
            className="text-primary me-2"
          />
          <span className="fw-bold fs-4 text-primary">EduLearn</span>
        </Navbar.Brand>

        <Nav className="ms-auto d-flex flex-row gap-4">
          {/* Navbar Links */}
          <Link to="/" className="nav-link  text-primary">
            Accueil
          </Link>
          <Link to="/courses" className="nav-link  text-primary">
            Cours
          </Link>

          {/* Profile Dropdown */}
          <Dropdown align="end">
  {/* Bouton du dropdown avec une meilleure image */}
  <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0 border-0">
    <img
      src={profil}
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

  {/* Contenu du menu déroulant */}
  <Dropdown.Menu className="shadow-sm p-3 rounded border-0" style={{ minWidth: '200px' }}>
    {/* Section profil avec un fond stylé */}
    <div className="d-flex align-items-center px-3 py-3 bg-light rounded">
      <img
        src={profil}
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
        <div className="fw-bold fs-6">John Doe</div>
        <small className="text-muted">Admin</small>
      </div>
    </div>

    {/* Options du menu avec un effet de survol */}
    <Dropdown.Item href="#/profile" className="py-2">
      <Gear className="me-2 text-primary" /> Paramètres
    </Dropdown.Item>
    <Dropdown.Item href="#/logout" className="py-2 text-danger">
      <BoxArrowRight className="me-2" /> Déconnexion
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
        </Nav>
      </Container>
    </Navbar>
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



      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Liste des cours</h2>
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
              </Col>
            ))}
          </Row>
        </Container>
      </section>

  


      {/* FOOTER */}
      <footer className="bg-dark text-light pt-5">
        <Container>
          <Row className="gy-4">
            {/* Company Info */}
            <Col md={4}>
              <div className="d-flex align-items-center mb-3">
                <MortarboardFill size={32} className="text-primary me-2" />
                <h5 className="m-0 fw-bold">EduLearn</h5>
              </div>
              <p className="small text-muted">
                Empowering individuals through quality education and lifelong learning opportunities.
              </p>
              <div className="d-flex gap-3 mt-3">
                <Facebook className="text-muted fs-5 cursor-pointer" />
                <Twitter className="text-muted fs-5 cursor-pointer" />
                <Instagram className="text-muted fs-5 cursor-pointer" />
                <Linkedin className="text-muted fs-5 cursor-pointer" />
                <Youtube className="text-muted fs-5 cursor-pointer" />
              </div>
            </Col>

            {/* Quick Links */}
            <Col md={2}>
              <h6 className="fw-bold text-white mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                {['About Us', 'Courses', 'Instructors', 'Pricing', 'Career', 'Blog'].map((link, i) => (
                  <li key={i} className="mb-2">
                    <a href="#!" className="text-muted text-decoration-none small">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Support */}
            <Col md={2}>
              <h6 className="fw-bold text-white mb-3">Support</h6>
              <ul className="list-unstyled">
                {[
                  'Help Center',
                  'Terms of Service',
                  'Privacy Policy',
                  'Cookie Policy',
                  'FAQs',
                  'Contact Us'
                ].map((link, i) => (
                  <li key={i} className="mb-2">
                    <a href="#!" className="text-muted text-decoration-none small">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Contact Info */}
            <Col md={4}>
              <h6 className="fw-bold text-white mb-3">Contact Us</h6>
              <div className="d-flex align-items-start mb-2">
                <GeoAltFill className="text-primary me-2 mt-1" />
                <small className="text-muted">
                  123 Learning Street, Education City, 10001
                </small>
              </div>
              <div className="d-flex align-items-center mb-2">
                <TelephoneFill className="text-primary me-2" />
                <small className="text-muted">+1 (555) 123-4567</small>
              </div>
              <div className="d-flex align-items-center">
                <EnvelopeFill className="text-primary me-2" />
                <small className="text-muted">support@edulearn.com</small>
              </div>
            </Col>
          </Row>
        </Container>

        <div className="border-top border-secondary mt-5">
          <Container className="py-3">
            <Row className="justify-content-between align-items-center">
              <Col md={6}>
                <small className="text-muted">
                  © 2025 EduLearn. All rights reserved.
                </small>
              </Col>
              <Col md={6} className="text-md-end">
                <a href="#!" className="text-muted small me-3 text-decoration-none">
                  Terms
                </a>
                <a href="#!" className="text-muted small me-3 text-decoration-none">
                  Privacy
                </a>
                <a href="#!" className="text-muted small text-decoration-none">
                  Cookies
                </a>
              </Col>
            </Row>
          </Container>
        </div>
      </footer>


      <Login show={showLoginModal} onClose={closeLoginModal} />
      <Register show={showRegisterModal} onClose={closeRegisterModal} />

    </div>
  );
}

export default StudentDashboard;
