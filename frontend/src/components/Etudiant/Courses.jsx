import React, { useState, useEffect } from "react";
import "./cours.css";
import StudentNavbar from "./StudentNavbar";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiereId, setSelectedMatiereId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <StudentNavbar />

      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <p className="hero-category">Par Themadbrains dans inspiration</p>
              <h1 className="hero-title">
                Pourquoi Swift UI devrait être sur le radar de chaque
                développeur mobile
              </h1>
              <p className="hero-description">
                SwiftUI représente l'avenir du développement d'applications sur
                les plateformes Apple en offrant une approche moderne, simple et
                efficace pour créer des interfaces utilisateur. Son adoption
                permet une compatibilité accrue entre les différentes
                plateformes Apple, faisant de lui un incontournable pour les
                développeurs mobiles.
              </p>
              <button className="cta-button">
                Commencez à apprendre maintenant
              </button>
            </div>
            <div className="hero-image-container">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/1d0971fc31c8fa194a5af0d0b3d6d7b0dd552d92?apiKey=94620a1500a3473894a74b620cac940d"
                alt="Illustration du développement Swift UI"
                className="hero-image"
              />
            </div>
          </div>
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

          {!loading && courses.length === 0 && !error && (
            <div className="text-center">
              <p>Aucun cours disponible pour cette matière.</p>
            </div>
          )}

          <div className="categories-grid">
            {courses.map((course, index) => (
              <Link
                to={`/course/${course.id}`} // Use course.id
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