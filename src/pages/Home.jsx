import React from 'react';
import Banner from '../components/Banner';
import AboutUs from '../components/AboutUs';
import Services from '../components/Services';
import Pricing from '../components/Pricing';
import ContactUs from '../components/ContactUs';
import Footer from '../components/Footer';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <Banner />
      <AboutUs />
      <Services />
      <Pricing />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default Home;
