import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import StudentNavbar from "./StudentNavbar";
import Footer from "./Footer";
import axios from "axios";
import "./cours.css"; // Corrected file name
import img from "../images/online.jpg"
import img1 from "../images/never-stop-learning-3653430_1920.jpg"
const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiereId, setSelectedMatiereId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch matières
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/matieres");
        setMatieres(response.data);
      } catch (err) {
        setError("Erreur lors du chargement des matières.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatieres();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const url = selectedMatiereId
          ? `http://localhost:5000/api/cours?matiere_id=${selectedMatiereId}`
          : "http://localhost:5000/api/cours";
        const response = await axios.get(url);
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (err) {
        setError("Erreur lors du chargement des cours.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedMatiereId]);

  // Filter courses based on search term
  useEffect(() => {
    const filtered = courses.filter((course) =>
      course.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  return (
    <div className="courses-page">
      <StudentNavbar />

      {/* Hero Section */}
    <Container fluid className="hero-section">
      <div className="hero-image-container">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1600 800"
          preserveAspectRatio="xMidYMid slice"
          className="hero-svg"
        >
          <defs>
            <filter id="turbulent-dissolve" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency=".012" />
              <feColorMatrix type="luminanceToAlpha" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0">
                  <animate
                    attributeName="slope"
                    values="0;0;0.5;1;1.5;2;2;1.5;1;0.5;0"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </feFuncA>
              </feComponentTransfer>
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0 1" />
              </feComponentTransfer>
              <feGaussianBlur stdDeviation="1" />
              <feComposite operator="in" in="SourceGraphic" result="overlay" />
              <feImage
                href={img}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
                result="underlay"
              />
              <feComposite operator="over" in="overlay" in2="underlay" />
            </filter>
          </defs>
          <image
            filter="url(#turbulent-dissolve)"
            x="0"
            y="0"
        width="100%"
          height="100%"
            href={img1}
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
        <div className="hero-overlay" />
      </div>

      <Row className="justify-content-center hero-row">
        <Col md={10} lg={8} className="hero-content text-center">
          <h2 className="hero-title">Découvrez Nos Cours</h2>
          <Form className="search-form">
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                placeholder="Rechercher des cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Rechercher des cours"
              />
              <Button variant="danger" type="submit" className="search-button">
                Recherche
              </Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </Container>

      {/* Courses Section */}
      <Container fluid className="courses-section">
        <Row className="courses-row">
          <Col>
            <Container>
              <Row >
                <Col>
                  <h2 className="section-title">Liste des Cours</h2>
                </Col>
              </Row>
              <Row >
                <Col md={6} lg={4}>
                  {/* Filter by Matière */}
                  <Form.Group className="mb-3 filter-group" controlId="matiere-select">
                    <Form.Label className="filter-label">Filtrer par matière</Form.Label>
                    <Form.Select
                      value={selectedMatiereId}
                      onChange={(e) => setSelectedMatiereId(e.target.value)}
                      aria-label="Filtrer par matière"
                      className="filter-select"
                    >
                      <option value="">Toutes les matières</option>
                      {matieres.map((matiere) => (
                        <option key={matiere.id} value={matiere.id}>
                          {matiere.nom}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Error and Loading States */}
              <Row>
                <Col>
                  {error && (
                    <Alert variant="danger" role="alert">
                      {error}
                    </Alert>
                  )}

                  {loading && (
                    <div className="text-center py-3">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </Spinner>
                    </div>
                  )}

                  {!loading && filteredCourses.length === 0 && !error && (
                    <Alert variant="info" className="text-center">
                      Aucun cours trouvé pour cette recherche ou matière.
                    </Alert>
                  )}
                </Col>
              </Row>

              {/* Courses Grid */}
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {filteredCourses.map((course) => (
                  <Col key={course.id}>
                    <Link to={`/course/${course.id}`} className="course-card-link">
                      <Card className="course-card">
                        <Card.Img
                          variant="top"
                          src={
                            course.image
                              ? `http://localhost:5000/Uploads/${course.image}`
                              : "https://via.placeholder.com/450x200?text=Image+Indisponible"
                          }
                          alt={`Cours: ${course.titre}`}
                          className="course-image"
                          loading="lazy"
                        />
                        <div className="course-overlay" />
                        <Card.Body className="course-body">
                          <Card.Title className="course-title">{course.titre}</Card.Title>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
};

export default Courses;