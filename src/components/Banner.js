import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWorks, getReviews } from '../api';
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
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const bannerRef = useRef(null);
  const statsRef = useRef(null);

  // Online image URLs for services
  const serviceImages = {
    1: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Web development
    2: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Software development
    3: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Mobile apps
  };

  // Online image URLs for technologies
  const techImages = {
    react: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    node: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    aws: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
    mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    flutter: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
    angular: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg'
  };

  // Background images carousel array
  const backgroundImages = [
    // Web Development & Coding
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Developer coding on laptop
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Code on screen with glasses
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Laptop with code
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Code editor closeup
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Laptop with code on desk
    
    // Software & Applications
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // App development mockups
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Mobile apps interface
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Multiple devices showing apps
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // App interface design
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Phone with app icons
    
    // UI/UX & Design
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Design tools and wireframes
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // UI/UX design sketches
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Design workspace with tablet
    
    // 3D Animation & Graphics
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // 3D abstract design
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Abstract technology pattern
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // 3D geometric shapes
    'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // 3D rendering workspace
    'https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Abstract digital art
    
    // Team Collaboration & Development
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Team collaboration
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Team meeting about code
    'https://images.unsplash.com-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Developers working together
    
    // Modern Tech Stack
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // React logo on screen
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Cloud computing concept
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Digital transformation
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Cybersecurity concept
    
    // Futuristic & Innovation
    'https://images.unsplash.com/photo-1488229297570-58520851e868?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Futuristic code interface
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // AI neural network
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Digital matrix
    'https://images.unsplash.com/photo-1527430253228-e93688616381?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Virtual reality concept
  ];

  // Placeholder images for works without thumbnails
  const getPlaceholderImage = (name) => {
    return `https://via.placeholder.com/400x300/ffffff/000000?text=${encodeURIComponent(name)}`;
  };

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

  // Services data with online images
  const services = [
    {
      id: 1,
      icon: '🌐',
      title: 'Web Services',
      description: 'Custom websites, web applications, and e-commerce solutions',
      features: ['Responsive Design', 'E-commerce Platforms', 'Custom Web Apps', 'Progressive Web Apps'],
      color: '#61dafb',
      image: serviceImages[1]
    },
    {
      id: 2,
      icon: '💻',
      title: 'Software Services',
      description: 'Enterprise software, desktop applications, and custom development',
      features: ['Enterprise Solutions', 'Desktop Applications', 'Custom Software', 'API Integration'],
      color: '#68a063',
      image: serviceImages[2]
    },
    {
      id: 3,
      icon: '📱',
      title: 'Application Services',
      description: 'Mobile apps, cross-platform solutions, and app maintenance',
      features: ['Android Apps', 'iOS Apps', 'App Maintenance', 'UI/UX Design'],
      color: '#b89b7b',
      image: serviceImages[3]
    }
  ];

  // Technologies data with online images
  const technologies = [
    { name: 'React', key: 'react', color: '#61dafb', image: techImages.react },
    { name: 'Node.js', key: 'node', color: '#68a063', image: techImages.node },
    { name: 'Python', key: 'python', color: '#3776ab', image: techImages.python },
    { name: 'Java', key: 'java', color: '#007396', image: techImages.java },
    { name: 'AWS', key: 'aws', color: '#FF9900', image: techImages.aws },
    { name: 'MongoDB', key: 'mongodb', color: '#4DB33D', image: techImages.mongodb },
    { name: 'Flutter', key: 'flutter', color: '#42A5F5', image: techImages.flutter }
  ];

  // Background image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Load recent works and reviews - wrapped in useCallback
  const loadData = useCallback(async () => {
    try {
      setLoadingWorks(true);
      setLoadingReviews(true);
      
      const [worksData, reviewsData] = await Promise.all([
        getWorks(),
        getReviews()
      ]);
      
      // Add placeholder images to works without thumbnails
      const enhancedWorksData = worksData.map(work => ({
        ...work,
        thumbnail: work.thumbnail || getPlaceholderImage(work.name)
      }));
      
      // Create a map of work IDs to work details
      const workMap = {};
      enhancedWorksData.forEach(work => {
        workMap[work.id] = {
          name: work.name,
          thumbnail: work.thumbnail
        };
      });
      
      setWorks(workMap);
      
      // Sort works by date (newest first) and take first 3
      const sortedWorks = enhancedWorksData.sort((a, b) => 
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
      // Set fallback data in case of error
      setRecentWorks([]);
      setRecentReviews([]);
    } finally {
      setLoadingWorks(false);
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Render stars for rating
  const renderStars = (rating) => {
    const numRating = parseInt(rating) || 0;
    return '★'.repeat(numRating) + '☆'.repeat(5 - numRating);
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
      left: `${Math.random() * 80 + 10}%`,
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
      {/* Background Image Carousel */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`bg-carousel-image ${index === currentBgIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${image})`,
          }}
        />
      ))}
      
      {/* Dark overlay for better text visibility */}
      <div className="bg-overlay" />

      {/* Gradient Orbs */}
      <div 
        className="gradient-orb" 
        style={{ 
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` 
        }} 
      />
      <div 
        className="gradient-orb" 
        style={{ 
          animationDelay: '-5s', 
          transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` 
        }} 
      />
      <div 
        className="gradient-orb" 
        style={{ 
          animationDelay: '-10s', 
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` 
        }} 
      />

      {/* Particle Network */}
      <div className="particle-network" />

      {/* Binary Rain Effect */}
      <div className="binary-rain" />

      {/* Floating Shapes */}
      <div 
        className="floating-shape floating-shape-1" 
        style={{ 
          transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)` 
        }} 
      />
      <div 
        className="floating-shape floating-shape-2" 
        style={{ 
          transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)` 
        }} 
      />

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

      {/* Global Tech Code Animation */}
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
          
          {/* Services Section with Images */}
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
                    borderColor: activeService === service.id ? service.color : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="service-image-wrapper">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="service-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200/ffffff/000000?text=Service+Image';
                      }}
                    />
                    <div 
                      className="service-icon-wrapper"
                      style={{
                        background: activeService === service.id ? service.color : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))'
                      }}
                    >
                      <span className="service-icon">{service.icon}</span>
                    </div>
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

          {/* Recent Works Section - Only show if there are works */}
{/* Recent Works Section - Only show if there are works */}
{!loadingWorks && recentWorks.length > 0 && (
  <div className="recent-works-showcase" data-id="works">
    <h2 className="section-label">RECENT PROJECTS</h2>
    <div className="recent-works-list">
      {recentWorks.map((work, index) => (
        <div key={work.id} className={`recent-work-item ${index % 2 === 1 ? 'reverse' : ''}`}>
          <div className="recent-work-image-container">
            <Link to={`/work/${work.id}`} className="recent-work-image-link">
              <img 
                src={work.thumbnail} 
                alt={work.name}
                className="recent-work-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = getPlaceholderImage(work.name);
                }}
              />
              <div className="recent-work-image-overlay">
                <span className="view-project">View Project</span>
              </div>
            </Link>
          </div>
          
          <div className="recent-work-details">
            <h3 className="recent-work-title">{work.name}</h3>
            <p className="recent-work-description">{work.description || 'No description available'}</p>
            
            <div className="recent-work-meta">
              {work.technologies && work.technologies.length > 0 && (
                <div className="work-technologies">
                  {work.technologies.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="work-tech-badge">{tech}</span>
                  ))}
                  {work.technologies.length > 3 && (
                    <span className="work-tech-badge">+{work.technologies.length - 3}</span>
                  )}
                </div>
              )}
              
              <div className="recent-work-actions">
                <Link to={`/work/${work.id}`} className="work-details-btn">
                  View Details
                  <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="view-all-link">
      <Link to="/works" className="btn btn-outline">
        View All Projects
        <span className="btn-arrow">→</span>
      </Link>
    </div>
  </div>
)}

          {/* Recent Reviews Section - Only show if there are reviews */}
          {!loadingReviews && recentReviews.length > 0 && (
            <div className="recent-reviews-showcase" data-id="reviews">
              <h2 className="section-label">CLIENT REVIEWS</h2>
              <div className="recent-reviews-grid">
                {recentReviews.map((review) => (
                  <div key={review.id} className="recent-review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <h3 className="reviewer-name">{review.name || 'Anonymous'}</h3>
                        {works[review.workId] && (
                          <Link to={`/work/${review.workId}`} className="review-work-link">
                            on {works[review.workId].name}
                          </Link>
                        )}
                      </div>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-text">"{review.review || 'No review text'}"</p>
                    <small className="review-date">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                    </small>
                  </div>
                ))}
              </div>
              <div className="view-all-link">
                <Link to="/reviews" className="btn btn-outline">
                  View All Reviews
                  <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
          )}
          
          {/* Tech Stack Section with Images */}
          <div className="tech-stack" data-id="tech">
            <h3 className="tech-title">Technologies We Work With</h3>
            <div className="tech-icons">
              {technologies.map((tech) => (
                <div key={tech.key} className="tech-item-wrapper">
                  <div 
                    className={`tech-item ${hoveredTech === tech.key ? 'active' : ''}`}
                    onMouseEnter={() => handleTechHover(tech.key)}
                    onMouseLeave={() => handleTechHover(null)}
                    style={{
                      backgroundColor: hoveredTech === tech.key ? tech.color : 'rgba(255, 255, 255, 0.95)',
                      color: hoveredTech === tech.key ? 'white' : '#000000',
                      transform: hoveredTech === tech.key ? 'translateY(-8px) scale(1.1)' : 'translateY(0) scale(1)'
                    }}
                  >
                    <img 
                      src={tech.image} 
                      alt={tech.name}
                      className="tech-icon-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/24/000000/ffffff?text=Tech';
                      }}
                    />
                    <span className="tech-name">{tech.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="banner-cta" data-id="cta">
            <Link to="/contact" className="btn btn-primary">
              <span>Start Your Project</span>
              <span className="btn-arrow">→</span>
            </Link>
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