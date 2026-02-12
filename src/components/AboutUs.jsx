import React, { useEffect, useRef } from 'react';
import '../styles/AboutUs.css';

const AboutUs = () => {
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (textRef.current) observer.observe(textRef.current);
    if (imageRef.current) observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="about">
      <div className="about-container">        
        <div className="about-content">          
          <div ref={textRef} className="about-text fade-in-left">
            <h2>Enigmatig Regtech Product</h2>
            <p>
              Enigmatig gives you an empowered and secured onboarding experience, by streamlining KYC checks, client classification, and risk assessments under 3 minutes to exceed regulatory expectations.
            </p>
          </div>
          <div ref={imageRef} className="about-image fade-in-right">
            <img src="/images/2000_669774339fd54.webp" alt="About Enigmatig" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
