import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const refFromUrl = searchParams.get('ref') || '';

  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    companyName: '',
    referralCode: refFromUrl
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('referralCode');
    };
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/countries`)
      .then(r => r.ok ? r.json() : [])
      .then(setCountries)
      .catch(() => {});
    
    const refParam = searchParams.get('ref');
    if (refParam) {
      sessionStorage.setItem('referralCode', refParam);
      window.history.replaceState({}, document.title, '/register/');
    } else {
      const storedRef = sessionStorage.getItem('referralCode');
      if (storedRef) {
        setFormData(prev => ({ ...prev, referralCode: storedRef }));
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errs.email = 'Please enter a valid email address';
    if (!formData.firstName.trim()) errs.firstName = 'First Name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last Name is required';
    if (!formData.country) errs.country = 'Country is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\+\d{1,3}\d{6,14}$/.test(formData.phone.trim())) errs.phone = 'Phone must include country code (e.g., +1234567890)';
    if (!formData.companyName.trim()) errs.companyName = 'Company Name is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/auth/register-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          country_id: formData.country,
          phone: formData.phone.trim(),
          company_name: formData.companyName.trim(),
          referral_code: formData.referralCode.trim() || null
        })
      });
      const data = await response.json();
      if (response.ok && data.message === 'success') {
        sessionStorage.removeItem('referralCode');
        showToast('Account created! Please sign in.', 'success');
        navigate('/');
      } else {
        if (data && data.message && (response.status === 404 || /referral/i.test(data.message))) {
          setErrors({ referralCode: data.message });
        } else {
          setErrors({ email: data.message || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ email: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>Create an Account</h1>
          <p>Join us today and get started</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <label>Email <span className="required-asterisk">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="register-form-row">
            <div className="register-form-group">
              <label>First Name <span className="required-asterisk">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className={errors.firstName ? 'input-error' : ''} />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="register-form-group">
              <label>Last Name <span className="required-asterisk">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className={errors.lastName ? 'input-error' : ''} />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          <div className="register-form-row">
            <div className="register-form-group">
              <label>Country <span className="required-asterisk">*</span></label>
              <select name="country" value={formData.country} onChange={handleChange} className={errors.country ? 'input-error' : ''}>
                <option value="">Select a country</option>
                {countries.map(c => <option key={c.country_id} value={c.country_id}>{c.country_name}</option>)}
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
            <div className="register-form-group">
              <label>Phone <span className="required-asterisk">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" className={errors.phone ? 'input-error' : ''} />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>
          <div className="register-form-group">
            <label>Company Name <span className="required-asterisk">*</span></label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your company name" className={errors.companyName ? 'input-error' : ''} />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>
          <div className="register-form-group">
            <label>
              Referral Code{' '}
              {formData.referralCode
                ? <span className="referral-applied-label">🎁 Applied from a shared link</span>
                : <span className="optional-label">(Optional)</span>
              }
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Enter referral code if you have one"
              readOnly={!!formData.referralCode}
              className={`${formData.referralCode ? 'input-readonly' : ''} ${errors.referralCode ? 'input-error' : ''}`.trim()}
            />
            {errors.referralCode && <span className="error-message">{errors.referralCode}</span>}
          </div>
          <button type="submit" className="register-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
          <p className="register-signin-prompt">Already have an account? <a className="register-link" onClick={() => navigate('/')}>Sign in</a></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
