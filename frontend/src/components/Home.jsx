import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Card,
  Button
} from 'react-bootstrap';
import {
  MortarboardFill,
  BoxArrowInRight,
  PersonPlusFill,
  StarFill,
  ClockFill,
  PeopleFill,
  BookFill,
  TrophyFill,
  Bullseye,
  Globe,
  EnvelopeFill,
  TelephoneFill,
  GeoAltFill,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'react-bootstrap-icons';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Footer from './Etudiant/Footer';

function Home() {
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

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      <Navbar
        expand="lg"
        fixed="top"
        className={`transition-all shadow-sm ${isScrolled ? 'bg-white py-2 navbar-light' : 'bg-transparent py-3 navbar-dark'
          }`}
      >
        <Container>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            <MortarboardFill
              style={{ width: '32px', height: '32px' }}
              className="text-primary me-2"
            />
            <span className="fw-bold fs-4 text-primary">EduLearn</span>
          </Navbar.Brand>

          <Nav className="ms-auto d-flex flex-row gap-2">
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-1"
              onClick={openLoginModal}
            >
              <BoxArrowInRight />
              <span>Login</span>
            </Button>
            <Button
              variant="primary"
              className="d-flex align-items-center gap-1"
              onClick={openRegisterModal}
            >
              <PersonPlusFill />
              <span>Register</span>
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <section className="pt-5" style={{ marginTop: '80px' }}>
        <Container className="py-5">
          <Row className="align-items-center gy-4">
            <Col md={6}>
              <h1 className="display-5 fw-bold text-dark mb-4">
              Libérez votre potentiel avec
                <span className="text-primary"> Apprentissage en ligne</span>
              </h1>
              <p className="lead text-muted mb-4">
              Accédez à une éducation de classe mondiale où que vous soyez.
              Apprenez à votre propre rythme avec nos cours complets conçus pour tous.
              </p>
              <div className="d-flex gap-3">
                <Button variant="primary" className="px-4 py-2">
                Commencer
                </Button>
                <Button variant="outline-secondary" className="px-4 py-2">
                Parcourir les cours
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                  alt="Students learning"
                  className="img-fluid rounded shadow-lg"
                />
                <div
                  className="position-absolute bg-white p-3 rounded shadow"
                  style={{ bottom: '-20px', left: '-20px' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="bg-success rounded-circle"
                      style={{ width: '10px', height: '10px' }}
                    />
                    <span className="small fw-semibold">50K+ Active Students</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-primary">
        <Container>
          <Row className="text-white text-center">
            {[
              { Icon: PeopleFill, number: '50K+', label: 'Students' },
              { Icon: BookFill, number: '300+', label: 'Courses' },
              { Icon: TrophyFill, number: '95%', label: 'Success Rate' },
              { Icon: Globe, number: '20+', label: 'Countries' }
            ].map((stat, idx) => (
              <Col key={idx} xs={6} md={3} className="mb-4 mb-md-0">
                <stat.Icon size={32} className="mb-3 opacity-75" />
                <h2 className="fw-bold">{stat.number}</h2>
                <p className="m-0">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose EduLearn?</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              We provide the best online learning experience with our unique features
              and dedicated support.
            </p>
          </div>
          <Row className="g-4">
            {[
              {
                title: 'Expert Instructors',
                description: 'Learn from industry professionals with years of experience',
                Icon: Bullseye
              },
              {
                title: 'Flexible Learning',
                description: 'Study at your own pace with lifetime access to courses',
                Icon: ClockFill
              },
              {
                title: 'Interactive Content',
                description: 'Engage with dynamic content and real-world projects',
                Icon: PeopleFill
              }
            ].map((feature, idx) => (
              <Col key={idx} md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <feature.Icon size={32} className="text-primary mb-3" />
                    <Card.Title className="fw-semibold">
                      {feature.title}
                    </Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
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

     <Footer />


      <Login show={showLoginModal} onClose={closeLoginModal} />
      <Register show={showRegisterModal} onClose={closeRegisterModal} />

    </div>
  );
}

export default Home;
