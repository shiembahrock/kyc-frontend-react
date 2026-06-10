import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { API_EXTERNAL_BASE_URL, ADMINISTRATOR_EMAIL_ADDRESS } from '../config';
import '../styles/ContactUs.css';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.warn('reCAPTCHA site key is not configured. Add VITE_RECAPTCHA_SITE_KEY to .env file');
}

const ContactUs = () => {
  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const recaptchaRef = useRef(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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

    return () => observer.disconnect();
  }, []);

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
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number with country code (e.g., +1234567890)';
    }
    if (!formData.message.trim()) errors.message = 'Message is required';
    
    return errors;
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleBackClick = () => {
    setShowCaptcha(false);
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1: Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Step 2: Show captcha if form is valid
    if (!showCaptcha) {
      setShowCaptcha(true);
      setFormErrors({});
      return;
    }
    
    // Step 3: Verify captcha token exists before submitting
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const emailBody = `Name: ${formData.name}<br/>Email: ${formData.email}<br/>Phone: ${formData.phone}<br/>Message:<br/>${formData.message}`;
      
      const payload = {
        to_email: ADMINISTRATOR_EMAIL_ADDRESS,
        subject: 'KYC&AML - ContactUs',
        body: emailBody,
        is_html: true,
        recaptcha_token: captchaToken
      };
      
      const response = await fetch(`${API_EXTERNAL_BASE_URL}/submitcontactus`, {
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
      setFormErrors({});
      setShowCaptcha(false);
      setCaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
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
              <a href="https://maps.app.goo.gl/vW6L42WrDiUUHjAa8" target="_blank" className="social-link">                
                16 Raffles Quay #30-01 Hong Leong Building Singapore 048581
              </a>
            </div>
            <div className="info-item">
              <h3>✉️ Email</h3>
              <a href="mailto:regtech@enigmatig.com">regtech@enigmatig.com</a>
            </div>
            <div className="info-item">
              <h3>🕐 Hours</h3>
              <p>Monday - Friday: 8AM - 7PM<br />Saturday - Sunday: Closed</p>
            </div>
          </div>

          {!showCaptcha ? (
            <form className="contact-form fade-in-right" onSubmit={handleSubmit} style={{ animation: 'fadeInRight 1s ease forwards' }}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={isReadOnly.name}
                  className={formErrors.name ? 'error' : ''}
                  required
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
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
                  className={formErrors.email ? 'error' : ''}
                  required
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
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
                  className={formErrors.phone ? 'error' : ''}
                  readOnly={isReadOnly.phone}
                  required
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
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
                  className={formErrors.message ? 'error' : ''}
                  required
                ></textarea>
                {formErrors.message && <span className="error-message">{formErrors.message}</span>}
              </div>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                Send Message
              </button>
            </form>
          ) : (
            <div className="captcha-wrapper-outer">
              <div className="captcha-content">
                <h3>Verify you're human</h3>
                <p>Please complete the reCAPTCHA below to send your message</p>
                <div className="recaptcha-wrapper">
                  {RECAPTCHA_SITE_KEY ? (
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={handleCaptchaChange}
                    />
                  ) : (
                    <p style={{ color: '#dc3545' }}>Error: reCAPTCHA site key not configured</p>
                  )}
                </div>
                <div className="captcha-buttons">
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !captchaToken}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    className="btn-back"
                    onClick={handleBackClick}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
