import React from 'react';
import '../styles/AboutUs.css';

const AboutUs = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <h2>About Us</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              We are a team of dedicated professionals committed to delivering high-quality services 
              and solutions to our clients. With over a decade of experience in the industry, we have 
              established ourselves as a trusted partner for businesses of all sizes.
            </p>
            <p>
              Our mission is to provide innovative solutions that drive business growth and success. 
              We believe in the power of collaboration, creativity, and continuous improvement.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Happy Clients</p>
            </div>
            <div className="stat">
              <h3>1000+</h3>
              <p>Projects Completed</p>
            </div>
            <div className="stat">
              <h3>10+</h3>
              <p>Years Experience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
