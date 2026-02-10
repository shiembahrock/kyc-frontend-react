import React from 'react';
import '../styles/Banner.css';

const Banner = () => {
  return (
    <section className="banner">
      <div className="banner-content">
        <h1>Welcome to Our Service</h1>
        <p>Your trusted partner for excellence and innovation</p>
        <button className="cta-button">Get Started</button>
      </div>
    </section>
  );
};

export default Banner;
