import React from 'react';
import '../styles/WhyChoose.css';

const WhyChoose = () => {
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
          <div className="why-choose-image">
            <img src="/images/200066977432b2151.webp" alt="Why Choose Enigmatig Regtech" />
          </div>
          <div className="why-choose-list">
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
