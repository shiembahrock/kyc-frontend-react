import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { AuthValidationByTokenAndGuestAccountID } from '../utils/auth';
import '../styles/PaymentSuccess.css';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('ordercode');
  const hasValidated = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (hasValidated.current) return;
    
    const validateAuth = async () => {
      const userInfo = localStorage.getItem('_userLoggedInInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        if (parsed.guest_account_id && parsed.token) {
          hasValidated.current = true;
          setIsLoggedIn(true);
          await AuthValidationByTokenAndGuestAccountID(parsed.token, parsed.guest_account_id);
          window.dispatchEvent(new Event('storage'));
        }
      }
    };
    validateAuth();

    const checkLoginInterval = setInterval(() => {
      const userInfo = localStorage.getItem('_userLoggedInInfo');
      if (userInfo && !isLoggedIn) {
        window.location.reload();
      }
    }, 500);

    return () => clearInterval(checkLoginInterval);
  }, [isLoggedIn]);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  return (
    <>
      <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      <div className="complete-order-page">        
        <div className="complete-order-container">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Home
          </button>
          <div className="order-header">
            <div className="success-icon">✓</div>
            <h1>Thank You!</h1>
            <div className="success-message">
              <p>Thank you for ordering our service.</p>
              {isLoggedIn ? (
                <p>Go to <a href={`/Search-Service?ordercode=${orderCode || ''}`}>Search Service</a> page OR</p>
              ) : (
                <p>You are not logged in yet, please <a href="#" onClick={handleLoginClick}>LOGIN</a> to continue using our service OR</p>
              )}
              <p>Please check your email inbox, find the email sent from <strong>Pass</strong> with the subject <strong>Assessment Invitation</strong> to proceed.</p>
              {orderCode && (
                <div className="order-code">
                  <strong>Order Code:</strong> {orderCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default PaymentSuccess;
