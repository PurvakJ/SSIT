import React, { useState, useEffect } from 'react';
import { addContact } from '../api';
import './contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
    workType: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Work type options with icons
  const workTypes = [
    { value: 'custom-web', label: 'Custom Website', icon: '🌐' },
    { value: 'ecommerce', label: 'E-commerce Website', icon: '🛒' },
    { value: 'portfolio', label: 'Portfolio Website', icon: '🎨' },
    { value: 'promotional', label: 'Promotional Website', icon: '📢' },
    { value: 'software', label: 'Software Development', icon: '💻' },
    { value: 'application', label: 'Mobile Application', icon: '📱' },
    { value: 'other', label: 'Other', icon: '✨' }
  ];

  // Contact info cards
  const contactInfo = [
    { icon: '📧', label: 'Email', value: 'itsolutionsshreeshyam@gmail.com', link: 'mailto:itsolutionsshreeshyam@gmail.com' },
    { icon: '📱', label: 'Phone', value: '+91 62840-86208', link: 'tel:+916284086208' },
    { icon: '📍', label: 'Address', value: 'Patiala, Punjab, India', link: '#' },
    { icon: '⏰', label: 'Working Hours', value: 'Mon - Sat: 9:00 AM - 7:00 PM', link: null }
  ];

  // Mouse move effect for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addContact(formData);
      alert('Message sent successfully! We will contact you soon.');
      setFormData({ 
        name: '', 
        email: '', 
        mobile: '', 
        message: '', 
        workType: '' 
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="contact-page">
      {/* Background Effects */}
      <div className="gradient-orb-contact" style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }} />
      <div className="gradient-orb-contact" style={{ animationDelay: '-5s', transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }} />
      
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            <span className="hero-subtitle">GET IN TOUCH</span>
            <span className="hero-main">Contact Us</span>
          </h1>
          <p className="contact-hero-description">
            Have a project in mind? We'd love to hear about it. Let's discuss how we can help bring your ideas to life.
          </p>
        </div>
      </div>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className="contact-info-icon">{info.icon}</div>
              <div className="contact-info-content">
                <h3>{info.label}</h3>
                {info.link ? (
                  <a href={info.link} className="contact-info-link">
                    {info.value}
                  </a>
                ) : (
                  <p>{info.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="contact-content-grid">
          {/* Contact Form Section */}
          <div className="contact-form-section">
            <div className="contact-form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form-enhanced">
              <div className="form-group-enhanced">
                <label htmlFor="name">Full Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input-with-icon"
                  />
                </div>
              </div>

              <div className="form-row-enhanced">
                <div className="form-group-enhanced">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input-with-icon"
                    />
                  </div>
                </div>

                <div className="form-group-enhanced">
                  <label htmlFor="mobile">Mobile Number *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📱</span>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      pattern="[0-9+\-\s]+"
                      title="Please enter a valid phone number"
                      className="form-input-with-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-enhanced">
                <label htmlFor="workType">Type of Work Required *</label>
                <div className="work-type-selector">
                  {workTypes.map(type => (
                    <label key={type.value} className={`work-type-option ${formData.workType === type.value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="workType"
                        value={type.value}
                        checked={formData.workType === type.value}
                        onChange={handleChange}
                        required
                        className="work-type-radio"
                      />
                      <span className="work-type-icon">{type.icon}</span>
                      <span className="work-type-label">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group-enhanced">
                <label htmlFor="message">Your Message *</label>
                <div className="textarea-wrapper">
                  <span className="textarea-icon">💬</span>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your project requirements, budget, timeline, and any specific features you need..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="form-textarea-with-icon"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side - Map/Additional Info */}
          <div className="contact-sidebar">
            {/* Why Choose Us */}
            <div className="why-choose-us-card">
              <h3>Why Choose Us?</h3>
              <ul className="benefits-list">
                <li>
                  <span className="benefit-icon">✓</span>
                  <div>
                    <strong>Expert Team</strong>
                    <p>Skilled professionals with years of experience</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✓</span>
                  <div>
                    <strong>Timely Delivery</strong>
                    <p>Projects delivered on schedule</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✓</span>
                  <div>
                    <strong>Quality Assurance</strong>
                    <p>Rigorous testing and quality checks</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✓</span>
                  <div>
                    <strong>Post-Launch Support</strong>
                    <p>Ongoing maintenance and support</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Card with Actual Google Maps */}
            <div className="map-card">
              <h3>Visit Us</h3>
              <div className="map-container">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13773.862165776272!2d76.38365870688182!3d30.337716596432095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1773513107646!5m2!1sen!2sin" 
                  className="google-map"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps - Shree Shyam IT Solutions Location"
                />
              </div>
              <div className="map-address-info">
                <p className="map-address">
                  <span className="map-marker">📍</span>
                  Shree Shyam IT Solutions, Patiala, Punjab, India
                </p>
              </div>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=30.337716596432095,76.38365870688182" 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link"
              >
                Get Directions →
              </a>
            </div>

            {/* Social Links */}
            <div className="social-card">
              <h3>Follow Us</h3>
              <div className="social-links-grid">
                <a 
                  href="https://www.linkedin.com/in/purvak-jindal-6741682a1/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="LinkedIn"
                >
                  <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://www.instagram.com/shree_shyam_it_solutions/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Instagram"
                >
                  <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="section-title-enhanced">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>What is your typical project timeline?</h4>
              <p>Project timelines vary based on complexity. A simple website might take 2-3 weeks, while complex applications can take 2-3 months. We'll provide a detailed timeline during consultation.</p>
            </div>
            <div className="faq-item">
              <h4>Do you provide maintenance after launch?</h4>
              <p>Yes, we offer post-launch maintenance packages to ensure your project runs smoothly and stays up-to-date with the latest technologies.</p>
            </div>
            <div className="faq-item">
              <h4>What information do you need to start?</h4>
              <p>We'll need your project requirements, goals, target audience, any design preferences, and content (text, images, etc.) to begin. We'll guide you through the process.</p>
            </div>
            <div className="faq-item">
              <h4>How do you handle revisions?</h4>
              <p>We include a certain number of revision rounds in our packages. Additional revisions can be discussed based on project scope.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;