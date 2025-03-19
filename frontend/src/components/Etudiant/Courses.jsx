import React from 'react';
import './cours.css'
import StudentNavbar from './StudentNavbar';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const Courses = () => {
  const courses = [
    { name: "UX/UI", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/c2f6eb185bb2b9bde7c3bf3d44c1a69c74366163" },
    { name: "React", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/5b43938490494bc55a493b415f5237d571984cec" },
    { name: "PHP", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/02d5076015581fe4c0afbe742fe23942ebda15cb" },
    { name: "JavaScript", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/37c8d9b405a2737e5fc9c6e28a5d9d3cf1ace44d" }
  ];

  return (
    <div>
      <StudentNavbar/>

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
          <div className="categories-grid">
            {courses.map((course, index) => (
              <Link to={`/course/${course.name.toLowerCase()}`} key={index} className="category-card-link">
                <article className="category-card">
                  <img src={course.image} alt={`${course.name} catégorie`} className="category-image" />
                  <div className="category-overlay"></div>
                  <h3 className="category-name">{course.name}</h3>
                </article>
              </Link>
            ))}
          </div>
        </section>
        <Footer/>
      </main>
    </div>
  );
};

export default Courses;
