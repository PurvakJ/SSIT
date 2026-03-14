import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Works from './pages/Works';
import WorkDetail from './pages/WorkDetail';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';
import About from './pages/About';
import './App.css';

// Create a wrapper component to handle keyboard shortcuts
function AppContent() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Show loader for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Shift+A (or Cmd+Shift+A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault(); // Prevent default browser behavior
        navigate('/admin');
      }
    };

    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Replace with your actual logo URL
  const logoUrl = "https://img.sanishtech.com/u/567809e3f37c3c161fece0495058318c.png"; // Add your image URL here

  // Show loader while loading
  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-content">
          {/* Logo in loader */}
          <div className="loader-logo-container">
            <img 
              src={logoUrl} 
              alt="Shree Shyam IT Solutions" 
              className="loader-logo-image"
            />
          </div>
          <div className="loader-spinner"></div>
          <div className="loader-text">
            <span className="loader-logo">SHREE SHYAM</span>
            <span className="loader-subtitle">IT SOLUTIONS</span>
          </div>
          <div className="loader-progress">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Mobile Menu Toggle */}
      <button 
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}

      {/* Vertical Navbar */}
      <nav className={`vertical-navbar ${scrolled ? 'navbar-scrolled' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-container-vertical">
          <Link to="/" className="nav-logo-vertical" onClick={() => setMobileMenuOpen(false)}>
            {/* Logo in navbar */}
            <div className="nav-logo-container">
              <img 
                src={logoUrl} 
                alt="Shree Shyam IT Solutions" 
                className="nav-logo-image"
              />
            </div>
            <div className="nav-logo-text">
              <span className="logo-shree">SHREE SHYAM</span>
              <span className="logo-it">IT SOLUTIONS</span>
            </div>
          </Link>
          
          <ul className="nav-menu-vertical">
            <li className="nav-item-vertical">
              <Link to="/" className="nav-link-vertical" onClick={() => setMobileMenuOpen(false)}>
                <span className="nav-text">Home</span>
              </Link>
            </li>
            <li className="nav-item-vertical">
              <Link to="/about" className="nav-link-vertical" onClick={() => setMobileMenuOpen(false)}>
                <span className="nav-text">About</span>
              </Link>
            </li>
            <li className="nav-item-vertical">
              <Link to="/works" className="nav-link-vertical" onClick={() => setMobileMenuOpen(false)}>
                <span className="nav-text">Our Works</span>
              </Link>
            </li>
            <li className="nav-item-vertical">
              <Link to="/reviews" className="nav-link-vertical" onClick={() => setMobileMenuOpen(false)}>
                <span className="nav-text">Reviews</span>
              </Link>
            </li>
            <li className="nav-item-vertical">
              <Link to="/contact" className="nav-link-vertical" onClick={() => setMobileMenuOpen(false)}>
                <span className="nav-text">Contact</span>
              </Link>
            </li>
          </ul>

          <div className="nav-footer">
          <div className="social-links">
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
            <p className="copyright">© 2024 SSIS</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`main-content ${mobileMenuOpen ? 'blur' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;