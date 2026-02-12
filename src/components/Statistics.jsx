import { useState, useEffect, useRef } from 'react';
import '../styles/Statistics.css';

const Statistics = () => {
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardRefs = useRef([]);

  const stats = [
    { icon: '🏢', target: 1400, text: 'Global databases of companies with beneficial owners' },
    { icon: '🆔', target: 1800, text: 'ID types digitally Verified' },
    { icon: '🌍', target: 179, text: 'Countries Coverage' },
    { icon: '✓', target: 210, text: 'Electronic ID Verification Databases' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            if (!hasAnimated && entry.target === sectionRef.current) {
              setHasAnimated(true);
              animateCounters();
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.target) {
          current = stat.target;
          clearInterval(timer);
        }
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, interval);
    });
  };

  return (
    <section className="statistics" ref={sectionRef}>
      <div className="statistics-container">
        <h2 ref={titleRef} className="bounce-in">Statistics</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card fade-in-up"
              ref={(el) => (cardRefs.current[index] = el)}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-counter">{counters[index].toLocaleString()}</div>
              <p className="stat-text">{stat.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
