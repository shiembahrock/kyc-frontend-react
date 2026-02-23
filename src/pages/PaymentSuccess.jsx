import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthValidationByTokenAndGuestAccountID } from '../utils/auth';
import '../styles/PaymentSuccess.css';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('ordercode');
  const hasValidated = useRef(false);

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

  return (
    <>
      <Navbar />
      <div className="complete-order-page">
        <div className="complete-order-container">
          <div className="order-header">
            <div className="success-icon">✓</div>
            <h1>Thank You!</h1>
            <div className="success-message">
              <p>Thank you for ordering our service.</p>
              <p>Please check your email inbox, find the email sent from <strong>Pass</strong> with the subject <strong>Assessment Invitation</strong> to proceed.</p>
              {orderCode && (
                <div className="order-code">
                  <strong>Order Code:</strong> {orderCode}
                </div>
              )}
            </div>
          </div>
          <button className="submit-btn" onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccess;
