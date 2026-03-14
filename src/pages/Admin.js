import React, { useState, useEffect } from 'react';
import { 
  getWorks, addWork, updateWork, deleteWork, 
  getReviews, deleteReview, getContacts, 
  formatUrl, getDomainFromUrl 
} from '../api';
import './Pages.css';

// Admin credentials
const ADMIN_EMAIL = "purvakjindal2102@gmail.com";
const ADMIN_PASSWORD = "purvak";

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  
  const [works, setWorks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('works');
  const [editingWork, setEditingWork] = useState(null);
  const [urlPreview, setUrlPreview] = useState({ viewLink: '', videoLink: '' });
  const [workForm, setWorkForm] = useState({
    name: '',
    viewLink: '',
    description: '',
    thumbnail: '',
    videoLink: ''
  });

  // Check for existing admin session on component mount
  useEffect(() => {
    const adminSession = sessionStorage.getItem('adminAuthenticated');
    if (adminSession === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  // Work type labels for display
  const workTypeLabels = {
    'custom-web': 'Custom Website',
    'ecommerce': 'E-commerce Website',
    'portfolio': 'Portfolio Website',
    'promotional': 'Promotional Website',
    'software': 'Software',
    'application': 'Application',
    'other': 'Other'
  };

  const loadData = async () => {
    try {
      const [worksData, reviewsData, contactsData] = await Promise.all([
        getWorks(),
        getReviews(),
        getContacts()
      ]);
      setWorks(worksData);
      setReviews(reviewsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      loadData();
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setLoginForm({ email: '', password: '' });
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format URLs before saving
      const formattedData = {
        ...workForm,
        viewLink: formatUrl(workForm.viewLink),
        videoLink: workForm.videoLink ? formatUrl(workForm.videoLink) : ''
      };

      if (editingWork) {
        await updateWork({ ...formattedData, id: editingWork.id });
      } else {
        await addWork(formattedData);
      }
      await loadData();
      resetWorkForm();
      alert(`Work ${editingWork ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving work:', error);
    }
  };

  const handleDeleteWork = async (id) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      try {
        await deleteWork({ id });
        await loadData();
        alert('Work deleted successfully!');
      } catch (error) {
        console.error('Error deleting work:', error);
      }
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview({ id });
        await loadData();
        alert('Review deleted successfully!');
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const resetWorkForm = () => {
    setWorkForm({
      name: '',
      viewLink: '',
      description: '',
      thumbnail: '',
      videoLink: ''
    });
    setUrlPreview({ viewLink: '', videoLink: '' });
    setEditingWork(null);
  };

  const startEditing = (work) => {
    setEditingWork(work);
    setWorkForm({
      name: work.name,
      viewLink: work.viewLink,
      description: work.description,
      thumbnail: work.thumbnail,
      videoLink: work.videoLink || ''
    });
    setUrlPreview({
      viewLink: work.viewLink,
      videoLink: work.videoLink || ''
    });
  };

  const handleUrlChange = (field, value) => {
    setWorkForm({...workForm, [field]: value});
    if (value) {
      try {
        const formatted = formatUrl(value);
        setUrlPreview({...urlPreview, [field]: formatted});
      } catch {
        setUrlPreview({...urlPreview, [field]: 'Invalid URL'});
      }
    } else {
      setUrlPreview({...urlPreview, [field]: ''});
    }
  };

  const getWorkDetails = (workId) => {
    return works.find(w => w.id === workId) || null;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="login-container">
          <h1>Admin Login</h1>
          <p className="login-subtitle">Please enter your credentials to access the admin panel</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={handleLoginInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={handleLoginInputChange}
                required
              />
            </div>

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-large">
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If authenticated, show admin dashboard
  return (
    <div className="page-container admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'works' ? 'active' : ''}`}
          onClick={() => setActiveTab('works')}
        >
          Manage Works
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Manage Reviews
        </button>
        <button 
          className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          View Contacts
        </button>
      </div>

      {activeTab === 'works' && (
        <div className="admin-section">
          <h2>{editingWork ? 'Edit Work' : 'Add New Work'}</h2>
          <form onSubmit={handleWorkSubmit} className="admin-form">
            <div className="form-group">
              <label>Work Name:</label>
              <input
                type="text"
                placeholder="e.g., SSIT"
                value={workForm.name}
                onChange={(e) => setWorkForm({...workForm, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>View Link (Website URL):</label>
              <input
                type="text"
                placeholder="e.g., www.ssit.com or https://ssit.com"
                value={workForm.viewLink}
                onChange={(e) => handleUrlChange('viewLink', e.target.value)}
                required
              />
              {urlPreview.viewLink && urlPreview.viewLink !== 'Invalid URL' && (
                <small className="url-preview">
                  Preview: <a href={urlPreview.viewLink} target="_blank" rel="noopener noreferrer">{urlPreview.viewLink}</a>
                </small>
              )}
              {urlPreview.viewLink === 'Invalid URL' && (
                <small className="url-error">Invalid URL format</small>
              )}
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                placeholder="Describe the work/project..."
                value={workForm.description}
                onChange={(e) => setWorkForm({...workForm, description: e.target.value})}
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Thumbnail Image URL:</label>
              <input
                type="text"
                placeholder="e.g., https://example.com/image.jpg"
                value={workForm.thumbnail}
                onChange={(e) => setWorkForm({...workForm, thumbnail: e.target.value})}
                required
              />
              {workForm.thumbnail && (
                <div className="thumbnail-preview">
                  <img src={workForm.thumbnail} alt="Preview" style={{maxWidth: '200px', maxHeight: '100px'}} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Video Link (optional):</label>
              <input
                type="text"
                placeholder="e.g., https://example.com/video.mp4"
                value={workForm.videoLink}
                onChange={(e) => handleUrlChange('videoLink', e.target.value)}
              />
              {urlPreview.videoLink && urlPreview.videoLink !== 'Invalid URL' && (
                <small className="url-preview">
                  Preview: {urlPreview.videoLink}
                </small>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingWork ? 'Update Work' : 'Add Work'}
              </button>
              {editingWork && (
                <button type="button" onClick={resetWorkForm} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2>Existing Works</h2>
          <div className="works-list">
            {works.map(work => (
              <div key={work.id} className="work-item">
                <img src={work.thumbnail} alt={work.name} className="work-thumb-small" />
                <div className="work-details">
                  <h3>{work.name}</h3>
                  <p className="work-description">{work.description}</p>
                  <p className="work-link">
                    <small>Website: <a href={formatUrl(work.viewLink)} target="_blank" rel="noopener noreferrer">
                      {getDomainFromUrl(work.viewLink)}
                    </a></small>
                  </p>
                  {work.videoLink && (
                    <p className="work-link">
                      <small>Video: <a href={formatUrl(work.videoLink)} target="_blank" rel="noopener noreferrer">Watch Preview</a></small>
                    </p>
                  )}
                </div>
                <div className="work-actions">
                  <button onClick={() => startEditing(work)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDeleteWork(work.id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="admin-section">
          <h2>Manage Reviews</h2>
          <div className="reviews-admin-list">
            {reviews.length > 0 ? (
              reviews.map(review => {
                const work = getWorkDetails(review.workId);
                return (
                  <div key={review.id} className="review-admin-card">
                    {work && (
                      <div className="review-work-header">
                        <img 
                          src={work.thumbnail} 
                          alt={work.name}
                          className="review-work-thumbnail"
                        />
                        <div className="review-work-info">
                          <h3>{work.name}</h3>
                          <a href={formatUrl(work.viewLink)} target="_blank" rel="noopener noreferrer">
                            {getDomainFromUrl(work.viewLink)}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="review-content">
                      <div className="reviewer-info">
                        <strong>{review.name}</strong>
                        <span className="rating">{renderStars(parseInt(review.rating))}</span>
                      </div>
                      <p className="review-text">{review.review}</p>
                      <div className="review-meta">
                        <small>Work ID: {review.workId}</small>
                        <small>Date: {formatDate(review.createdAt)}</small>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="btn-delete"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-data">No reviews yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="admin-section">
          <h2>Contact Submissions</h2>
          <div className="contacts-list">
            {contacts.length > 0 ? (
              contacts.map(contact => (
                <div key={contact.id} className="contact-item">
                  <h3>{contact.name}</h3>
                  <div className="contact-details">
                    <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                    <p><strong>Mobile:</strong> {contact.mobile}</p>
                    <p><strong>Work Type:</strong> {workTypeLabels[contact.workType] || contact.workType}</p>
                    <p><strong>Message:</strong> {contact.message}</p>
                    <p><small>Submitted: {formatDate(contact.createdAt)}</small></p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No contact submissions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;