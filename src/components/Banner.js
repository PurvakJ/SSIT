import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getWorks, getReviews } from '../api'; // Import both API functions
import './Banner.css';

const Banner = () => {
  const [hoveredTech, setHoveredTech] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [counters, setCounters] = useState({ projects: 0, clients: 0, years: 0 });
  const [codeLines, setCodeLines] = useState([]);
  const [recentWorks, setRecentWorks] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [works, setWorks] = useState({});
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const bannerRef = useRef(null);
  const statsRef = useRef(null);

  // Tech code snippets for hover animations
  const techCodeSnippets = {
    react: [
      'const [state, setState] = useState()',
      '<Component props={data} />',
      'useEffect(() => {}, [])',
      'return <div>Hello</div>',
      'ReactDOM.render()',
      'import React from "react"',
      'function App() {}',
      'export default component',
      'const context = createContext()',
      'useMemo(() => {}, [])'
    ],
    node: [
      'app.get("/api", (req, res)',
      'const express = require()',
      'server.listen(3000)',
      'fs.readFileSync()',
      'process.env.PORT',
      'npm install package',
      'module.exports = {}',
      'require("database")',
      'app.use(middleware)',
      'res.json({ data })'
    ],
    python: [
      'def function():',
      'import numpy as np',
      'class MyClass:',
      'if __name__ == "__main__"',
      'print("Hello World")',
      'for item in items:',
      'try: except:',
      'return response.json()',
      '@decorator',
      'self.attribute = value'
    ],
    java: [
      'public class Main {',
      'System.out.println()',
      'private String name;',
      '@Override',
      'public static void main()',
      'import java.util.*',
      'try { } catch { }',
      'return new ArrayList()',
      'void method() { }',
      'this.variable = value'
    ],
    aws: [
      'aws s3 sync ./',
      'EC2 instance launch',
      'lambda.invoke()',
      'dynamodb.putItem()',
      's3.getObject()',
      'cloudformation deploy',
      'api-gateway endpoint',
      'rds.createInstance()',
      'ecs.runTask()',
      'cloudwatch.logs()'
    ],
    mongodb: [
      'db.collection.find()',
      '{ $match: { } }',
      'aggregate([{}])',
      'new mongoose.Schema',
      'Model.create()',
      'db.users.insert()',
      '{ $group: { } }',
      'ObjectId("...")',
      '.populate("field")',
      'index({ field: 1 })'
    ],
    flutter: [
      'Widget build() {',
      'Container(child:)',
      'Row(children: [])',
      'setState(() {})',
      '@override',
      'Scaffold(appBar:)',
      'MaterialApp(home:)',
      'Center(child:)',
      'Column(children: [])',
      'Text("Hello")'
    ],
    angular: [
      '@Component({})',
      'export class App {}',
      'ngOnInit() { }',
      'this.service.get()',
      '{{ interpolation }}',
      '*ngFor="let item"',
      '[property]="value"',
      '(click)="handle()"',
      '@Input() data',
      '@Output() event'
    ]
  };

  // Background code snippets array
  const backgroundCodeSnippets = [
    { code: '<div className="app">', left: '5%', top: '10%', delay: 0 },
    { code: 'function initialize() {', left: '10%', top: '30%', delay: 2 },
    { code: 'import { Component }', left: '15%', top: '50%', delay: 4 },
    { code: 'export default App;', left: '20%', top: '70%', delay: 6 },
    { code: 'const API_URL = ...', left: '25%', top: '20%', delay: 8 },
    { code: 'useEffect(() => {})', left: '30%', top: '80%', delay: 10 },
    { code: 'return <div>Hello</div>', left: '35%', top: '40%', delay: 12 },
    { code: 'npm start', left: '40%', top: '60%', delay: 14 },
    { code: 'git commit -m "init"', left: '45%', top: '90%', delay: 16 },
    { code: 'docker-compose up', left: '50%', top: '15%', delay: 18 }
  ];

  // Services data
  const services = [
    {
      id: 1,
      icon: '🌐',
      title: 'Web Services',
      description: 'Custom websites, web applications, and e-commerce solutions',
      features: ['Responsive Design', 'E-commerce Platforms', 'Custom Web Apps', 'Progressive Web Apps'],
      color: '#61dafb'
    },
    {
      id: 2,
      icon: '💻',
      title: 'Software Services',
      description: 'Enterprise software, desktop applications, and custom development',
      features: ['Enterprise Solutions', 'Desktop Applications', 'Custom Software', 'API Integration'],
      color: '#68a063'
    },
    {
      id: 3,
      icon: '📱',
      title: 'Application Services',
      description: 'Mobile apps, cross-platform solutions, and app maintenance',
      features: ['Android Apps', 'App Maintenance', 'UI/UX Design'],
      color: '#b89b7b'
    }
  ];

  // Technologies data
  const technologies = [
    { name: 'React', key: 'react', color: '#61dafb' },
    { name: 'Node.js', key: 'node', color: '#68a063' },
    { name: 'Python', key: 'python', color: '#3776ab' },
    { name: 'Java', key: 'java', color: '#007396' },
    { name: 'AWS', key: 'aws', color: '#FF9900' },
    { name: 'MongoDB', key: 'mongodb', color: '#4DB33D' },
    { name: 'Flutter', key: 'flutter', color: '#42A5F5' },
    { name: 'Angular', key: 'angular', color: '#dd1b16' }
  ];

  // Load recent works and reviews
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingWorks(true);
      setLoadingReviews(true);
      
      const [worksData, reviewsData] = await Promise.all([
        getWorks(),
        getReviews()
      ]);
      
      // Create a map of work IDs to work details
      const workMap = {};
      worksData.forEach(work => {
        workMap[work.id] = {
          name: work.name,
          thumbnail: work.thumbnail
        };
      });
      
      setWorks(workMap);
      
      // Sort works by date (newest first) and take first 3
      const sortedWorks = worksData.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ).slice(0, 3);
      setRecentWorks(sortedWorks);
      
      // Sort reviews by date (newest first) and take first 3
      const sortedReviews = reviewsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 3);
      setRecentReviews(sortedReviews);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingWorks(false);
      setLoadingReviews(false);
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

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

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.dataset.id]: true }));
            
            // Start counter animation when stats section is visible
            if (entry.target.dataset.id === 'stats') {
              startCounterAnimation();
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    // Observe elements with data-id attribute
    document.querySelectorAll('[data-id]').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Counter animation function
  const startCounterAnimation = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        projects: Math.min(Math.floor(150 * progress), 150),
        clients: Math.min(Math.floor(50 * progress), 50),
        years: Math.min(Math.floor(5 * progress), 5)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
  };

  // Get code lines for tech hover animation
  const getCodeLines = (tech) => {
    const snippets = techCodeSnippets[tech] || techCodeSnippets.react;
    return snippets.map((code, index) => ({
      code,
      left: `${Math.random() * 80 + 10}%`, // Random positions across the screen
      top: `${Math.random() * 80 + 10}%`,
      delay: index * 0.2,
      duration: 4 + Math.random() * 3,
      color: technologies.find(t => t.key === tech)?.color || '#b89b7b'
    }));
  };

  // Handle tech hover
  const handleTechHover = (tech) => {
    setHoveredTech(tech);
    if (tech) {
      setCodeLines(getCodeLines(tech));
    }
  };

  // Handle service hover
  const handleServiceHover = (id) => {
    setActiveService(id);
  };

  return (
    <section className="banner" ref={bannerRef}>
      {/* Gradient Orbs */}
      <div className="gradient-orb" style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }} />
      <div className="gradient-orb" style={{ animationDelay: '-5s', transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }} />
      <div className="gradient-orb" style={{ animationDelay: '-10s', transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }} />

      {/* Particle Network */}
      <div className="particle-network" />

      {/* Binary Rain Effect */}
      <div className="binary-rain" />

      {/* Floating Shapes */}
      <div className="floating-shape floating-shape-1" style={{ transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)` }} />
      <div className="floating-shape floating-shape-2" style={{ transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)` }} />

      {/* Background Code Snippets */}
      {backgroundCodeSnippets.map((snippet, index) => (
        <div
          key={index}
          className="code-snippet"
          style={{
            left: snippet.left,
            top: snippet.top,
            animationDelay: `${snippet.delay}s`,
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        >
          {snippet.code}
        </div>
      ))}

      {/* Global Tech Code Animation - This will spread across the whole page */}
      {hoveredTech && (
        <div className="tech-code-animation">
          {codeLines.map((line, idx) => (
            <div
              key={idx}
              className="code-line"
              style={{
                left: line.left,
                top: line.top,
                animationDelay: `${line.delay}s`,
                animationDuration: `${line.duration}s`,
                color: line.color,
                borderLeftColor: line.color
              }}
            >
              {line.code}
            </div>
          ))}
        </div>
      )}

      <div className="banner-container">
        <div className="banner-content">
          {/* Text Section */}
          <div className="banner-text" data-id="text">
            <span className="title-greeting">WELCOME TO</span>
            <h1 className="banner-title">
              <span className="company-name">SHREE SHYAM</span>
              <span className="company-subname">IT SOLUTIONS</span>
            </h1>
            
            <p className="banner-description">
              Transforming ideas into powerful digital solutions with 
              <span className="highlight"> innovation </span> 
              and 
              <span className="highlight"> excellence</span>
            </p>
            
            <div className="coding-badges">
              <span className="badge">{'<html>'}</span>
              <span className="badge">{'<react/>'}</span>
              <span className="badge">{'{code}'}</span>
              <span className="badge">#python</span>
              <span className="badge">{'</>'}</span>
              <span className="badge">$ npm run</span>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="banner-stats" data-id="stats" ref={statsRef}>
            <div className="stat-card">
              <span className="stat-number">{isVisible.stats ? counters.projects : 0}+</span>
              <span className="stat-label">Projects Delivered</span>
              <span className="stat-desc">Across 10+ countries</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{isVisible.stats ? counters.clients : 0}+</span>
              <span className="stat-label">Happy Clients</span>
              <span className="stat-desc">Including startups & enterprises</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{isVisible.stats ? counters.years : 0}+</span>
              <span className="stat-label">Years Experience</span>
              <span className="stat-desc">In software development</span>
            </div>
          </div>
          
          {/* Services Section */}
          <div className="services-showcase" data-id="services">
            <h2 className="section-label">OUR SERVICES</h2>
            <div className="services-grid">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-item ${activeService === service.id ? 'active' : ''}`}
                  onMouseEnter={() => handleServiceHover(service.id)}
                  onMouseLeave={() => setActiveService(null)}
                  style={{
                    transform: activeService === service.id ? 'scale(1.02)' : 'scale(1)',
                    borderColor: activeService === service.id ? service.color : 'rgba(226, 232, 240, 0.5)'
                  }}
                >
                  <div 
                    className="service-icon-wrapper"
                    style={{
                      background: activeService === service.id ? service.color : 'linear-gradient(135deg, #b89b7b15, #d4b79c15)'
                    }}
                  >
                    <span className="service-icon">{service.icon}</span>
                  </div>
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul className="service-features">
                      {service.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Animated overlay on hover */}
                  {activeService === service.id && (
                    <div className="service-overlay">
                      <div className="service-particles">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="particle"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.2}s`,
                              background: service.color
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Works Section */}
          <div className="recent-works-showcase" data-id="works">
            <h2 className="section-label">RECENT PROJECTS</h2>
            {loadingWorks ? (
              <div className="works-loading">Loading recent works...</div>
            ) : (
              <div className="recent-works-grid">
                {recentWorks.map((work) => (
                  <Link to={`/work/${work.id}`} key={work.id} className="recent-work-card">
                    <div className="recent-work-image-wrapper">
                      <img 
                        src={work.thumbnail} 
                        alt={work.name}
                        className="recent-work-image"
                      />
                      <div className="recent-work-overlay">
                        <span className="view-details">View Details →</span>
                      </div>
                    </div>
                    <div className="recent-work-info">
                      <h3 className="recent-work-title">{work.name}</h3>
                      <p className="recent-work-description">{work.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="view-all-link">
              <Link to="/works" className="btn btn-outline">
                View All Projects
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>

          {/* Recent Reviews Section */}
          <div className="recent-reviews-showcase" data-id="reviews">
            <h2 className="section-label">CLIENT REVIEWS</h2>
            {loadingReviews ? (
              <div className="reviews-loading">Loading recent reviews...</div>
            ) : (
              <div className="recent-reviews-grid">
                {recentReviews.map((review) => (
                  <div key={review.id} className="recent-review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <h3 className="reviewer-name">{review.name}</h3>
                        {works[review.workId] && (
                          <Link to={`/work/${review.workId}`} className="review-work-link">
                            on {works[review.workId].name}
                          </Link>
                        )}
                      </div>
                      <div className="review-rating">
                        {renderStars(parseInt(review.rating))}
                      </div>
                    </div>
                    <p className="review-text">"{review.review}"</p>
                    <small className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
            <div className="view-all-link">
              <Link to="/reviews" className="btn btn-outline">
                View All Reviews
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
          
          {/* Tech Stack Section */}
          <div className="tech-stack" data-id="tech">
            <h3 className="tech-title">Technologies We Work With</h3>
            <div className="tech-icons">
              {technologies.map((tech) => (
                <div key={tech.key} style={{ position: 'relative' }}>
                  <span 
                    className="tech-item"
                    onMouseEnter={() => handleTechHover(tech.key)}
                    onMouseLeave={() => handleTechHover(null)}
                    style={{
                      backgroundColor: hoveredTech === tech.key ? tech.color : 'rgba(255, 255, 255, 0.9)',
                      color: hoveredTech === tech.key ? 'white' : '#1e293b',
                      transform: hoveredTech === tech.key ? 'translateY(-8px) scale(1.1)' : 'translateY(0) scale(1)'
                    }}
                  >
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="banner-cta" data-id="cta">
            <button className="btn btn-primary">
              <span>Start Your Project</span>
              <span className="btn-arrow">→</span>
            </button>
            <Link to="/works" className="btn btn-outline">
              <span>View Our Work</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges" data-id="trust">
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span>Fast Delivery</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <span>Secure Code</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">24/7</span>
              <span>Support</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🚀</span>
              <span>Scalable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;