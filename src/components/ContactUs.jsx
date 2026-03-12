import React, { useState, useEffect, useRef } from 'react';
import { API_EXTERNAL_BASE_URL, ADMINISTRATOR_EMAIL_ADDRESS } from '../config';
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
  const [isReadOnly, setIsReadOnly] = useState({
    name: false,
    email: false,
    phone: false
  });
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const updateFormData = () => {
      const userInfo = localStorage.getItem('_userLoggedInInfo');
      if (userInfo) {
        try {
          const parsedInfo = JSON.parse(userInfo);
          const newFormData = { name: '', email: '', phone: '', message: '' };
          const newReadOnly = { name: false, email: false, phone: false };
          
          if (parsedInfo.email) {
            newFormData.email = parsedInfo.email;
            newReadOnly.email = true;
          }
          
          if (parsedInfo.guest_account) {
            const { first_name, last_name, phone } = parsedInfo.guest_account;
            
            if (first_name && last_name) {
              newFormData.name = `${first_name} ${last_name}`;
              newReadOnly.name = true;
            }
            
            if (phone) {
              newFormData.phone = phone;
              newReadOnly.phone = true;
            }
          }
          
          setFormData(prev => ({ ...prev, ...newFormData }));
          setIsReadOnly(newReadOnly);
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
    };

    updateFormData();
    window.addEventListener('storage', updateFormData);
    return () => window.removeEventListener('storage', updateFormData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'phone') {
      setPhoneError('');
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const emailBody = `Name: ${formData.name}<br/>Email: ${formData.email}<br/>Phone: ${formData.phone}<br/>Message:<br/>${formData.message}`;
      
      const payload = {
        to_email: ADMINISTRATOR_EMAIL_ADDRESS,
        subject: 'KYC&AML - ContactUs',
        body: emailBody,
        is_html: true
      };
      
      const response = await fetch(`${API_EXTERNAL_BASE_URL}/sendemailsmtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setPhoneError('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <h2 ref={titleRef} className="bounce-in">Contact Us</h2>
        <div className="contact-content">
          <div ref={infoRef} className="contact-info fade-in-left">
            <div className="info-item">
              <h3>📍 Address</h3>
              {/* <p>Shenton Way, Singapore<br />#23-01 Singapore 068805</p> */}
              <a href="https://maps.app.goo.gl/vW6L42WrDiUUHjAa8" target="_blank" className="social-link">                
                16 Raffles Quay #30-01 Hong Leong Building Singapore 048581
              </a>
            </div>
            {/* <div className="info-item">
              <h3>📞 Phone</h3>
              <p>+1 (555) 123-4567</p>
            </div> */}
            <div className="info-item">
              <h3>✉️ Email</h3>
              <a href="mailto:regtech@enigmatig.com">regtech@enigmatig.com</a>
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
                readOnly={isReadOnly.name}
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
                readOnly={isReadOnly.email}
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
                placeholder="+1234567890"
                className={phoneError ? 'error' : ''}
                readOnly={isReadOnly.phone}
                required
              />
              {phoneError && <span className="error-message">{phoneError}</span>}
              <small className="input-hint">Format: +[country code][number] (e.g., +6512345678, +14155551234)</small>
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
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
