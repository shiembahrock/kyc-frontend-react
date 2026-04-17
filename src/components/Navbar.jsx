import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import { API_BASE_URL } from '../config';
import '../styles/Navbar.css';

const Navbar = ({ showLoginModal: externalShowLoginModal, setShowLoginModal: externalSetShowLoginModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(externalShowLoginModal || false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const { setIsModalOpen } = useModal();
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
  const [ordersData, setOrdersData] = useState({
    data_list: [],
    total_count: 0,
    current_page_number: 1,
    is_has_more: false
  });
  const [ordersPagination, setOrdersPagination] = useState({
    page_size: 5,
    page_number: 1,
    sort_by: 'transaction_date',
    is_desc: true
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchHistoriesData, setSearchHistoriesData] = useState({
    data_list: [],
    total_count: 0,
    current_page_number: 1,
    is_has_more: false
  });
  const [searchHistoriesPagination, setSearchHistoriesPagination] = useState({
    page_size: 5,
    page_number: 1,
    sort_by: 'completed_time',
    is_desc: true
  });
  const [isLoadingSearchHistories, setIsLoadingSearchHistories] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [referredById, setReferredById] = useState('');
  const [applyReferralInput, setApplyReferralInput] = useState('');
  const [applyReferralError, setApplyReferralError] = useState('');
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [referredUsersData, setReferredUsersData] = useState({ data_list: [], total_count: 0, current_page_number: 1, is_has_more: false });
  const [referredUsersPagination, setReferredUsersPagination] = useState({ page_size: 5, page_number: 1, sort_by: 'created_at', is_desc: true });
  const [isLoadingReferredUsers, setIsLoadingReferredUsers] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isLoadingReferralCode, setIsLoadingReferralCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (externalShowLoginModal !== undefined) {
      setShowLoginModal(externalShowLoginModal);
    }
  }, [externalShowLoginModal]);

  useEffect(() => {
    if (externalSetShowLoginModal) {
      externalSetShowLoginModal(showLoginModal);
    }
  }, [showLoginModal, externalSetShowLoginModal]);

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
    
    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedUserInfo = localStorage.getItem('_userLoggedInInfo');
      if (updatedUserInfo) {
        setUserInfo(JSON.parse(updatedUserInfo));
      } else {
        setUserInfo(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
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
    
    return () => window.removeEventListener('storage', handleStorageChange);
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
      setIsModalOpen(true);
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
      setIsModalOpen(true);
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setActiveMenu('Profile');
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('_userLoggedInInfo');
    setUserInfo(null);
    setShowUserModal(false);
    setShowLogoutModal(false);
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const userMenuItems = [
    { name: 'Profile', icon: '👤' },
    { name: 'Notifications', icon: '🔔' },
    { name: 'Referrals', icon: '🎁' },
    { name: 'Orders', icon: '📦' },
    { name: 'Search Histories', icon: '🔍' },
    { name: 'Logout', icon: '🚪' }
  ];

  useEffect(() => {
    if (activeMenu === 'Orders' && showUserModal) {
      get_order_payments_by_guest_account(
        ordersPagination.page_size,
        ordersPagination.page_number,
        ordersPagination.sort_by,
        ordersPagination.is_desc
      );
    }
  }, [activeMenu, showUserModal, ordersPagination]);

  useEffect(() => {
    if (activeMenu === 'Search Histories' && showUserModal) {
      get_search_histories_by_guest_account_id(
        searchHistoriesPagination.page_size,
        searchHistoriesPagination.page_number,
        searchHistoriesPagination.sort_by,
        searchHistoriesPagination.is_desc
      );
    }
  }, [activeMenu, showUserModal, searchHistoriesPagination]);

  useEffect(() => {
    if (activeMenu === 'Referrals' && showUserModal) {
      get_referral_code();
    }
  }, [activeMenu, showUserModal]);

  useEffect(() => {
    if (activeMenu === 'Referrals' && showUserModal) {
      get_referred_users(
        referredUsersPagination.page_size,
        referredUsersPagination.page_number,
        referredUsersPagination.sort_by,
        referredUsersPagination.is_desc
      );
    }
  }, [activeMenu, showUserModal, referredUsersPagination]);

  const handlePageSizeChange = (e) => {
    setOrdersPagination(prev => ({
      ...prev,
      page_size: parseInt(e.target.value),
      page_number: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setOrdersPagination(prev => ({
      ...prev,
      page_number: newPage
    }));
  };

  const handleSortChange = (columnName) => {
    setOrdersPagination(prev => {
      const isSameColumn = prev.sort_by === columnName;
      return {
        ...prev,
        sort_by: columnName,
        is_desc: isSameColumn ? !prev.is_desc : true
      };
    });
  };

  const getSortIcon = (columnName) => {
    if (ordersPagination.sort_by !== columnName) {
      return '⇅';
    }
    return ordersPagination.is_desc ? '↓' : '↑';
  };

  const getTotalPages = () => {
    return Math.ceil(ordersData.total_count / ordersPagination.page_size);
  };

  const handleSearchHistoriesPageSizeChange = (e) => {
    setSearchHistoriesPagination(prev => ({
      ...prev,
      page_size: parseInt(e.target.value),
      page_number: 1
    }));
  };

  const handleSearchHistoriesPageChange = (newPage) => {
    setSearchHistoriesPagination(prev => ({
      ...prev,
      page_number: newPage
    }));
  };

  const handleSearchHistoriesSortChange = (columnName) => {
    setSearchHistoriesPagination(prev => {
      const isSameColumn = prev.sort_by === columnName;
      return {
        ...prev,
        sort_by: columnName,
        is_desc: isSameColumn ? !prev.is_desc : true
      };
    });
  };

  const getSearchHistoriesSortIcon = (columnName) => {
    if (searchHistoriesPagination.sort_by !== columnName) {
      return '⇅';
    }
    return searchHistoriesPagination.is_desc ? '↓' : '↑';
  };

  const getSearchHistoriesTotalPages = () => {
    return Math.ceil(searchHistoriesData.total_count / searchHistoriesPagination.page_size);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowOtpModal(false);
    setEmail('');
    setEmailError('');
    setOtp('');
    setOtpError('');
    setCountdown(300);
    setIsModalOpen(false);
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
      // const response = await fetch(`${API_BASE_URL}/auth/email-get-otp`, {
      const response = await fetch(`${API_BASE_URL}/auth/registered-email-get-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: trimmedEmail,
          is_from_login: true 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.message === 'email unregistered') {
          setEmailError('This email is not registered. Please sign up first.');
        } else {
          setEmailError(data.message || 'Failed to send OTP. Please try again.');
        }
        return;
      }
      
      sessionStorage.setItem('temp_guest_account_id', data.guest_account_id);
      
      setShowLoginModal(false);
      setShowOtpModal(true);
      setCountdown(300);
      setIsModalOpen(true);
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
      
      showToast('Login Success', 'success');
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

    setLoadingText('Save processing...');
    setIsProcessing(true);
    const success = await update_guest_account_notification_settings(setting, newValue);
    setIsProcessing(false);
    
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
        showToast('Notification settings updated', 'success');
        return true;
      } else {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        showToast('Failed to update notification settings', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showToast('Error updating notification settings', 'error');
      return false;
    }
  };

  const get_order_payments_by_guest_account = async (pageSize, pageNumber, sortBy = 'transaction_date', isDesc = true) => {
    try {
      setIsLoadingOrders(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      
      const response = await fetch(`${API_BASE_URL}/guest-account/order-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountToken': userInfo.token
        },
        body: JSON.stringify({
          guest_account_id: userInfo.guest_account_id,
          sort_by: sortBy,
          is_desc: isDesc,
          page_size: pageSize,
          page_number: pageNumber
        })
      });

      const data = await response.json();

      if (response.ok && data.token_expiry_on) {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        
        setOrdersData({
          data_list: data.data_list || [],
          total_count: data.total_count || 0,
          current_page_number: data.current_page_number || 1,
          is_has_more: data.is_has_more || false
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const get_search_histories_by_guest_account_id = async (pageSize, pageNumber, sortBy = 'completed_time', isDesc = true) => {
    try {
      setIsLoadingSearchHistories(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      
      const response = await fetch(`${API_BASE_URL}/guest-account/search-histories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountToken': userInfo.token
        },
        body: JSON.stringify({
          guest_account_id: userInfo.guest_account_id,
          sort_by: sortBy,
          is_desc: isDesc,
          page_size: pageSize,
          page_number: pageNumber
        })
      });

      const data = await response.json();

      if (response.ok && data.token_expiry_on) {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        
        setSearchHistoriesData({
          data_list: data.data_list || [],
          total_count: data.total_count || 0,
          current_page_number: data.current_page_number || 1,
          is_has_more: data.is_has_more || false
        });
      }
    } catch (error) {
      console.error('Error fetching search histories:', error);
      showToast('Failed to load search histories', 'error');
    } finally {
      setIsLoadingSearchHistories(false);
    }
  };

  const get_referral_code = async () => {
    try {
      setIsLoadingReferralCode(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      const response = await fetch(`${API_BASE_URL}/guest-account/get-referral-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'GuestAccountToken': userInfo.token },
        body: JSON.stringify({ guest_account_id: userInfo.guest_account_id })
      });
      const data = await response.json();
      if (response.ok) {
        setReferralCode(data.referral_code || '');
        setReferredBy(data.referred_by && data.referred_by_id ? data.referred_by : '');
        setReferredById(data.referred_by && data.referred_by_id ? data.referred_by_id : '');
        if (data.token_expiry_on) { userInfo.expiry_on = data.token_expiry_on; localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo)); }
      }
    } catch (error) { console.error('Error fetching referral code:', error); }
    finally { setIsLoadingReferralCode(false); }
  };

  const get_referred_users = async (pageSize, pageNumber, sortBy = 'created_at', isDesc = true) => {
    try {
      setIsLoadingReferredUsers(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      const response = await fetch(`${API_BASE_URL}/guest-account/referred-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'GuestAccountToken': userInfo.token },
        body: JSON.stringify({ guest_account_id: userInfo.guest_account_id, page_size: pageSize, page_number: pageNumber, sort_by: sortBy, is_desc: isDesc })
      });
      const data = await response.json();
      if (response.ok) {
        setReferredUsersData({
          data_list: data.data_list || [],
          total_count: data.total_count || 0,
          current_page_number: data.current_page_number || pageNumber,
          is_has_more: data.is_has_more || false
        });
        if (data.token_expiry_on) { userInfo.expiry_on = data.token_expiry_on; localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo)); }
      }
    } catch (error) { console.error('Error fetching referred users:', error); }
    finally { setIsLoadingReferredUsers(false); }
  };

  const handleReferredUsersPageSizeChange = (e) => {
    setReferredUsersPagination(prev => ({
      ...prev,
      page_size: parseInt(e.target.value),
      page_number: 1
    }));
  };

  const handleReferredUsersPageChange = (newPage) => {
    setReferredUsersPagination(prev => ({
      ...prev,
      page_number: newPage
    }));
  };

  const handleReferredUsersSortChange = (columnName) => {
    setReferredUsersPagination(prev => {
      const isSameColumn = prev.sort_by === columnName;
      return {
        ...prev,
        sort_by: columnName,
        is_desc: isSameColumn ? !prev.is_desc : true,
        page_number: 1
      };
    });
  };

  const getReferredUsersSortIcon = (columnName) => {
    if (referredUsersPagination.sort_by !== columnName) {
      return '⇅';
    }
    return referredUsersPagination.is_desc ? '↓' : '↑';
  };

  

  const validateInviteEmails = (emailsString) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = emailsString.split(',').map(email => email.trim()).filter(email => email);
    
    if (emails.length === 0) {
      return { valid: false, error: 'Email is required' };
    }
    
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return { valid: false, error: `Invalid email format: ${invalidEmails.join(', ')}` };
    }
    
    return { valid: true, error: '' };
  };

  const handleInviteNow = async () => {
    const emailsString = inviteEmails.trim();
    const validation = validateInviteEmails(emailsString);
    
    if (!validation.valid) {
      setInviteError(validation.error);
      return;
    }
    
    try {
      setIsInviting(true);
      const emailsArray = emailsString.split(',').map(email => email.trim());
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      const response = await fetch(`${API_BASE_URL}/guest-account/invite-friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'GuestAccountToken': userInfo.token },
        body: JSON.stringify({ guest_account_id: userInfo.guest_account_id, emails: emailsArray, redirected_link: window.location.origin + '/register' })
      });
      const data = await response.json();
      if (response.ok && data.message === 'success') {
        if (data.token_expiry_on) { userInfo.expiry_on = data.token_expiry_on; localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo)); }
        showToast('Invitations sent successfully!', 'success');
        setShowInviteModal(false);
        setInviteEmails('');
      } else {
        setInviteError(data.message || 'Failed to send invitations');
      }
    } catch (error) { setInviteError('Error sending invitations'); }
    finally { setIsInviting(false); }
  };

  const getReferredUsersTotalPages = () => Math.ceil(referredUsersData.total_count / referredUsersPagination.page_size);

  const handleApplyReferral = async () => {
    const code = applyReferralInput.trim();
    if (!code) { setApplyReferralError('Please enter a referral code'); return; }
    try {
      setIsApplyingReferral(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      const response = await fetch(`${API_BASE_URL}/guest-account/apply-referral-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'GuestAccountToken': userInfo.token },
        body: JSON.stringify({ guest_account_id: userInfo.guest_account_id, referral_code: code })
      });
      const data = await response.json();
      if (response.ok && data.message === 'success') {
        if (data.token_expiry_on) { userInfo.expiry_on = data.token_expiry_on; localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo)); }
        setReferredBy(data.referred_by || code);
        setReferredById(data.referred_by_id || '');
        setApplyReferralInput('');
        showToast('Referral code applied successfully!', 'success');
      } else {
        // Update token expiry if backend provided it even on error
        if (data && data.token_expiry_on) {
          userInfo.expiry_on = data.token_expiry_on;
          localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        }
        // If backend returned 404 or a referral-related message, surface it on the referral input
        if (data && data.message && (response.status === 404 || /referral/i.test(data.message))) {
          setApplyReferralError(data.message);
        } else {
          setApplyReferralError(data.message || 'Invalid referral code');
        }
      }
    } catch (error) { setApplyReferralError('Error applying referral code'); }
    finally { setIsApplyingReferral(false); }
  };

  const request_referral_code = async () => {
    try {
      setIsRequestingCode(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      const response = await fetch(`${API_BASE_URL}/guest-account/request-referral-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'GuestAccountToken': userInfo.token },
        body: JSON.stringify({ guest_account_id: userInfo.guest_account_id })
      });
      const data = await response.json();
      if (response.ok && data.referral_code) {
        setReferralCode(data.referral_code);
        if (data.token_expiry_on) { userInfo.expiry_on = data.token_expiry_on; localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo)); }
        showToast('Referral code generated!', 'success');
      } else {
        showToast(data.message || 'Failed to generate referral code', 'error');
      }
    } catch (error) { showToast('Error requesting referral code', 'error'); }
    finally { setIsRequestingCode(false); }
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
      showToast('Nothing changes on profile data!', 'warning');
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
      setLoadingText('Save processing...');
      setIsProcessing(true);
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
        window.dispatchEvent(new Event('storage'));
        showToast('Profile saved successfully!', 'success');
      } else if (data.message === 'failed' || data.message === 'timeout') {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsProcessing(false);
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
        <div className="login-modal-overlay">
          <button className="close-button" onClick={handleCloseModal}>×</button>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Sign In</h2>
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
                {isSubmitting ? 'Processing...' : 'SIGN IN'}
              </button>
              <p className="signup-prompt">Don't have an account? <a className="resend-link" onClick={() => { handleCloseModal(); navigate('/register'); }}>Sign up</a></p>
            </form>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="login-modal-overlay">
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
                        <div className="upload-section" hidden>
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
                          <label>First Name <span className="required-asterisk">*</span></label>
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
                          <label>Last Name <span className="required-asterisk">*</span></label>
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
                          <label>Country <span className="required-asterisk">*</span></label>
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
                          <label>Company Name <span className="required-asterisk">*</span></label>
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
                  {activeMenu === 'Referrals' && (
                    <div className="referrals-content">
                      {isLoadingReferralCode ? (
                        <p>Loading referrals data...</p>
                      ) : (
                        <>
                          <input type="hidden" value={referredById} />
                          <div className="referral-code-section">
                            {referredBy ? (
                              <span>You are referred by : <strong>{referredBy}</strong></span>
                            ) : (
                              <>
                                <p className="referral-title" style={{marginBottom: '4px'}}>Got a Referral Code?</p>
                                <p className="referral-subtitle" style={{marginBottom: '12px'}}>No referral yet? Enter a referral code to get a special offer.</p>
                                <div className="apply-referral-row">
                                  <input
                                    type="text"
                                    className={`apply-referral-input${applyReferralError ? ' input-error' : ''}`}
                                    placeholder="Enter referral code"
                                    value={applyReferralInput}
                                    onChange={(e) => { setApplyReferralInput(e.target.value); setApplyReferralError(''); }}
                                  />
                                  <button className="apply-referral-btn" onClick={handleApplyReferral} disabled={isApplyingReferral}>
                                    {isApplyingReferral ? 'Applying...' : 'Apply Code'}
                                  </button>
                                </div>
                                {applyReferralError && <span className="error-message">{applyReferralError}</span>}
                              </>
                            )}
                          </div>
                          <div className="referral-code-section">
                            {referralCode ? (
                              <>
                                <p className="referral-title">Invite Friends &amp; Earn Rewards.</p>
                                <p className="referral-subtitle" style={{marginBottom: '12px'}}>Share your referral code and enjoy special benefits when your friends join.</p>
                                <div className="referral-code-row">
                                  <span>Your Referral Code : <strong>{referralCode}</strong></span>
                                  <button className={`copy-code-btn${isCopied ? ' copied' : ''}`} onClick={() => { navigator.clipboard.writeText(referralCode); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}>
                                    {isCopied ? (
                                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                                    ) : (
                                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
                                    )}
                                  </button>
                                </div>
                                <p className="referral-helper-text">Share this code with your friends to earn rewards.</p>
                                <div className="referral-invite-section">
                                  <button className="invite-friends-btn" onClick={() => { setShowInviteModal(true); setInviteEmails(''); setInviteError(''); }}>Invite Friends</button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="referral-title">Invite Friends &amp; Earn Rewards.</p>
                                <p className="referral-subtitle" style={{marginBottom: '12px'}}>Share your referral code and enjoy special benefits when your friends join.</p>
                                <button className="request-referral-btn" onClick={request_referral_code} disabled={isRequestingCode}>
                                  {isRequestingCode ? 'Requesting...' : 'Request Your Referral Code'}
                                </button>
                              </>
                            )}
                          </div>
                          {referralCode && (
                            <div className="referred-users-section">
                            <h4>Referred Users</h4>
                        {isLoadingReferredUsers ? (
                          <p>Loading...</p>
                        ) : referredUsersData.data_list.length === 0 ? (
                          <p>No referred users yet</p>
                        ) : (
                          <>
                            <div className="page-size-control">
                              <label>Page size:
                                <select value={referredUsersPagination.page_size} onChange={handleReferredUsersPageSizeChange}>
                                  <option value="5">5</option>
                                  <option value="10">10</option>
                                  <option value="20">20</option>
                                  <option value="50">50</option>
                                </select>
                              </label>
                            </div>
                            <div className="orders-table-container">
                              <table className="orders-table">
                                <thead>
                                  <tr>
                                    <th className="sortable-header" onClick={() => handleReferredUsersSortChange('created_at')}>
                                      Created At {getReferredUsersSortIcon('created_at')}
                                    </th>
                                    <th className="sortable-header" onClick={() => handleReferredUsersSortChange('email')}>
                                      Email {getReferredUsersSortIcon('email')}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {referredUsersData.data_list.map((user, index) => (
                                    <tr key={index}>
                                      <td>{new Date(user.created_at).toLocaleString()}</td>
                                      <td>{user.email}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="pagination-info">Total row(s): {referredUsersData.total_count}</div>
                            <div className="pagination-buttons">
                              <button onClick={() => handleReferredUsersPageChange(1)} disabled={referredUsersPagination.page_number === 1} title="First page">⏮</button>
                              <button onClick={() => handleReferredUsersPageChange(referredUsersPagination.page_number - 1)} disabled={referredUsersPagination.page_number === 1} title="Previous page">◀</button>
                              <span className="page-indicator">Page {referredUsersPagination.page_number} of {getReferredUsersTotalPages()}</span>
                              <button onClick={() => handleReferredUsersPageChange(referredUsersPagination.page_number + 1)} disabled={referredUsersPagination.page_number >= getReferredUsersTotalPages()} title="Next page">▶</button>
                              <button onClick={() => handleReferredUsersPageChange(getReferredUsersTotalPages())} disabled={referredUsersPagination.page_number >= getReferredUsersTotalPages()} title="Last page">⏭</button>
                            </div>
                          </>
                        )}
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  )}
                  {activeMenu === 'Orders' && (
                    <div className="orders-content">
                      {isLoadingOrders ? (
                        <p>Loading orders...</p>
                      ) : ordersData.data_list.length === 0 ? (
                        <p>No orders yet</p>
                      ) : (
                        <>
                          <div className="page-size-control">
                            <label>
                              Page size:
                              <select value={ordersPagination.page_size} onChange={handlePageSizeChange}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                              </select>
                            </label>
                          </div>
                          <div className="orders-table-container">
                            <table className="orders-table">
                              <thead>
                                <tr>
                                  <th className="sortable-header" onClick={() => handleSortChange('transaction_date')}>
                                    Transaction Date {getSortIcon('transaction_date')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSortChange('transaction_expired_date')}>
                                    Expired Date {getSortIcon('transaction_expired_date')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSortChange('service_name')}>
                                    Service Name {getSortIcon('service_name')}
                                  </th>
                                  <th>Order Code</th>
                                  <th className="sortable-header" onClick={() => handleSortChange('usage_status')}>
                                    Service Status {getSortIcon('usage_status')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSortChange('payment_status')}>
                                    Payment Status {getSortIcon('payment_status')}
                                  </th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ordersData.data_list.map((order, index) => {
                                  const usageStatusText = order.usage_status === 0 ? 'Unuseable' : order.usage_status === 1 ? 'Usable' : 'Completed';
                                  const isNotExpired = new Date(order.transaction_expired_date) > new Date();
                                  return (
                                    <tr key={index}>
                                      <td>{new Date(order.transaction_date).toLocaleString()}</td>
                                      <td>{new Date(order.transaction_expired_date).toLocaleString()}</td>
                                      <td>{order.service_name}</td>
                                      <td>{order.order_code}</td>
                                      <td>{usageStatusText}</td>
                                      <td>{order.payment_status}</td>
                                      <td>
                                        <div className="action-buttons">
                                          {order.checkout_session_status === 'expired' && (
                                            <span style={{ color: '#d32f2f', fontWeight: 'bold', cursor: 'default' }}>Expired!</span>
                                          )}
                                          {order.usage_status === 0 && (order.payment_status === 'unpaid' || order.payment_status === '') && isNotExpired && order.checkout_url && (
                                            <a href={order.checkout_url} target="_blank" rel="noopener noreferrer" className="action-btn">
                                              💳
                                            </a>
                                          )}
                                          {order.usage_status === 1 && order.payment_status === 'paid' && (
                                            <>
                                              <a href={`/Search-Service?ordercode=${order.order_code}`} className="action-btn">
                                                🔍
                                              </a>
                                              {order.psp_stripe_receipt_url && (
                                                <a href={order.psp_stripe_receipt_url} target="_blank" rel="noopener noreferrer" className="action-btn">
                                                  🧾
                                                </a>
                                              )}
                                            </>
                                          )}
                                          {order.usage_status === 2 && order.payment_status === 'paid' && order.psp_stripe_receipt_url && (
                                            <a href={order.psp_stripe_receipt_url} target="_blank" rel="noopener noreferrer" className="action-btn">
                                              🧾
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="pagination-info">
                            Total row(s): {ordersData.total_count}
                          </div>
                          <div className="pagination-buttons">
                            <button 
                              onClick={() => handlePageChange(1)} 
                              disabled={ordersPagination.page_number === 1}
                              title="First page"
                            >
                              ⏮
                            </button>
                            <button 
                              onClick={() => handlePageChange(ordersPagination.page_number - 1)} 
                              disabled={ordersPagination.page_number === 1}
                              title="Previous page"
                            >
                              ◀
                            </button>
                            <span className="page-indicator">
                              Page {ordersPagination.page_number} of {getTotalPages()}
                            </span>
                            <button 
                              onClick={() => handlePageChange(ordersPagination.page_number + 1)} 
                              disabled={ordersPagination.page_number >= getTotalPages()}
                              title="Next page"
                            >
                              ▶
                            </button>
                            <button 
                              onClick={() => handlePageChange(getTotalPages())} 
                              disabled={ordersPagination.page_number >= getTotalPages()}
                              title="Last page"
                            >
                              ⏭
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {activeMenu === 'Search Histories' && (
                    <div className="search-histories-content">
                      {isLoadingSearchHistories ? (
                        <p>Loading search histories...</p>
                      ) : searchHistoriesData.data_list.length === 0 ? (
                        <p>No search history</p>
                      ) : (
                        <>
                          <div className="page-size-control">
                            <label>
                              Page size:
                              <select value={searchHistoriesPagination.page_size} onChange={handleSearchHistoriesPageSizeChange}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                              </select>
                            </label>
                          </div>
                          <div className="orders-table-container">
                            <table className="orders-table">
                              <thead>
                                <tr>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('completed_time')}>
                                    Completed Time {getSearchHistoriesSortIcon('completed_time')}
                                  </th>
                                  <th>Reference Key</th>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('first_name')}>
                                    First Name {getSearchHistoriesSortIcon('first_name')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('middle_name')}>
                                    Middle Name {getSearchHistoriesSortIcon('middle_name')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('last_name')}>
                                    Last Name {getSearchHistoriesSortIcon('last_name')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('dob')}>
                                    DOB {getSearchHistoriesSortIcon('dob')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('rag_result')}>
                                    RAG Result {getSearchHistoriesSortIcon('rag_result')}
                                  </th>
                                  <th className="sortable-header" onClick={() => handleSearchHistoriesSortChange('pdf_sent')}>
                                    PDF Sent {getSearchHistoriesSortIcon('pdf_sent')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {searchHistoriesData.data_list.map((history, index) => (
                                  <tr key={index}>
                                    <td>{new Date(history.completed_time).toLocaleString()}</td>
                                    <td>{history.reference_key}</td>
                                    <td>{history.first_name}</td>
                                    <td>{history.middle_name}</td>
                                    <td>{history.last_name}</td>
                                    <td>{history.dob ? new Date(history.dob).toLocaleDateString() : ''}</td>
                                    <td>{history.rag_result}</td>
                                    <td>
                                      {history.pdf_sent ? (
                                        <span style={{ color: 'green', fontSize: '1.2rem' }}>✅</span>
                                      ) : (
                                        <span style={{ color: 'red', fontSize: '1.2rem' }}>❌</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="pagination-info">
                            Total row(s): {searchHistoriesData.total_count}
                          </div>
                          <div className="pagination-buttons">
                            <button 
                              onClick={() => handleSearchHistoriesPageChange(1)} 
                              disabled={searchHistoriesPagination.page_number === 1}
                              title="First page"
                            >
                              ⏮
                            </button>
                            <button 
                              onClick={() => handleSearchHistoriesPageChange(searchHistoriesPagination.page_number - 1)} 
                              disabled={searchHistoriesPagination.page_number === 1}
                              title="Previous page"
                            >
                              ◀
                            </button>
                            <span className="page-indicator">
                              Page {searchHistoriesPagination.page_number} of {getSearchHistoriesTotalPages()}
                            </span>
                            <button 
                              onClick={() => handleSearchHistoriesPageChange(searchHistoriesPagination.page_number + 1)} 
                              disabled={searchHistoriesPagination.page_number >= getSearchHistoriesTotalPages()}
                              title="Next page"
                            >
                              ▶
                            </button>
                            <button 
                              onClick={() => handleSearchHistoriesPageChange(getSearchHistoriesTotalPages())} 
                              disabled={searchHistoriesPagination.page_number >= getSearchHistoriesTotalPages()}
                              title="Last page"
                            >
                              ⏭
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="login-modal-overlay">
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowInviteModal(false)}>×</button>
            <h2>Invite Friends</h2>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                value={inviteEmails}
                onChange={(e) => { setInviteEmails(e.target.value); setInviteError(''); }}
                placeholder="friend@example.com"
                className={inviteError ? 'input-error' : ''}
              />
              <small>Use commas for multiple email addresses.</small>
              {inviteError && <span className="error-message">{inviteError}</span>}
            </div>
            <button className="submit-button" onClick={handleInviteNow} disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Invite Now'}
            </button>
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

      {isProcessing && (
        <div className="modal-overlay loading-overlay">
          <div className="loading-modal">
            <div className="spinner"></div>
            <h2>{loadingText}</h2>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
