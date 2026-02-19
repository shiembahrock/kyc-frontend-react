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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
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

  const handleSaveProfile = () => {
    console.log('Profile data:', profileData);
    alert('Profile saved successfully!');
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
                          <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} />
                        </div>
                        <div className="profile-form-group">
                          <label>Last Name</label>
                          <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} />
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>Country</label>
                          <input type="text" name="country" value={profileData.country} onChange={handleProfileChange} />
                        </div>
                        <div className="profile-form-group">
                          <label>Phone</label>
                          <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>Company Name</label>
                          <input type="text" name="companyName" value={profileData.companyName} onChange={handleProfileChange} />
                        </div>
                        <div className="profile-form-group">
                          <label>Address</label>
                          <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} />
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label>City</label>
                          <input type="text" name="city" value={profileData.city} onChange={handleProfileChange} />
                        </div>
                        <div className="profile-form-group">
                          <label>ZIP/Postal Code</label>
                          <input type="text" name="zipCode" value={profileData.zipCode} onChange={handleProfileChange} />
                        </div>
                      </div>

                      <div className="profile-form-actions">
                        <button className="save-profile-btn" onClick={handleSaveProfile}>Save</button>
                      </div>
                    </div>
                  )}
                  {activeMenu === 'Notifications' && <p>No notifications</p>}
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
