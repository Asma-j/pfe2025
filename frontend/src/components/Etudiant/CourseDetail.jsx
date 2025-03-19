import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './cours.css'

const CourseDetail = () => {
 const [activeTab, setActiveTab] = useState("Overview");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="page-container">
      <section className="hero-banner">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/5c6958e7f3998b6cd8a995e08375607330da0fa7?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d"
          alt="Course banner"
          className="banner-image"
        />
      </section>

      <section className="course-overview" data-el="div-1">
        <div className="course-container">
          <div className="course-tabs">
            <nav className="tabs-navigation">
              <ul className="tab-list">
                {["Overview", "Overview", "Overview", "Overview"].map((tab, index) => (
                  <li className="tab-item" key={index}>
                    <a
                      href="#"
                      className={`tab-link ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => handleTabClick(tab)}
                    >
                      {tab}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <aside className="course-sidebar">
            <div className="course-card">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a85e77bb033323a4f80aa22a5ddaa820f2f71367?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d"
                alt="Course thumbnail"
                className="course-thumbnail"
              />
              <div className="price-container">
                <span className="current-price">$49.65</span>
                <span className="original-price">$99.99</span>
                <span className="discount-badge">50% Off</span>
              </div>
              <p className="time-limited">11 hour left at this price</p>
              <button className="buy-button">Buy Now</button>
              <hr className="divider" />
              <h3 className="included-heading">This Course included</h3>
              <ul className="features-list">
                <li className="feature-item">
                  <span className="feature-icon"></span>
                  <span className="feature-text">Money Back Guarantee</span>
                </li>
                <li className="feature-item">
                  <span className="feature-icon"></span>
                  <span className="feature-text">Access on all devices</span>
                </li>
                <li className="feature-item">
                  <span className="feature-icon"></span>
                  <span className="feature-text">Certification of completion</span>
                </li>
                <li className="feature-item">
                  <span className="feature-icon"></span>
                  <span className="feature-text">32 Modules</span>
                </li>
              </ul>
              <hr className="divider" />
              <h3 className="training-heading">Training 5 or more people</h3>
              <p className="training-description">
                Class, launched less than a year ago by Blackboard co-founder
                Michael Chasen, integrates exclusively...
              </p>
              <hr className="divider" />
              <h3 className="share-heading">Share this course</h3>
              <div className="social-icons">
                {[
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/971e11dbb3c80f5c7afdd9ddf42dc99cf7c4bd4f?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/6556fb2e78bc980437597712ec5e2c13a4a004fe?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/690c164f54c36a16ac6f5df34944b2d5602d4a14?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/a6ad2a96f442ed504bfbc452faf5e011a11ab2f1?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/601c59c67457c30c2c2641f5123e1ca59dbaa2f5?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/c7e03ae93187ea08b42bbd307343ad28d4a5f6a3?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d"
                ].map((icon, index) => (
                  <a href="#" className="social-link" key={index}>
                    <img
                      src={icon}
                      alt="Social icon"
                      className="social-icon"
                    />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="articles-section">
        <div className="section-header">
          <h2 className="section-title">Marketing Articles</h2>
          <a href="#" className="see-all-link">See all</a>
        </div>

        <div className="article-grid" data-el="div-2">
          <div className="article-row">
            {[
              {
                image: "https://cdn.builder.io/api/v1/image/assets/TEMP/effbf5c8be39fcfbf5b4ef7539a4f3218c35abfc?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                thumbnail: "https://cdn.builder.io/api/v1/image/assets/TEMP/a5ac67f9f10566bbd0e1024f8b0e6cfaf23702a7?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                category: "Design",
                duration: "3 Month",
                title: "AWS Certified Solutions Architect",
                description: "Lorem ipsum dolor sit amet, consectetur adipising elit, sed do eiusmod tempor",
                price: { original: "$100", discounted: "$80" },
                author: "Lina",
                authorImage: "https://cdn.builder.io/api/v1/image/assets/TEMP/64ee54add3c6b029a5afcf7033832dcbda275ef1?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d"
              },
              {
                image: "https://cdn.builder.io/api/v1/image/assets/TEMP/d1f20a3541fbfb10aa616199c7f3931ff5b517fb?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                thumbnail: "https://cdn.builder.io/api/v1/image/assets/TEMP/effbf5c8be39fcfbf5b4ef7539a4f3218c35abfc?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                category: "Design",
                duration: "3 Month",
                title: "AWS Certified Solutions Architect",
                description: "Lorem ipsum dolor sit amet, consectetur adipising elit, sed do eiusmod tempor",
                price: { original: "$100", discounted: "$80" },
                author: "Lina",
                authorImage: "https://cdn.builder.io/api/v1/image/assets/TEMP/64ee54add3c6b029a5afcf7033832dcbda275ef1?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d"
              },
              {
                image: "https://cdn.builder.io/api/v1/image/assets/TEMP/f4cc1a812589975f013dce2c64253a863df4abb8?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                thumbnail: "https://cdn.builder.io/api/v1/image/assets/TEMP/d1f20a3541fbfb10aa616199c7f3931ff5b517fb?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d",
                category: "Design",
                duration: "3 Month",
                title: "AWS Certified Solutions Architect",
                description: "Lorem ipsum dolor sit amet, consectetur adipising elit, sed do eiusmod tempor",
                price: { original: "$100", discounted: "$80" },
                author: "Lina",
                authorImage: "https://cdn.builder.io/api/v1/image/assets/TEMP/64ee54add3c6b029a5afcf7033832dcbda275ef1?placeholderIfAbsent=true&apiKey=94620a1500a3473894a74b620cac940d"
              }
            ].map((article, index) => (
              <article className="article-card" key={index}>
                <div className="article-image-container">
                  <img
                    src={article.image}
                    alt="Article background"
                    className="article-background"
                  />
                  <img
                    src={article.thumbnail}
                    alt="Article thumbnail"
                    className="article-thumbnail"
                  />
                </div>
                <div className="article-meta">
                  <span className="article-category">{article.category}</span>
                  <div className="article-duration">
                    <span className="duration-icon"></span>
                    <span className="duration-text">{article.duration}</span>
                  </div>
                </div>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-description">{article.description}</p>
                <div className="article-footer">
                  <div className="article-author">
                    <img
                      src={article.authorImage}
                      alt="Author"
                      className="author-image"
                    />
                    <span className="author-name">{article.author}</span>
                  </div>
                  <div className="article-price">
                    <span className="price-original">{article.price.original}</span>
                    <span className="price-discounted">{article.price.discounted}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;