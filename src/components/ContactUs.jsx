import React, { useState, useEffect, useRef } from 'react';
import '../styles/ContactUs.css';

const ContactUs = () => {
  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const formRef = useRef(null);

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

    if (titleRef.current) observer.observe(titleRef.current);
    if (infoRef.current) observer.observe(infoRef.current);
    if (formRef.current) observer.observe(formRef.current);

    return () => observer.disconnect();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <h2 ref={titleRef} className="bounce-in">Contact Us</h2>
        <div className="contact-content">
          <div ref={infoRef} className="contact-info fade-in-left">
            <div className="info-item">
              <h3>📍 Address</h3>
              <p>Shenton Way, Singapore<br />#23-01 Singapore 068805</p>
            </div>
            {/* <div className="info-item">
              <h3>📞 Phone</h3>
              <p>+1 (555) 123-4567</p>
            </div> */}
            <div className="info-item">
              <h3>✉️ Email</h3>
              <p>regtech@enigmatig.com</p>
            </div>
            <div className="info-item">
              <h3>🕐 Hours</h3>
              <p>Monday - Friday: 8AM - 7PM<br />Saturday - Sunday: Closed</p>
            </div>
          </div>

          <form ref={formRef} className="contact-form fade-in-right" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
