import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-info">
            <h3 className="footer-logo">
              <span className="logo-shree">SHREE SHYAM</span>
              <span className="logo-it">IT SOLUTIONS</span>
            </h3>
            <p className="footer-description">
              Creating innovative digital solutions that help businesses grow and succeed in the modern world.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/works">Our Works</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li>Web Services</li>
              <li>Software Services</li>
              <li>Application Services</li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>Email: ShreeShyamItSolutions@gmail.com</p>
            <p>Phone: +91 62840-86208</p>
            <p>Phone: +91 81468-42099</p>
            <p>Phone: +91 82682-64000</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 SHREE SHYAM IT SOLUTIONS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;