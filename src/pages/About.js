import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './about.css';

function About() {
  const [hoveredService, setHoveredService] = useState(null);

  // Background images array for hero section
  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];

  // Team/office images
  const teamImages = {
    office1: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    office2: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    collaboration: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };

  // Technology images for visual interest with multiple variants per service
  const techImages = {
    web: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    ecommerce: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556740714-a8395b3bf30f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    webapp: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    mobile: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    software: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  };

  const services = [
    { 
      icon: '🌐', 
      title: 'Custom Websites', 
      desc: 'Tailored websites built to your specific requirements', 
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading'], 
      imageCategory: 'web',
      color: '#4f46e5'
    },
    { 
      icon: '🛒', 
      title: 'E-commerce Solutions', 
      desc: 'Full-featured online stores with secure payment integration', 
      features: ['Payment Gateway', 'Inventory Management', 'Mobile Friendly'], 
      imageCategory: 'ecommerce',
      color: '#059669'
    },
    { 
      icon: '🎨', 
      title: 'Portfolio Sites', 
      desc: 'Beautiful portfolio websites to showcase your work', 
      features: ['Gallery Layouts', 'Case Studies', 'Client Showcase'], 
      imageCategory: 'portfolio',
      color: '#dc2626'
    },
    { 
      icon: '⚡', 
      title: 'Web Applications', 
      desc: 'Interactive web applications with powerful functionality', 
      features: ['Real-time Features', 'API Integration', 'Scalable Architecture'], 
      imageCategory: 'webapp',
      color: '#7c3aed'
    },
    { 
      icon: '📱', 
      title: 'Mobile Apps', 
      desc: 'Native and cross-platform mobile applications', 
      features: ['iOS & Android', 'Push Notifications', 'Offline Support'], 
      imageCategory: 'mobile',
      color: '#0891b2'
    },
    { 
      icon: '💻', 
      title: 'Software Development', 
      desc: 'Custom software solutions for businesses', 
      features: ['Enterprise Solutions', 'Cloud Integration', 'Custom APIs'], 
      imageCategory: 'software',
      color: '#b45309'
    }
  ];

  return (
    <div className="page-container">
      {/* Hero Section with Background Carousel */}
      <div className="about-hero">
        {heroBackgrounds.map((bg, index) => (
          <div
            key={index}
            className={`hero-bg-image ${index === 0 ? 'active' : ''}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
        <div className="hero-overlay"></div>
        
        {/* Floating Elements */}
        <div className="hero-floating-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>

        <div className="about-hero-content">
          <span className="hero-subtitle">ABOUT</span>
          <h1 className="about-hero-title">
            <span className="hero-main">WorkSpace</span>
          </h1>
          <p className="about-hero-description">
            Crafting digital excellence through innovation, creativity, and technical expertise. 
            We transform ideas into impactful digital solutions that drive success.
          </p>
          
          {/* Hero Stats Pills */}
          <div className="hero-stats-pills">
            <div className="stat-pill">
              <span className="pill-number">150+</span>
              <span className="pill-label">Projects</span>
            </div>
            <div className="stat-pill">
              <span className="pill-number">50+</span>
              <span className="pill-label">Clients</span>
            </div>
            <div className="stat-pill">
              <span className="pill-number">5+</span>
              <span className="pill-label">Years</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Story Section with Images */}
      <div className="about-container">
        <div className="about-section story-section">
          <div className="story-content-wrapper">
            <div className="story-images-grid">
              <div className="story-image-main">
                <img src={teamImages.office1} alt="Modern Office" loading="lazy" />
                <div className="image-overlay"></div>
              </div>
              <div className="story-image-secondary">
                <img src={teamImages.team} alt="Team Collaboration" loading="lazy" />
                <div className="image-overlay"></div>
              </div>
              <div className="story-image-tertiary">
                <img src={teamImages.office2} alt="Creative Workspace" loading="lazy" />
                <div className="image-overlay"></div>
              </div>
            </div>
          </div>

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
            
            {/* Image Quote Card */}
            <div className="story-quote-card">
              <img src={teamImages.collaboration} alt="Team Work" className="quote-image" />
              <div className="quote-content">
                <span className="quote-icon">"</span>
                <p>Innovation distinguishes between a leader and a follower</p>
                <span className="quote-author">— Our Team Philosophy</span>
              </div>
            </div>
          </div>
        </div>

        {/* What We Do Section with Background */}
        <div className="about-section mission-section">
          <div className="mission-background">
            <img 
              src={hoveredService ? techImages[hoveredService]?.[0] || techImages.web[0] : techImages.web[0]} 
              alt="Technology Background" 
              className="mission-bg-image" 
            />
            <div className="mission-bg-overlay"></div>
          </div>
          
          <h2 className="section-title">What We Do</h2>
          <div className="mission-card">
            <div className="mission-icon-grid">
              <span className="mission-icon">🚀</span>
              <span className="mission-icon">💡</span>
              <span className="mission-icon">⚡</span>
              <span className="mission-icon">🎯</span>
            </div>
            <p className="mission-text">
              We provide a platform where creative professionals can showcase their portfolio of work, 
              including custom websites, e-commerce solutions, mobile applications, and more. 
              Our workspace features a collection of high-quality projects that demonstrate expertise 
              and innovation in digital creation.
            </p>
          </div>
        </div>

        {/* Services Section with Hover Image Change */}
        <div className="about-section services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid-enhanced">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="service-card-enhanced"
                data-service={service.imageCategory}
                onMouseEnter={() => setHoveredService(service.imageCategory)}
                onMouseLeave={() => setHoveredService(null)}
                style={{ '--service-color': service.color }}
              >
                <div className="service-card-image">
                  <img 
                    src={techImages[service.imageCategory][index % techImages[service.imageCategory].length]} 
                    alt={service.title} 
                    loading="lazy"
                    className="service-bg-image"
                  />
                  <div className="service-image-overlay"></div>
                </div>
                
                {/* Image Carousel on Hover */}
                <div className="service-image-carousel">
                  {techImages[service.imageCategory].map((img, imgIndex) => (
                    <img 
                      key={imgIndex}
                      src={img} 
                      alt={`${service.title} ${imgIndex + 1}`}
                      className="carousel-image"
                      style={{ '--img-index': imgIndex }}
                    />
                  ))}
                </div>
                
                <div className="service-icon-wrapper">
                  <span className="service-icon">{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <ul className="service-features-small">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                
                {/* Hover Overlay with Quick View */}
                <div className="service-hover-overlay">
                  <span className="quick-view">Quick View →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section with Background Pattern */}
        <div className="about-section features-section">
          <div className="features-background">
            <div className="feature-pattern"></div>
            <div className="feature-pattern-2"></div>
          </div>
          
          <h2 className="section-title">Why Choose Us</h2>
          <div className="features-grid">
            {[
              { icon: '👥', title: 'Expert Team', desc: 'Skilled professionals with years of experience' },
              { icon: '⭐', title: 'Quality Work', desc: 'High-quality deliverables that exceed expectations' },
              { icon: '⏱️', title: 'Timely Delivery', desc: 'Projects completed on time, every time' },
              { icon: '💬', title: '24/7 Support', desc: 'Dedicated support throughout and after completion' },
              { icon: '🔒', title: 'Secure Development', desc: 'Following best practices for security' },
              { icon: '🚀', title: 'Innovation First', desc: 'Embracing cutting-edge technologies' }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section with Background */}
        <div className="about-cta-enhanced">
          <div className="cta-background">
            <img 
              src={hoveredService ? techImages[hoveredService]?.[1] || techImages.web[1] : techImages.web[1]} 
              alt="CTA Background" 
              className="cta-bg-image" 
            />
            <div className="cta-bg-overlay"></div>
          </div>
          
          <div className="cta-content">
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
    </div>
  );
}

export default About;