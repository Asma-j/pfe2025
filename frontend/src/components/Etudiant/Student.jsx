import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { StarFill } from "react-bootstrap-icons";
import "./student.css";
import StudentNavbar from "./StudentNavbar";
import Footer from "./Footer";

function StudentDashboard() {
  const [matieres, setMatieres] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 État pour la recherche

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/matieres");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des matières");
        }
        const data = await response.json();
        setMatieres(data);
      } catch (err) {
        setError(err.message);
        console.error("Erreur:", err);
      }
    };

    fetchMatieres();
  }, []);

  // 🔍 Filtrage des matières selon le terme recherché
  const filteredMatieres = matieres.filter((matiere) =>
    matiere.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-light" style={{ minHeight: "100vh" }}>
      <StudentNavbar />
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
                    placeholder="Rechercher des matières..."
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

      <section className="mb-4">
        <Container>
          <div className="text-center mb-3">
            <h2 className="fw-bold">Liste des Matières</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
              Découvrez nos cours les plus populaires et commencez votre
              parcours d'apprentissage dès aujourd'hui.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {matieres.length === 0 && !error && (
            <div className="text-center">
              <p>Chargement des matières...</p>
            </div>
          )}

          <Row className="g-4">
            {filteredMatieres.map((matiere, idx) => (
              <Col key={idx} md={4}>
                <Link
                  to={{
                    pathname: `/cours/${encodeURIComponent(matiere.nom)}`,
                    state: { matiere },
                  }}
                  className="text-decoration-none"
                >
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000/uploads/${matiere.image}`}
                      style={{ height: "250px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title className="fw-semibold">
                        {matiere.nom}
                      </Card.Title>
                      <Card.Text className="text-muted mb-3">
                        {matiere.description}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-1">
                          <StarFill className="text-warning" />
                          <span className="fw-semibold">
                            {matiere.rating || "N/A"}
                          </span>
                        </div>
                        <small className="text-muted">
                          {(matiere.students || 0).toLocaleString()} étudiants
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

      <Footer />
    </div>
  );
}

export default StudentDashboard;
