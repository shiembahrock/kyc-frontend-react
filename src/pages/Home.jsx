import React from 'react';
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
import '../styles/Home.css';

const Home = () => {
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
