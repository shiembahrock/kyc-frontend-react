import React from 'react';
import '../styles/Banner.css';

const Banner = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="banner">
      <div className="banner-content">
        <h1>Welcome to Enigmatig</h1>
        <p>Simplifying Client Onboarding in Minutes</p>
        <button className="cta-button" onClick={scrollToPricing}>Get Started</button>
      </div>
    </section>
  );
};

export default Banner;
