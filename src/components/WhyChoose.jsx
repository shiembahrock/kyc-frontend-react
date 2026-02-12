import React, { useEffect, useRef } from 'react';
import '../styles/WhyChoose.css';

const WhyChoose = () => {
  const imageRef = useRef(null);
  const listRef = useRef(null);

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

    if (imageRef.current) observer.observe(imageRef.current);
    if (listRef.current) observer.observe(listRef.current);

    return () => observer.disconnect();
  }, []);

  const features = [
    'Efficient, Reliable, and Secure Onboarding',
    'Award Winning Platform',
    'Fully Automated Software As A Solution (SaaS)',
    'Reduce Manpower',
    'Fast Integration',
    'Best in Class User Experience'
  ];

  return (
    <section className="why-choose">
      <div className="why-choose-container">        
        <div className="why-choose-content">
          <div ref={imageRef} className="why-choose-image fade-in-left">
            <img src="/images/200066977432b2151.webp" alt="Why Choose Enigmatig Regtech" />
          </div>
          <div ref={listRef} className="why-choose-list fade-in-right">
            <h2>Why Choose Enigmatig Regtech?</h2>
            <ul>
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
