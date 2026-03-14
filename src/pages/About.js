import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

function About() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">
            <span className="hero-subtitle">ABOUT</span>
            <span className="hero-main">WorkSpace</span>
          </h1>
          <p className="about-hero-description">
            Crafting digital excellence through innovation, creativity, and technical expertise. 
            We transform ideas into impactful digital solutions that drive success.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="about-container">
        <div className="about-section story-section">
          <div className="story-content">
            <h2 className="section-title">Our Story</h2>
            <p className="section-text">
              WorkSpace was founded with a simple mission: to showcase exceptional digital work 
              and connect talented creators with businesses and individuals who need their services. 
              We believe in the power of great design and development to transform ideas into reality.
            </p>
            <p className="section-text">
              What started as a small portfolio platform has grown into a comprehensive workspace 
              where creativity meets technology. Our journey has been driven by passion, 
              innovation, and an unwavering commitment to quality.
            </p>
          </div>
          <div className="story-stats">
            <div className="stat-badge">
              <span className="stat-number">150+</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-badge">
              <span className="stat-number">50+</span>
              <span className="stat-label">Clients</span>
            </div>
            <div className="stat-badge">
              <span className="stat-number">5+</span>
              <span className="stat-label">Years</span>
            </div>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="about-section mission-section">
          <h2 className="section-title">What We Do</h2>
          <div className="mission-card">
            <p className="mission-text">
              We provide a platform where creative professionals can showcase their portfolio of work, 
              including custom websites, e-commerce solutions, mobile applications, and more. 
              Our workspace features a collection of high-quality projects that demonstrate expertise 
              and innovation in digital creation.
            </p>
          </div>
        </div>

        {/* Services Section */}
        <div className="about-section services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid-enhanced">
            <div className="service-card-enhanced">
              <div className="service-icon">🌐</div>
              <h3>Custom Websites</h3>
              <p>Tailored websites built to your specific requirements and brand identity</p>
              <ul className="service-features-small">
                <li>Responsive Design</li>
                <li>SEO Optimized</li>
                <li>Fast Loading</li>
              </ul>
            </div>
            
            <div className="service-card-enhanced">
              <div className="service-icon">🛒</div>
              <h3>E-commerce Solutions</h3>
              <p>Full-featured online stores with secure payment integration</p>
              <ul className="service-features-small">
                <li>Payment Gateway</li>
                <li>Inventory Management</li>
                <li>Mobile Friendly</li>
              </ul>
            </div>
            
            <div className="service-card-enhanced">
              <div className="service-icon">🎨</div>
              <h3>Portfolio Sites</h3>
              <p>Beautiful portfolio websites to showcase your work and skills</p>
              <ul className="service-features-small">
                <li>Gallery Layouts</li>
                <li>Case Studies</li>
                <li>Client Showcase</li>
              </ul>
            </div>
            
            <div className="service-card-enhanced">
              <div className="service-icon">⚡</div>
              <h3>Web Applications</h3>
              <p>Interactive web applications with powerful functionality</p>
              <ul className="service-features-small">
                <li>Real-time Features</li>
                <li>API Integration</li>
                <li>Scalable Architecture</li>
              </ul>
            </div>
            
            <div className="service-card-enhanced">
              <div className="service-icon">📱</div>
              <h3>Mobile Apps</h3>
              <p>Native and cross-platform mobile applications</p>
              <ul className="service-features-small">
                <li>iOS & Android</li>
                <li>Push Notifications</li>
                <li>Offline Support</li>
              </ul>
            </div>
            
            <div className="service-card-enhanced">
              <div className="service-icon">💻</div>
              <h3>Software Development</h3>
              <p>Custom software solutions for businesses</p>
              <ul className="service-features-small">
                <li>Enterprise Solutions</li>
                <li>Cloud Integration</li>
                <li>Custom APIs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="about-section features-section">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">👥</span>
              </div>
              <h3>Expert Team</h3>
              <p>Skilled professionals with years of experience in various technologies</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⭐</span>
              </div>
              <h3>Quality Work</h3>
              <p>High-quality deliverables that exceed expectations and industry standards</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⏱️</span>
              </div>
              <h3>Timely Delivery</h3>
              <p>Projects completed on time, every time with efficient project management</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">💬</span>
              </div>
              <h3>24/7 Support</h3>
              <p>Dedicated support throughout and after project completion</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔒</span>
              </div>
              <h3>Secure Development</h3>
              <p>Following best practices for security and data protection</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🚀</span>
              </div>
              <h3>Innovation First</h3>
              <p>Embracing cutting-edge technologies for modern solutions</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="about-cta-enhanced">
          <h2>Ready to Start Your Project?</h2>
          <p>Get in touch with us today to discuss your requirements and bring your ideas to life</p>
          <div className="cta-buttons">
            <Link to="/works" className="btn btn-primary btn-large">
              <span>View Our Work</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/contact" className="btn btn-outline btn-large">
              <span>Contact Us</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;