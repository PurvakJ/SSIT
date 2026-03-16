import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorks, addReview, getReviews, formatUrl, getDomainFromUrl } from '../api';
import './workdetails.css';

function WorkDetail() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewForm, setReviewForm] = useState({
    name: '',
    review: '',
    rating: 5
  });
  const [, setHoverRating] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [worksData, allReviews] = await Promise.all([
        getWorks(),
        getReviews()
      ]);
      
      const foundWork = worksData.find(w => w.id === id);
      setWork(foundWork);
      
      const workReviews = allReviews
        .filter(r => r.workId === id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setReviews(workReviews);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview({
        ...reviewForm,
        workId: id
      });
      alert('Review submitted successfully!');
      setReviewForm({ name: '', review: '', rating: 5 });
      setHoverRating(0);
      loadData();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + parseInt(r.rating), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleVisitSite = () => {
    if (work) {
      window.open(formatUrl(work.viewLink), '_blank', 'noopener,noreferrer');
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, interactive = true }) => {
    const [localHover, setLocalHover] = useState(0);
    
    const handleMouseEnter = (index) => {
      if (interactive) setLocalHover(index);
    };
    
    const handleMouseLeave = () => {
      if (interactive) setLocalHover(0);
    };
    
    const handleClick = (index) => {
      if (interactive && onRatingChange) {
        onRatingChange(index);
      }
    };
    
    const displayRating = interactive && localHover > 0 ? localHover : rating;
    
    return (
      <div className="star-rating-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${interactive ? 'interactive' : ''} ${star <= displayRating ? 'filled' : ''}`}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(star)}
          >
            ★
          </span>
        ))}
        {interactive && (
          <span className="rating-text">
            {rating} out of 5 stars
          </span>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading project details...</p>
    </div>
  );
  
  if (!work) return (
    <div className="error-container">
      <div className="error-icon">😕</div>
      <h2>Project Not Found</h2>
      <p>The project you're looking for doesn't exist or has been removed.</p>
      <Link to="/works" className="btn btn-primary">View All Projects</Link>
    </div>
  );

  return (
    <div className="work-detail-page">
      {/* Hero Section */}
      <div className="work-detail-hero" style={{ backgroundImage: `url(${work.thumbnail})` }}>
        <div className="work-detail-hero-overlay">
          <div className="work-detail-hero-content">
            <span className="work-detail-category">{work.category || 'Web Development'}</span>
            <h1 className="work-detail-title">{work.name}</h1>
            <div className="work-detail-meta">
              <div className="work-detail-domain">
                <span>🌐</span>
                <span>{getDomainFromUrl(work.viewLink)}</span>
              </div>
              <div className="work-detail-rating">
                <span>⭐</span>
                <span>{getAverageRating()} ({reviews.length} reviews)</span>
              </div>
            </div>
            <div className="work-detail-actions">
              <button onClick={handleVisitSite} className="btn btn-primary btn-large">
                <span>Visit Website</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="work-detail-container">
        {/* Tabs Navigation */}
        <div className="work-detail-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Project Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="work-detail-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="work-description-section">
                <h2>About This Project</h2>
                <p className="work-full-description">{work.description}</p>
              </div>

              {work.technologies && (
                <div className="work-technologies-section">
                  <h2>Technologies Used</h2>
                  <div className="tech-tags-large">
                    {work.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-tag-large">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {work.features && (
                <div className="work-features-section">
                  <h2>Key Features</h2>
                  <ul className="features-list-enhanced">
                    {work.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-bullet">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              {/* Rating Summary */}
              <div className="rating-summary">
                <div className="average-rating-large">
                  <span className="average-number">{getAverageRating()}</span>
                  <span className="average-label">out of 5</span>
                  <div className="average-stars">
                    <StarRating 
                      rating={Math.round(getAverageRating())} 
                      interactive={false}
                    />
                  </div>
                  <span className="total-reviews">Based on {reviews.length} reviews</span>
                </div>
                
                <div className="rating-distribution">
                  {[5,4,3,2,1].map((star) => {
                    const count = reviews.filter(r => parseInt(r.rating) === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="distribution-row">
                        <span className="star-label">{star} ★</span>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="star-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list-enhanced">
                <h3>Customer Reviews</h3>
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={review.id || index} className="review-card-enhanced">
                      <div className="review-card-header">
                        <div className="reviewer-avatar">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="reviewer-info">
                          <strong className="reviewer-name">{review.name}</strong>
                          <div className="reviewer-rating">
                            <StarRating 
                              rating={parseInt(review.rating)} 
                              interactive={false}
                            />
                          </div>
                        </div>
                        <small className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </small>
                      </div>
                      <p className="review-card-content">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews-enhanced">
                    <div className="no-reviews-icon">💬</div>
                    <h4>No reviews yet</h4>
                    <p>Be the first to share your experience with this project!</p>
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <div className="add-review-section-enhanced">
                <h3>Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="review-form-enhanced">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                      required
                      className="form-input-enhanced"
                    />
                  </div>
                  
                  <div className="star-rating-field">
                    <label>Your Rating:</label>
                    <StarRating 
                      rating={reviewForm.rating}
                      onRatingChange={(newRating) => setReviewForm({...reviewForm, rating: newRating})}
                    />
                  </div>
                  
                  <textarea
                    placeholder="Share your experience with this project..."
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})}
                    required
                    className="form-textarea-enhanced"
                    rows="4"
                  />
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-tab">
              <div className="project-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Project Type</span>
                  <span className="detail-value">{work.category || 'Web Development'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Client</span>
                  <span className="detail-value">{work.client || 'Confidential'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Year</span>
                  <span className="detail-value">{work.year || '2024'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{work.duration || '3 months'}</span>
                </div>
              </div>

              <div className="project-links">
                <h3>Project Links</h3>
                <div className="links-list">
                  <a 
                    href={formatUrl(work.viewLink)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <span>🔗</span>
                    Live Website
                  </a>
                  {work.githubLink && (
                    <a 
                      href={formatUrl(work.githubLink)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      <span>📁</span>
                      Source Code
                    </a>
                  )}
                  {work.caseStudyLink && (
                    <a 
                      href={formatUrl(work.caseStudyLink)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      <span>📄</span>
                      Case Study
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkDetail;

