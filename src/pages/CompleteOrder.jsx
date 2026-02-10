import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/CompleteOrder.css';

const CompleteOrder = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    country: ''
  });
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch service data
        const serviceResponse = await fetch(`https://ht8c7p7tt4.execute-api.us-east-1.amazonaws.com/dev/service-prices/${serviceId}`);
        if (!serviceResponse.ok) {
          throw new Error(`Failed to fetch service data: ${serviceResponse.status}`);
        }
        const service = await serviceResponse.json();
        console.log('Service data:', service); // Debug log to see all available fields
        setServiceData(service);

        // Fetch countries
        const countriesResponse = await fetch('https://ht8c7p7tt4.execute-api.us-east-1.amazonaws.com/dev/countries');
        if (!countriesResponse.ok) {
          throw new Error(`Failed to fetch countries: ${countriesResponse.status}`);
        }
        const countriesData = await countriesResponse.json();
        setCountries(countriesData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleProceed = async () => {
    try {
      setIsProcessing(true);

      const cancelUrl = window.location.href;
      const successUrl = window.location.origin + '/payment-success/?ordercode=';

      const priceValue = serviceData ? parseFloat(serviceData.price) : 0;
      const currencyId = serviceData?.currency || '';
      const currencyCode = serviceData?.currency_code || '';

      console.log('Checkout data:', {
        currencyId,
        currencyCode,
        priceValue,
        serviceData
      }); // Debug log

      const res = await fetch('https://ht8c7p7tt4.execute-api.us-east-1.amazonaws.com/dev/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName,
          country_id: formData.country,
          service_id: serviceId,
          price: priceValue ?? 0,
          currency_id: currencyId,
          currency_code: currencyCode,
          cancel_url: cancelUrl,
          success_url: successUrl,
        }),
      });

      const data = await res.json();
      
      if (data.status_code === 200 && data.checkout_url) {
        // Redirect to checkout URL
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data.message || 'Failed to initiate checkout');
      }
    } catch (err) {
      console.error('Error processing order:', err);
      alert('Error processing order: ' + err.message);
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="complete-order-container">
        <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="complete-order-container">
        <p style={{ textAlign: 'center', color: '#d32f2f' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="complete-order-page">
      <div className="complete-order-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        
        <div className="order-header">
          <h1>Complete Your Order</h1>
          {serviceData && (
            <div className="service-summary">
              <h2>{serviceData.service_name}</h2>
              <p className="service-price">
                {serviceData.currency_code}
                {serviceData.currency_symbol}
                {parseFloat(serviceData.price).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={errors.firstName ? 'input-error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={errors.lastName ? 'input-error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your Company Name"
              className={errors.companyName ? 'input-error' : ''}
            />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={errors.country ? 'input-error' : ''}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.country_id} value={country.country_id}>
                  {country.country_name}
                </option>
              ))}
            </select>
            {errors.country && <span className="error-message">{errors.country}</span>}
          </div>

          <button type="submit" className="submit-btn">Complete Order</button>
        </form>

        {showConfirmation && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Confirm Your Order</h2>
              <div className="confirmation-details">
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Company:</strong> {formData.companyName}</p>
                {serviceData && <p><strong>Service:</strong> {serviceData.service_name}</p>}
                {serviceData && (
                  <p><strong>Price:</strong> {serviceData.currency_code}{serviceData.currency_symbol}{parseFloat(serviceData.price).toFixed(2)}</p>
                )}
              </div>
              <div className="modal-buttons">
                <button className="btn-cancel" onClick={handleCancel} disabled={isProcessing}>Cancel</button>
                <button className="btn-proceed" onClick={handleProceed} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Proceed'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="modal-overlay loading-overlay">
            <div className="loading-modal">
              <div className="spinner"></div>
              <h2>Processing Your Order</h2>
              <p>Please wait while we prepare your checkout...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteOrder;
