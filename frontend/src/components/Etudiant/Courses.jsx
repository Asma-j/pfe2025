import React, { useState, useEffect } from 'react';
import './cours.css';
import StudentNavbar from './StudentNavbar';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const Courses = () => {
  const [courses, setCourses] = useState([]); // État pour stocker les cours
  const [matieres, setMatieres] = useState([]); // État pour stocker les matières
  const [selectedMatiereId, setSelectedMatiereId] = useState(''); // Matière sélectionnée pour filtrer
  const [error, setError] = useState(null); // État pour gérer les erreurs

  // Récupérer les matières au chargement
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matieres');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des matières');
        }
        const data = await response.json();
        setMatieres(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMatieres();
  }, []);

  // Récupérer les cours en fonction de la matière sélectionnée
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url = selectedMatiereId
          ? `http://localhost:5000/api/cours?matiere_id=${selectedMatiereId}`
          : 'http://localhost:5000/api/cours';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des cours');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCourses();
  }, [selectedMatiereId]); // Recharger les cours lorsque selectedMatiereId change

  return (
    <div>
      <StudentNavbar />

      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <p className="hero-category">Par Themadbrains dans inspiration</p>
              <h1 className="hero-title">
                Pourquoi Swift UI devrait être sur le radar de chaque développeur mobile
              </h1>
              <p className="hero-description">
                SwiftUI représente l'avenir du développement d'applications sur les plateformes Apple en offrant une approche moderne,
                simple et efficace pour créer des interfaces utilisateur. 
                Son adoption permet une compatibilité accrue entre les différentes plateformes Apple, 
                faisant de lui un incontournable pour les développeurs mobiles.
              </p>
              <button className="cta-button">Commencez à apprendre maintenant</button>
            </div>
            <div className="hero-image-container">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/1d0971fc31c8fa194a5af0d0b3d6d7b0dd552d92"
                alt="Illustration du développement Swift UI"
                className="hero-image"
              />
            </div>
          </div>
        </section>

        <section className="blog-categories-section">
          <h2 className="section-title">Liste des cours</h2>

          {/* Menu déroulant pour sélectionner une matière */}
          <div className="mb-4">
            <label htmlFor="matiere-select" className="form-label">
              Filtrer par matière :
            </label>
            <select
              id="matiere-select"
              className="form-select"
              value={selectedMatiereId}
              onChange={(e) => setSelectedMatiereId(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              <option value="">Toutes les matières</option>
              {matieres.map((matiere) => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Afficher les erreurs */}
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {/* Afficher un message de chargement */}
          {courses.length === 0 && !error && (
            <div className="text-center">
              <p>Chargement des cours...</p>
            </div>
          )}

          {/* Afficher un message si aucun cours n'est trouvé */}
          {courses.length === 0 && matieres.length > 0 && !error && (
            <div className="text-center">
              <p>Aucun cours disponible pour cette matière.</p>
            </div>
          )}

          {/* Afficher les cours dynamiquement */}
          <div className="categories-grid">
            {courses.map((course, index) => (
              <Link
                to={`/course/${course.titre.toLowerCase()}`}
                key={index}
                className="category-card-link"
              >
                <article className="category-card">
                  <img
              src={`http://localhost:5000/uploads/${course.image}`}
                    alt={`${course.titre} catégorie`}
                    style={{ height: "350px",width:"450px", objectFit: "cover" }}
               
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