import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = (e, sectionClass) => {
    e.preventDefault();
    
    if (location.pathname === '/') {
      const section = document.querySelector(`.${sectionClass}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const section = document.querySelector(`.${sectionClass}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Enigmatig</h4>
            <p>One-stop offshore service provider with a global network of partners and a diversified portfolio of businesses.</p>
          </div>
          <div className="footer-section">
            <h4>Important Links</h4>
            <ul>
              <li><a href="#banner" onClick={(e) => handleLinkClick(e, 'banner')}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Enigmatig Regtech Product</a></li>
              <li><a href="#award-winning" onClick={(e) => handleLinkClick(e, 'award-winning')}>Awards</a></li>
              <li><a href="#services" onClick={(e) => handleLinkClick(e, 'services')}>Services</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Useful Links</h4>
            <ul>
              <li><a href="#statistics" onClick={(e) => handleLinkClick(e, 'statistics')}>Statistics</a></li>
              <li><a href="#pricing" onClick={(e) => handleLinkClick(e, 'pricing')}>Pricing</a></li>
              <li><a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Get In Touch</h4>
            <div className="social-links">
              <a href="https://maps.app.goo.gl/vW6L42WrDiUUHjAa8" target="_blank" className="social-link">
                <span className="icon">📍</span>
                16 Raffles Quay #30-01 Hong Leong Building Singapore 048581
              </a>
              <a href="mailto:info@enigmatig.com" className="social-link">
                <span className="icon">✉️</span>
                info@enigmatig.com
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Enigmatig. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
