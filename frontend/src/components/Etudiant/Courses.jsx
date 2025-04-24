import React, { useState, useEffect } from "react";
import "./cours.css";
import StudentNavbar from "./StudentNavbar";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]); // New state for filtered courses
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiereId, setSelectedMatiereId] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatieres();
  }, []);

  // Fetch courses and apply search filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const url = selectedMatiereId
          ? `http://localhost:5000/api/cours?matiere_id=${selectedMatiereId}`
          : "http://localhost:5000/api/cours";
        const response = await axios.get(url);
        setCourses(response.data);
      } catch (err) {
        setError(err.message);
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
    <div>
      <StudentNavbar />

      <main>
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
                <div className="search-container">
                  <div className="d-flex justify-content-center align-items-center">
                    <input
                      type="text"
                      className="form-control search-input"
                      placeholder="Rechercher des cours..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="primary" className="search-button">
                      Recherche
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="blog-categories-section">
          <h2 className="section-title">Liste des cours</h2>

          <div className="mb-4">
            <label htmlFor="matiere-select" className="form-label">
              Filtrer par matière :
            </label>
            <select
              id="matiere-select"
              className="form-select"
              value={selectedMatiereId}
              onChange={(e) => setSelectedMatiereId(e.target.value)}
              style={{ maxWidth: "300px" }}
            >
              <option value="">Toutes les matières</option>
              {matieres.map((matiere) => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center">
              <p>Chargement des cours...</p>
            </div>
          )}

          {!loading && filteredCourses.length === 0 && !error && (
            <div className="text-center">
              <p>Aucun cours trouvé pour cette recherche ou matière.</p>
            </div>
          )}

<div className="categories-grid">
            {filteredCourses.map((course, index) => (
              <Link
                to={`/course/${course.id}`}
                key={index}
                className="category-card-link"
              >
                <article className="category-card">
                  <img
                    src={
                      course.image
                        ? `http://localhost:5000/Uploads/${course.image}`
                        : "https://cdn.builder.io/api/v1/image/assets/TEMP/1d0971fc31c8fa194a5af0d0b3d6d7b0dd552d92?apiKey=94620a1500a3473894a74b620cac940d"
                    }
                    alt={`${course.titre} catégorie`}
                    style={{
                      height: "350px",
                      width: "450px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="category-overlay"></div>
                  <h3 className="category-name">{course.titre}</h3>
                </article>
              </Link>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default Courses;