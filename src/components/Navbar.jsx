import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Profile');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    zipCode: '',
    profileImage: null
  });
  const [profileErrors, setProfileErrors] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    companyName: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email_promotion_subscription: false,
    email_system_messages: false,
    phone_promotion_subscription: false,
    sms_system_messages: false
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
      document.documentElement.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
    }
  }, []);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('_userLoggedInInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    
    // Fetch countries
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/countries`);
        if (response.ok) {
          const data = await response.json();
          setCountries(data);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    let timer;
    if (showOtpModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, countdown]);

  const menuItems = [
    { id: 'home', label: 'Home', section: 'banner' },
    { id: 'product', label: 'Enigmatig Regtech Product', section: 'about' },
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

  const handleUserIconClick = () => {
    const userInfo = localStorage.getItem('_userLoggedInInfo');
    if (!userInfo) {
      setShowLoginModal(true);
    } else {
      const parsedUserInfo = JSON.parse(userInfo);
      if (parsedUserInfo.guest_account) {
        setProfileData({
          firstName: parsedUserInfo.guest_account.first_name || '',
          lastName: parsedUserInfo.guest_account.last_name || '',
          country: parsedUserInfo.guest_account.country_id || '',
          phone: parsedUserInfo.guest_account.phone || '',
          companyName: parsedUserInfo.guest_account.company_name || '',
          address: parsedUserInfo.guest_account.address || '',
          city: parsedUserInfo.guest_account.city || '',
          zipCode: parsedUserInfo.guest_account.zip_code || '',
          profileImage: parsedUserInfo.guest_account.profile_image || null
        });
      }
      if (parsedUserInfo.guest_account_notification_setting) {
        setNotificationSettings({
          email_promotion_subscription: parsedUserInfo.guest_account_notification_setting.email_promotion_subscription || false,
          email_system_messages: parsedUserInfo.guest_account_notification_setting.email_system_messages || false,
          phone_promotion_subscription: parsedUserInfo.guest_account_notification_setting.phone_promotion_subscription || false,
          sms_system_messages: parsedUserInfo.guest_account_notification_setting.sms_system_messages || false
        });
      }
      setShowUserModal(true);
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setActiveMenu('Profile');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('_userLoggedInInfo');
    setUserInfo(null);
    setShowUserModal(false);
    setShowLogoutModal(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const userMenuItems = [
    { name: 'Profile', icon: '👤' },
    { name: 'Notifications', icon: '🔔' },
    { name: 'Orders', icon: '📦' },
    { name: 'Search Histories', icon: '🔍' },
    { name: 'Logout', icon: '🚪' }
  ];

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowOtpModal(false);
    setEmail('');
    setEmailError('');
    setOtp('');
    setOtpError('');
    setCountdown(300);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/auth/email-get-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: trimmedEmail,
          is_from_login: true 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      const data = await response.json();
      
      sessionStorage.setItem('temp_guest_account_id', data.guest_account_id);
      
      setShowLoginModal(false);
      setShowOtpModal(true);
      setCountdown(300);
    } catch (error) {
      console.error('Error:', error);
      setEmailError('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedOtp = otp.trim();
    
    if (!trimmedOtp) {
      setOtpError('OTP code is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/submit-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.trim(),
          otp: trimmedOtp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'The code is incorrect. Please check your email.');
        return;
      }
      
      const guestAccountId = sessionStorage.getItem('temp_guest_account_id');
      
      const updatedUserInfo = {
        email: email.trim(),
        guest_account_id: guestAccountId,
        token: data.token,
        expiry_on: data.expiry_on
      };
      
      localStorage.setItem('_userLoggedInInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      
      sessionStorage.removeItem('temp_guest_account_id');
      
      // Fetch guest account profile
      await get_guest_account_profile(guestAccountId, data.token);
      
      alert('Login Success');
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      setOtpError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setCountdown(300);
    setOtpError('');
    
    try {
      const trimmedEmail = email.trim();
      await fetch(`${API_BASE_URL}/auth/email-get-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: trimmedEmail,
          is_from_login: true 
        })
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const get_guest_account_profile = async (guestAccountId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/guest-account/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountToken': token
        },
        body: JSON.stringify({ guest_account_id: guestAccountId })
      });

      if (response.status === 200) {
        const data = await response.json();
        const storedUserInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
        
        storedUserInfo.guest_account = data.guest_account;
        if (data.guest_account_notification_setting) {
          storedUserInfo.guest_account_notification_setting = data.guest_account_notification_setting;
        }
        
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(storedUserInfo));
        setUserInfo(storedUserInfo);
        
        // Populate profile form with guest account data
        if (data.guest_account) {
          setProfileData({
            firstName: data.guest_account.first_name || '',
            lastName: data.guest_account.last_name || '',
            country: data.guest_account.country_id || '',
            phone: data.guest_account.phone || '',
            companyName: data.guest_account.company_name || '',
            address: data.guest_account.address || '',
            city: data.guest_account.city || '',
            zipCode: data.guest_account.zip_code || '',
            profileImage: data.guest_account.profile_image || null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching guest account profile:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileData(prev => ({ ...prev, profileImage: null }));
  };

  const handleNotificationToggle = async (setting) => {
    const previousValue = notificationSettings[setting];
    const newValue = !previousValue;
    
    // Optimistically update UI
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: newValue
    }));

    const success = await update_guest_account_notification_settings(setting, newValue);
    
    // Revert if failed
    if (!success) {
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: previousValue
      }));
    }
  };

  const update_guest_account_notification_settings = async (columnName, columnValue) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      const payload = {
        guest_account_id: userInfo.guest_account_id,
        column_name: columnName,
        column_value: columnValue
      };

      const response = await fetch(`${API_BASE_URL}/guest-account/update-notification-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountToken': userInfo.token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.message === 'success') {
        if (!userInfo.guest_account_notification_setting) {
          userInfo.guest_account_notification_setting = {};
        }
        userInfo.guest_account_notification_setting[columnName] = columnValue;
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        return true;
      } else {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        return false;
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  };

  const handleSaveProfile = async () => {
    const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
    
    // Check if data has changed
    const hasChanges = 
      profileData.firstName !== (userInfo.guest_account?.first_name || '') ||
      profileData.lastName !== (userInfo.guest_account?.last_name || '') ||
      profileData.country !== (userInfo.guest_account?.country_id || '') ||
      profileData.phone !== (userInfo.guest_account?.phone || '') ||
      profileData.companyName !== (userInfo.guest_account?.company_name || '') ||
      profileData.address !== (userInfo.guest_account?.address || '') ||
      profileData.city !== (userInfo.guest_account?.city || '') ||
      profileData.zipCode !== (userInfo.guest_account?.zip_code || '');
    
    if (!hasChanges) {
      alert('Nothing changes on profile data!');
      return;
    }

    // Reset errors
    const errors = {
      firstName: '',
      lastName: '',
      country: '',
      phone: '',
      companyName: ''
    };
    
    let hasError = false;

    // Validation
    if (!profileData.firstName.trim()) {
      errors.firstName = 'First Name is required';
      hasError = true;
    }
    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last Name is required';
      hasError = true;
    }
    if (!profileData.country) {
      errors.country = 'Country is required';
      hasError = true;
    }
    if (!profileData.companyName.trim()) {
      errors.companyName = 'Company Name is required';
      hasError = true;
    }
    
    // Phone validation (optional but must be valid if filled)
    if (profileData.phone.trim()) {
      const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
      if (!phoneRegex.test(profileData.phone.trim())) {
        errors.phone = 'Phone must include country code (e.g., +1234567890)';
        hasError = true;
      }
    }

    if (hasError) {
      setProfileErrors(errors);
      return;
    }

    try {
      const payload = {
        guest_account_id: userInfo.guest_account_id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        country_id: profileData.country,
        phone: profileData.phone,
        company_name: profileData.companyName,
        address: profileData.address,
        city: profileData.city,
        zip_postal_code: profileData.zipCode
      };

      const response = await fetch(`${API_BASE_URL}/guest-account/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountToken': userInfo.token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.message === 'success') {
        userInfo.guest_account = {
          ...userInfo.guest_account,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          country_id: profileData.country,
          phone: profileData.phone,
          company_name: profileData.companyName,
          address: profileData.address,
          city: profileData.city,
          zip_code: profileData.zipCode
        };
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        alert('Profile saved successfully!');
      } else if (data.message === 'failed' || data.message === 'timeout') {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
            {userInfo ? (
              <div 
                className="user-avatar" 
                onClick={handleUserIconClick}
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {userInfo.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <a className="user-icon" onClick={handleUserIconClick}>👤</a>
            )}
          </li>
        </ul>
      </div>

      {showLoginModal && (
        <div className="login-modal-overlay" onClick={handleCloseModal}>
          <button className="close-button" onClick={handleCloseModal}>×</button>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Please enter your email</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  className={emailError ? 'input-error' : ''}
                />
                {emailError && <span className="error-message">{emailError}</span>}
              </div>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'SIGN IN OR CREATE AN ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="login-modal-overlay" onClick={handleCloseModal}>
          <button className="close-button" onClick={handleCloseModal}>×</button>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Please enter your code</h2>
            <p className="otp-description">
              An email containing your verification code has been sent to your inbox. Please enter the code to complete the login process.
            </p>
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError('');
                  }}
                  placeholder="Enter OTP code"
                  className={otpError ? 'input-error' : ''}
                />
                {otpError && <span className="error-message">{otpError}</span>}
              </div>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                <span className="button-icon">🔑</span>
                {isSubmitting ? 'Processing...' : 'Login'}
              </button>
              <p className="resend-text">
                Did not get the code by email? {countdown > 0 ? (
                  `Please wait ${formatTime(countdown)} to resend the code`
                ) : (
                  <a onClick={handleResend} className="resend-link">Resend</a>
                )}
              </p>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="user-modal-overlay" onClick={handleCloseUserModal}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseUserModal}>×</button>
            <div className="user-modal-content">
              <div className="user-modal-sidebar">
                <ul className="user-menu-list">
                  {userMenuItems.map((menu) => (
                    <li 
                      key={menu.name}
                      className={activeMenu === menu.name ? 'active' : ''}
                      onClick={() => menu.name === 'Logout' ? handleLogout() : setActiveMenu(menu.name)}
                    >
                      <span className="menu-icon">{menu.icon}</span>
                      <span className="menu-text">{menu.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="user-modal-main">
                <h2>{activeMenu}</h2>
                <div className="user-modal-content-area">
                  {activeMenu === 'Profile' && (
                    <div className="profile-form">
                      <h3 className="profile-greeting">Hi, <strong>{userInfo?.email}</strong></h3>
                      
                      <div className="profile-image-section">
                        <div className="profile-image-container">
                          <div className="profile-image">
                            {profileData.profileImage ? (
                              <img src={profileData.profileImage} alt="Profile" />
                            ) : (
                              <div className="profile-placeholder">{userInfo?.email.charAt(0).toUpperCase()}</div>
                            )}
                            {profileData.profileImage && (
                              <button className="remove-image-btn" onClick={handleRemoveImage}>×</button>
                            )}
                          </div>
                        </div>
                        <div className="upload-section">
                          <input 
                            type="file" 
                            id="profileImage" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="profileImage" className="upload-btn">Upload Image</label>
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>First Name</label>
                          <input 
                            type="text" 
                            name="firstName" 
                            value={profileData.firstName} 
                            onChange={handleProfileChange} 
                            className="profile-input-field"
                          />
                          {profileErrors.firstName && <span className="error-message">{profileErrors.firstName}</span>}
                        </div>
                        <div className="profile-form-group">
                          <label>Last Name</label>
                          <input 
                            type="text" 
                            name="lastName" 
                            value={profileData.lastName} 
                            onChange={handleProfileChange}
                            className="profile-input-field"
                          />
                          {profileErrors.lastName && <span className="error-message">{profileErrors.lastName}</span>}
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>Country</label>
                          <select 
                            name="country" 
                            value={profileData.country} 
                            onChange={handleProfileChange}
                            className="profile-select-field"
                          >
                            <option value="">Select a country</option>
                            {countries.map(country => (
                              <option key={country.country_id} value={country.country_id}>
                                {country.country_name}
                              </option>
                            ))}
                          </select>
                          {profileErrors.country && <span className="error-message">{profileErrors.country}</span>}
                        </div>
                        <div className="profile-form-group">
                          <label>Phone</label>
                          <input 
                            type="tel" 
                            name="phone" 
                            value={profileData.phone} 
                            onChange={handleProfileChange}
                            className="profile-input-field"
                          />
                          {profileErrors.phone && <span className="error-message">{profileErrors.phone}</span>}
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>Company Name</label>
                          <input 
                            type="text" 
                            name="companyName" 
                            value={profileData.companyName} 
                            onChange={handleProfileChange}
                            className="profile-input-field"
                          />
                          {profileErrors.companyName && <span className="error-message">{profileErrors.companyName}</span>}
                        </div>
                        <div className="profile-form-group">
                          <label>Address</label>
                          <input 
                            type="text" 
                            name="address" 
                            value={profileData.address} 
                            onChange={handleProfileChange}
                            className="profile-input-field"
                          />
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>City</label>
                          <input 
                            type="text" 
                            name="city" 
                            value={profileData.city} 
                            onChange={handleProfileChange}
                            className="profile-input-field"
                          />
                        </div>
                        <div className="profile-form-group">
                          <label>ZIP/Postal Code</label>
                          <input 
                            type="text" 
                            name="zipCode" 
                            value={profileData.zipCode} 
                            onChange={handleProfileChange}
                            className="profile-input-field"
                          />
                        </div>
                      </div>

                      <div className="profile-form-actions">
                        <button className="save-profile-btn" onClick={handleSaveProfile}>Save</button>
                      </div>
                    </div>
                  )}
                  {activeMenu === 'Notifications' && (
                    <div className="notifications-content">
                      <div className="notification-item">
                        <span>Email Promotion Subscription</span>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.email_promotion_subscription}
                            onChange={() => handleNotificationToggle('email_promotion_subscription')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <span>Email System Messages</span>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.email_system_messages}
                            onChange={() => handleNotificationToggle('email_system_messages')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <span>Phone Promotion Subscription</span>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.phone_promotion_subscription}
                            onChange={() => handleNotificationToggle('phone_promotion_subscription')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <span>SMS System Messages</span>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.sms_system_messages}
                            onChange={() => handleNotificationToggle('sms_system_messages')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  )}
                  {activeMenu === 'Orders' && <p>No orders yet</p>}
                  {activeMenu === 'Search Histories' && <p>No search history</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="login-modal-overlay" onClick={cancelLogout}>
          <div className="login-modal logout-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Logout</h2>
            <p className="logout-message">Are you sure you want to logout?</p>
            <div className="logout-actions">
              <button className="cancel-btn" onClick={cancelLogout}>Cancel</button>
              <button className="confirm-btn" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
