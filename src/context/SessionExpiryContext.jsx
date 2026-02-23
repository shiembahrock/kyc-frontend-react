import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthValidationByTokenAndGuestAccountID } from '../utils/auth';
import '../styles/SessionExpiryModal.css';

const SessionExpiryContext = createContext();

export const useSessionExpiry = () => {
  const context = useContext(SessionExpiryContext);
  if (!context) {
    throw new Error('useSessionExpiry must be used within SessionExpiryProvider');
  }
  return context;
};

export const SessionExpiryProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const countdownIntervalRef = useRef(null);
  const modalTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const modalShownRef = useRef(false);
  const isResettingRef = useRef(false);

  const clearTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  const handleLogout = (isAutoLogout = false) => {
    clearTimers();
    localStorage.removeItem('_userLoggedInInfo');
    setShowModal(false);
    modalShownRef.current = false;
    window.location.href = '/';
  };

  const showExpiryModal = () => {
    if (modalShownRef.current) return;
    modalShownRef.current = true;
    
    let timeLeft = 60;
    setCountdown(timeLeft);
    setShowModal(true);
    
    countdownIntervalRef.current = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);
  };

  const handleStayLoggedIn = async () => {
    clearInterval(countdownIntervalRef.current);
    modalShownRef.current = false;
    
    const userInfo = localStorage.getItem('_userLoggedInInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed.guest_account_id && parsed.token) {
        await AuthValidationByTokenAndGuestAccountID(parsed.token, parsed.guest_account_id);
      }
    }
    
    setShowModal(false);
    startExpiryCheck();
  };

  const startExpiryCheck = () => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;
    
    clearTimers();
    modalShownRef.current = false;
    
    const userInfo = localStorage.getItem('_userLoggedInInfo');
    if (!userInfo) {
      isResettingRef.current = false;
      return;
    }
    
    const parsed = JSON.parse(userInfo);
    if (!parsed.expiry_on) {
      isResettingRef.current = false;
      return;
    }
    
    const expiryTime = parsed.expiry_on * 1000;
    const now = Date.now();
    
    if (expiryTime < now) {
      handleLogout(true);
      isResettingRef.current = false;
      return;
    }
    
    const timeUntilExpiry = expiryTime - now;
    const timeUntilModal = timeUntilExpiry - 60000;
    
    if (timeUntilModal > 0) {
      modalTimeoutRef.current = setTimeout(showExpiryModal, timeUntilModal);
    } else if (!modalShownRef.current) {
      showExpiryModal();
    }
    
    logoutTimeoutRef.current = setTimeout(() => handleLogout(true), timeUntilExpiry);
    
    isResettingRef.current = false;
  };

  useEffect(() => {
    startExpiryCheck();

    const handleStorageChange = (e) => {
      if (e.key === '_userLoggedInInfo' || e.key === null) {
        startExpiryCheck();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const oldValue = localStorage.getItem(key);
      originalSetItem.apply(this, arguments);
      if (key === '_userLoggedInInfo' && oldValue !== value) {
        startExpiryCheck();
      }
    };

    return () => {
      clearTimers();
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SessionExpiryContext.Provider value={{}}>
      {children}
      {showModal && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <h2>Session Expiry</h2>
            <p className="session-message">
              Your session will expire in {formatTime(countdown)} seconds
            </p>
            <div className="session-buttons">
              <button className="session-btn-logout" onClick={handleLogout}>
                Logout
              </button>
              <button className="session-btn-stay" onClick={handleStayLoggedIn}>
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </SessionExpiryContext.Provider>
  );
};
