import React from 'react';
import '../styles/AboutUs.css';

const AboutUs = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">        
        <div className="about-content">          
          <div className="about-text">
            <h2>Enigmatig Regtech Product</h2>
            <p>
              Enigmatig gives you an empowered and secured onboarding experience, by streamlining KYC checks, client classification, and risk assessments under 3 minutes to exceed regulatory expectations.
            </p>
          </div>
          <div className="about-image">
            <img src="/images/2000_669774339fd54.webp" alt="About Enigmatig" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
