import React from 'react';
import './cours.css'
import StudentNavbar from './StudentNavbar';
import { Link } from 'react-router-dom';

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
              <p className="hero-category">By Themadbrains in inspiration</p>
              <h1 className="hero-title">
                Why Swift UI Should Be on the Radar of Every Mobile Developer
              </h1>
              <p className="hero-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempos Lorem ipsum dolor sitamet, consectetur adipiscing
                elit, sed do eiusmod tempor
              </p>
              <button className="cta-button">Start learning now</button>
            </div>
            <div className="hero-image-container">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/1d0971fc31c8fa194a5af0d0b3d6d7b0dd552d92"
                alt="Swift UI development illustration"
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
              <img src={course.image} alt={`${course.name} category`} className="category-image" />
              <div className="category-overlay"></div>
              <h3 className="category-name">{course.name}</h3>
            </article>
          </Link>
        ))}
      </div>
    </section>
        <section className="related-blog-section">
          <div className="section-header">
            <h2 className="section-title">Related Blog</h2>
            <a href="#" className="see-all-link">See all</a>
          </div>

          <div className="blog-grid">
            <article className="blog-card">
              <div className="blog-content">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f784c340ddd6e505ccd5d4eb7d1c0f2b212be7aa"
                  alt="Class edtech solution"
                  className="blog-image"
                />
                <h3 className="blog-title">
                  Class adds $30 million to its balance sheet for a Zoom-friendly
                  edtech solution
                </h3>
                <p className="blog-excerpt">
                  Class, launched less than a year ago by Blackboard co-founder
                  Michael Chasen, integrates exclusively...
                </p>
                <div className="blog-footer">
                  <div className="author-info">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/ff0ebc457ca43fe9da53ad4dc7fc74f297f8ecd7"
                      alt="Lina profile picture"
                      className="author-avatar"
                    />
                    <span className="author-name">Lina</span>
                  </div>
                  <div className="view-count">251,232</div>
                </div>
              </div>
            </article>

            <article className="blog-card">
              <div className="blog-content">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f784c340ddd6e505ccd5d4eb7d1c0f2b212be7aa"
                  alt="Class edtech solution"
                  className="blog-image"
                />
                <h3 className="blog-title">
                  Class adds $30 million to its balance sheet for a Zoom-friendly
                  edtech solution
                </h3>
                <p className="blog-excerpt">
                  Class, launched less than a year ago by Blackboard co-founder
                  Michael Chasen, integrates exclusively...
                </p>
                <div className="blog-footer">
                  <div className="author-info">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cc173ab4ab3d0eaececa715f50a2a47244a1a858"
                      alt="Lina profile picture"
                      className="author-avatar"
                    />
                    <span className="author-name">Lina</span>
                  </div>
                  <div className="view-count">251,232</div>
                </div>
              </div>
            </article>
          </div>
        </section>


      </main>
    </div>
  );
};

export default Courses;
