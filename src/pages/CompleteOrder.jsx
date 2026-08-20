import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { API_BASE_URL } from '../config';
import { AuthValidationByTokenAndGuestAccountID } from '../utils/auth';
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
    country: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeError, setReferralCodeError] = useState('');
  const [isCheckingReferralCode, setIsCheckingReferralCode] = useState(false);
  const [isReferralCodeValid, setIsReferralCodeValid] = useState(false);
  const [referralCodeSuccessMessage, setReferralCodeSuccessMessage] = useState('');
  const [showReferralCodeField, setShowReferralCodeField] = useState(false);
  const [finalPrice, setFinalPrice] = useState(null);
  const hasValidated = useRef(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    return phoneRegex.test(phone);
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

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must include country code (e.g., +1234567890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (hasValidated.current) return;
    
    const validateAuth = async () => {
      const userInfo = localStorage.getItem('_userLoggedInInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        if (parsed.guest_account_id && parsed.token) {
          hasValidated.current = true;
          await AuthValidationByTokenAndGuestAccountID(parsed.token, parsed.guest_account_id);
          window.dispatchEvent(new Event('storage'));
        }
      }
    };
    validateAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch service data
        const serviceResponse = await fetch(`${API_BASE_URL}/service-prices/${serviceId}`);
        if (!serviceResponse.ok) {
          throw new Error(`Failed to fetch service data: ${serviceResponse.status}`);
        }
        const service = await serviceResponse.json();
        setServiceData(service);

        // Check if service has discount_category == 2
        const hasCategory2Discount = service.discounts && 
          Array.isArray(service.discounts) && 
          service.discounts.some(discount => discount.discount_category === 2);
        setShowReferralCodeField(hasCategory2Discount);

        // Fetch countries
        const countriesResponse = await fetch(`${API_BASE_URL}/countries`);
        if (!countriesResponse.ok) {
          throw new Error(`Failed to fetch countries: ${countriesResponse.status}`);
        }
        const countriesData = await countriesResponse.json();
        setCountries(countriesData);
        
        // Auto-fill form from localStorage if user is logged in
        const userInfo = localStorage.getItem('_userLoggedInInfo');
        if (userInfo) {
          const parsedUserInfo = JSON.parse(userInfo);
          if (parsedUserInfo.guest_account) {
            setIsLoggedIn(true);
            setFormData(prev => ({
              ...prev,
              email: parsedUserInfo.email || prev.email,
              firstName: parsedUserInfo.guest_account.first_name || prev.firstName,
              lastName: parsedUserInfo.guest_account.last_name || prev.lastName,
              companyName: parsedUserInfo.guest_account.company_name || prev.companyName,
              country: parsedUserInfo.guest_account.country_id || prev.country,
              phone: parsedUserInfo.guest_account.phone || prev.phone
            }));
            
            // Fetch referral code if user is logged in
            try {
              const referralResponse = await fetch(`${API_BASE_URL}/get-referral-code`, {
                headers: {
                  'Authorization': `Bearer ${parsedUserInfo.token}`
                }
              });
              if (referralResponse.ok) {
                const referralData = await referralResponse.json();
                if (referralData.referred_by && referralData.referred_by.trim()) {
                  setReferralCode(referralData.referred_by);
                }
              }
            } catch (err) {
              console.error('Error fetching referral code:', err);
            }
          }
        }
        
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

  const handleReferralCodeChange = (e) => {
    const { value } = e.target;
    setReferralCode(value);
    setReferralCodeError('');
    setIsReferralCodeValid(false);
  };

  const handleCheckReferralCode = async () => {
    if (!referralCode.trim()) {
      setReferralCodeError('Referral code is required');
      return;
    }

    // Validate mandatory fields
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

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must include country code (e.g., +1234567890)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setReferralCodeError('Please fill in all mandatory fields first');
      return;
    }

    try {
      setIsCheckingReferralCode(true);
      
      // Get discount_id from category 2 discount
      let discountId = null;
      if (serviceData && serviceData.discounts && Array.isArray(serviceData.discounts)) {
        const category2Discount = serviceData.discounts.find(discount => discount.discount_category === 2);
        if (category2Discount) {
          discountId = category2Discount.discount_id;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/guest-account/validate-referral-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          referral_code: referralCode,
          service_id: serviceId,
          discount_id: discountId
        })
      });

      const data = await response.json();

      if (data.status === 'Valid') {
        setIsReferralCodeValid(true);
        setReferralCodeError('');
        setReferralCodeSuccessMessage(data.message || 'Referral code is valid');
        
        // Calculate final price based on category 2 discount
        if (serviceData && serviceData.discounts && Array.isArray(serviceData.discounts)) {
          const category2Discount = serviceData.discounts.find(discount => discount.discount_category === 2);
          if (category2Discount) {
            const originalPrice = parseFloat(serviceData.price);
            let calculatedFinalPrice = originalPrice;
            
            if (category2Discount.discount_type === 1) {
              // Percentage discount
              calculatedFinalPrice = originalPrice - (category2Discount.discount_value / 100 * originalPrice);
            } else if (category2Discount.discount_type === 2) {
              // Fixed amount discount
              calculatedFinalPrice = originalPrice - category2Discount.discount_value;
            }
            
            setFinalPrice(calculatedFinalPrice);
          }
        }
      } else if (data.status === 'Invalid') {
        setReferralCodeError(data.message || 'Invalid referral code');
        setIsReferralCodeValid(false);
        setReferralCodeSuccessMessage('');
        setFinalPrice(null);
      } else {
        setReferralCodeError('Unexpected response from server');
        setIsReferralCodeValid(false);
        setReferralCodeSuccessMessage('');
        setFinalPrice(null);
      }
    } catch (err) {
      console.error('Error validating referral code:', err);
      setReferralCodeError('Error validating referral code');
      setIsReferralCodeValid(false);
      setReferralCodeSuccessMessage('');
      setFinalPrice(null);
    } finally {
      setIsCheckingReferralCode(false);
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

      // Get discount_id from category 2 discount
      let discountId = null;
      if (serviceData && serviceData.discounts && Array.isArray(serviceData.discounts)) {
        const category2Discount = serviceData.discounts.find(discount => discount.discount_category === 2);
        if (category2Discount) {
          discountId = category2Discount.discount_id;
        }
      }

      const res = await fetch(`${API_BASE_URL}/checkout/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName.trim() || null,
          country_id: formData.country,
          phone: formData.phone,
          service_id: serviceId,
          price: priceValue ?? 0,
          currency_id: currencyId,
          currency_code: currencyCode,
          cancel_url: cancelUrl,
          success_url: successUrl,
          referral_code: referralCode || null,
          discount_id: discountId || null
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
    <>
      <Navbar />
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
              <p className="service-price" style={finalPrice ? { textDecoration: 'line-through' } : {}}>
                {serviceData.currency_code}
                {serviceData.currency_symbol}
                {parseFloat(serviceData.price).toFixed(2)}
              </p>
              {finalPrice && (
                <p className="final-price-display">
                  {serviceData.currency_code}
                  {serviceData.currency_symbol}
                  {finalPrice.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email <span className="required-asterisk">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'input-error' : ''}
              readOnly={isLoggedIn}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name <span className="required-asterisk">*</span></label>
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
              <label htmlFor="lastName">Last Name <span className="required-asterisk">*</span></label>
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
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your Company Name (Optional)"
              className={errors.companyName ? 'input-error' : ''}
            />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="country">Country <span className="required-asterisk">*</span></label>
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

          <div className="form-group">
            <label htmlFor="phone">Phone <span className="required-asterisk">*</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {showReferralCodeField && (
            <div className="form-group">
              <label htmlFor="referralCode">Referral Code (Optional)</label>
              <div className="referral-code-input-group">
                <input
                  type="text"
                  id="referralCode"
                  value={referralCode}
                  onChange={handleReferralCodeChange}
                  placeholder="Enter referral code"
                  className={referralCodeError ? 'input-error' : isReferralCodeValid ? 'input-success' : ''}
                />
                <button
                  type="button"
                  className="check-referral-btn"
                  onClick={handleCheckReferralCode}
                  disabled={!referralCode.trim() || isReferralCodeValid || isCheckingReferralCode}
                >
                  {isCheckingReferralCode ? 'Checking...' : 'Check'}
                </button>
              </div>
              {referralCodeError && <span className="error-message">{referralCodeError}</span>}
              {isReferralCodeValid && <span className="success-message">{referralCodeSuccessMessage}</span>}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={referralCode.trim() && !isReferralCodeValid}>Complete Order</button>
        </form>

        {showConfirmation && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Confirm Your Order</h2>
              <div className="confirmation-details">
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                {formData.companyName.trim() && <p><strong>Company:</strong> {formData.companyName}</p>}
                <p><strong>Service:</strong> {serviceData?.service_name}</p>
                {finalPrice ? (
                  <>
                    <p><strong>Original Price:</strong> <span style={{ textDecoration: 'line-through' }}>{serviceData?.currency_code}{serviceData?.currency_symbol}{parseFloat(serviceData?.price || 0).toFixed(2)}</span></p>
                    {referralCode && isReferralCodeValid && <p><strong>Referral Code:</strong> {referralCode}</p>}
                    <p><strong>Final Price:</strong> {serviceData?.currency_code}{serviceData?.currency_symbol}{finalPrice.toFixed(2)}</p>
                  </>
                ) : (
                  <p><strong>Price:</strong> {serviceData?.currency_code}{serviceData?.currency_symbol}{parseFloat(serviceData?.price || 0).toFixed(2)}</p>
                )}
              </div>
              <div className="modal-buttons">
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                <button className="btn-proceed" onClick={handleProceed} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
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
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default CompleteOrder;
