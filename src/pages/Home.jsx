import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import AboutUs from '../components/AboutUs';
import Services from '../components/Services';
import Statistics from '../components/Statistics';
import WhyChoose from '../components/WhyChoose';
import AwardWinning from '../components/AwardWinning';
import Pricing from '../components/Pricing';
import ContactUs from '../components/ContactUs';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { AuthValidationByTokenAndGuestAccountID } from '../utils/auth';
import '../styles/Home.css';

const Home = () => {
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
    <div className="home">
      <Navbar />
      <Banner />
      <AboutUs />      
      <WhyChoose />
      <AwardWinning />
      <Services />
      <Statistics />
      <Pricing />
      <ContactUs />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
