import React from 'react';
import '../styles/Services.css';

const Services = () => {
  const services = [
    {
      id: 1,
      image: '/images/400_gi-66977974915f5.webp',
      title: 'KYB',
      description: 'Helps your company conduct due diligence on your corporate clients through:',
      list: [
        'Sanctions Screening',
        'Adverse Media Screening',
        'Company Validation',
        'UBO & Directors',
        'Corporate Filing',
        'Group Structures',
        'Industry Codes and Credit Rating'
      ]
    },
    {
      id: 2,
      image: '/images/400_gi-66977c4005587.webp',
      title: 'CLIENT CLASSIFICATION',
      description: 'Categorize clients based on risk profile based on suitability and appropriateness by:',
      list: [
        'Risk and Investment needs profiling',
        'Appropriateness and clearance to make informed decision',
        'Evaluate and authorize cross-border transactions based on local/global regulatory compliance',
        'Identify and optimize client access to products and services',
        'Customize risk products based on client profile'
      ]
    },
    {
      id: 3,
      image: '/images/400_gi-66977a4d6ca21.webp',
      title: 'KYC',
      description: 'Automate and optimize Know Your Customer (KYC) checks to enhance compliance and streamline comprehensive identification.',
      list: [
        'PEP & Sanctions',
        'Ongoing Monitoring',
        'Adverse Media Screening',
        'IDV (ID Verification)',
        'Liveliness'
      ]
    },
    {
      id: 4,
      image: '/images/400_gi-669777e0ab66f.webp',
      title: 'ONGOING MONITORING',
      description: 'Post KYC & AML checks, you can continue to monitor the client profiles, updated risk assessments, track of regulatory or legislation changes and be alerted to any changes to your client\'s status.',
      list: []
    }
  ];

  return (
    <section id="services" className="services">
      <div className="services-container">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-image">
                <img src={service.image} alt={service.title} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              {service.list.length > 0 && (
                <ul className="service-list">
                  {service.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
