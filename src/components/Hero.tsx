import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="unified-hero">
      <div className="unified-hero-content">
        {/* Header: Name & Identity with Compact Skills/Connect */}
        <div className="hero-header">
          <h1 className="hero-name">Ashton Gibson</h1>
          <p className="hero-tagline">GIS Specialist | Environmental Science | Cartographic Design</p>
          <p className="hero-location">📍 University of Michigan · Geospatial Data Science</p>

          {/* Compact Skills Row */}
          <div className="hero-skills-compact">
            <span className="compact-label">Technical Expertise:</span>
            <div className="skills-compact-list">
              <div className="skill-chip">
                <span className="skill-chip-icon">📊</span>
                <span className="skill-chip-text">Data Management</span>
              </div>
              <div className="skill-chip">
                <span className="skill-chip-icon">🗺️</span>
                <span className="skill-chip-text">Spatial Analysis</span>
              </div>
              <div className="skill-chip">
                <span className="skill-chip-icon">🌐</span>
                <span className="skill-chip-text">Interactive Maps</span>
              </div>
              <div className="skill-chip">
                <span className="skill-chip-icon">🎨</span>
                <span className="skill-chip-text">Cartography</span>
              </div>
            </div>
          </div>

          {/* Compact Connect Buttons */}
          <div className="hero-connect-compact">
            <span className="compact-label">Let's Connect:</span>
            <div className="connect-compact-list">
              <a
                href="https://www.linkedin.com/in/ashton-gibson-20b956272/"
                target="_blank"
                rel="noopener noreferrer"
                className="connect-btn"
              >
                <span className="connect-btn-icon">💼</span>
                <span className="connect-btn-text">LinkedIn</span>
              </a>
              <a
                href="/assets/resume/Gibson-Ashton-Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="connect-btn"
              >
                <span className="connect-btn-icon">📄</span>
                <span className="connect-btn-text">Resume</span>
              </a>
              <a href="#projects" className="connect-btn connect-btn-primary">
                <span className="connect-btn-icon">→</span>
                <span className="connect-btn-text">View Projects</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bio & Photo Section */}
        <div className="hero-bio-section">
          <div className="hero-profile-photo">
            <img src="/assets/images/IMG_3908.JPG" alt="Ashton Gibson" />
          </div>
          <div className="hero-bio-text">
            <p className="bio-lead">
              Passionate about applying Geographic Information Systems for environmental
              conservation and scientific communication through mapping.
            </p>
            <p className="bio-secondary">
              Through coursework and internship experiences, I've developed expertise in
              spatial analysis and creating compelling cartographic designs that communicate
              complex spatial data to diverse audiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
