import { API_BASE_URL } from '../config';

export const AuthValidationByTokenAndGuestAccountID = async (token, guestAccountId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate-by-token-and-guest-account-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'GuestAccountToken': token
      },
      body: JSON.stringify({
        guest_account_id: guestAccountId
      })
    });

    const data = await response.json();

    if (data.auth_status === 'valid') {
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      userInfo.token = data.token;
      userInfo.expiry_on = data.expiry_on;
      localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
      return true;
    } else {
      localStorage.removeItem('_userLoggedInInfo');
      window.location.reload();
      return false;
    }
  } catch (error) {
    console.error('Error validating auth:', error);
    localStorage.removeItem('_userLoggedInInfo');
    window.location.reload();
    return false;
  }
};
