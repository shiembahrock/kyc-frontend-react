import React from 'react';
import '../styles/Services.css';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies',
      icon: '🌐'
    },
    {
      id: 2,
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile application development',
      icon: '📱'
    },
    {
      id: 3,
      title: 'UI/UX Design',
      description: 'Beautiful and intuitive user interface design',
      icon: '🎨'
    },
    {
      id: 4,
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure and services',
      icon: '☁️'
    },
    {
      id: 5,
      title: 'Data Analytics',
      description: 'Insights and analytics for better decision making',
      icon: '📊'
    },
    {
      id: 6,
      title: 'Consulting',
      description: 'Expert guidance and strategic consulting services',
      icon: '💡'
    }
  ];

  return (
    <section id="services" className="services">
      <div className="services-container">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
