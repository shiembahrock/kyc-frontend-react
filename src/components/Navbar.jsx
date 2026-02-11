import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [navbarHeight, setNavbarHeight] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
      document.documentElement.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
    }
  }, []);

  const menuItems = [
    { id: 'home', label: 'Home', section: 'banner' },
    { id: 'product', label: 'Enigmatig Regtech Product', section: 'why-choose' },
    { id: 'awards', label: 'Awards', section: 'award-winning' },
    { id: 'services', label: 'Services', section: 'services' },
    { id: 'statistics', label: 'Statistics', section: 'statistics' },
    { id: 'pricing', label: 'Pricing', section: 'pricing' },
    { id: 'contact', label: 'Contact', section: 'contact' }
  ];

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        const navbar = document.querySelector('.navbar');
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const sections = menuItems.map(item => document.querySelector(`.${item.section}`));
        const scrollPosition = window.scrollY + navHeight + 10;

        for (let i = sections.length - 1; i >= 0; i--) {
          if (sections[i] && sections[i].offsetTop <= scrollPosition) {
            setActiveSection(menuItems[i].id);
            break;
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  const handleMenuClick = (item) => {
    setIsOpen(false);
    
    if (location.pathname === '/') {
      const section = document.querySelector(`.${item.section}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const section = document.querySelector(`.${item.section}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src="/images/Enigmatig Logo.png" alt="Company Logo" />
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <a
                className={activeSection === item.id && location.pathname === '/' ? 'active' : ''}
                onClick={() => handleMenuClick(item)}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a className="user-icon">👤</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
