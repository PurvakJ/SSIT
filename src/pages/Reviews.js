import React, { useState, useEffect } from 'react';
import { getReviews, getWorks } from '../api';
import { Link } from 'react-router-dom';
import './Pages.css';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [works, setWorks] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterWork, setFilterWork] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewsData, worksData] = await Promise.all([
        getReviews(),
        getWorks()
      ]);
      
      // Create a map of work IDs to work details
      const workMap = {};
      worksData.forEach(work => {
        workMap[work.id] = {
          name: work.name,
          thumbnail: work.thumbnail,
          category: work.category || 'Web Development'
        };
      });
      
      // Sort reviews by date (newest first)
      const sortedReviews = reviewsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setWorks(workMap);
      setReviews(sortedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getAverageRating = (workId) => {
    const workReviews = reviews.filter(r => r.workId === workId);
    if (workReviews.length === 0) return 0;
    const sum = workReviews.reduce((acc, r) => acc + parseInt(r.rating), 0);
    return (sum / workReviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const rating = parseInt(r.rating);
      distribution[5 - rating]++;
    });
    return distribution;
  };

  // Filter and sort reviews
  const getFilteredAndSortedReviews = () => {
    let filtered = filterWork === 'all' 
      ? reviews 
      : reviews.filter(r => r.workId === filterWork);

    // Apply search
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(review => 
        review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (works[review.workId] && works[review.workId].name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        filtered.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
        break;
      case 'lowest':
        filtered.sort((a, b) => parseInt(a.rating) - parseInt(b.rating));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredReviews = getFilteredAndSortedReviews();
  const ratingDistribution = getRatingDistribution();

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading reviews...</p>
    </div>
  );

  return (
    <div className="reviews-page">
      {/* Hero Section */}
      <div className="reviews-hero">
        <div className="reviews-hero-content">
          <h1 className="reviews-hero-title">
            <span className="hero-subtitle">CLIENT FEEDBACK</span>
            <span className="hero-main">Customer Reviews</span>
          </h1>
          <p className="reviews-hero-description">
            See what our clients say about our work. We value every feedback and strive for excellence.
          </p>
        </div>
      </div>

      <div className="reviews-container">
        {/* Stats Overview */}
        <div className="reviews-stats-overview">
          <div className="stat-card-large">
            <span className="stat-number-large">{reviews.length}</span>
            <span className="stat-label-large">Total Reviews</span>
          </div>
          <div className="stat-card-large">
            <span className="stat-number-large">{new Set(reviews.map(r => r.workId)).size}</span>
            <span className="stat-label-large">Works Reviewed</span>
          </div>
          <div className="stat-card-large">
            <span className="stat-number-large">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + parseInt(r.rating), 0) / reviews.length).toFixed(1)
                : '0.0'}
            </span>
            <span className="stat-label-large">Average Rating</span>
          </div>
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="rating-distribution-card">
            <h3>Rating Distribution</h3>
            <div className="rating-distribution-bars">
              {[5,4,3,2,1].map((star, index) => {
                const count = ratingDistribution[5-star] || 0;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="distribution-bar-item">
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
        )}

        {/* Filter and Search Toolbar */}
        <div className="reviews-toolbar">
          <div className="filter-group">
            <select 
              value={filterWork} 
              onChange={(e) => setFilterWork(e.target.value)}
              className="filter-select-enhanced"
            >
              <option value="all">All Works</option>
              {Object.keys(works).map(workId => (
                <option key={workId} value={workId}>
                  {works[workId].name} ({reviews.filter(r => r.workId === workId).length})
                </option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select-enhanced"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="search-box-enhanced">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-enhanced"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Results Count */}
        <div className="reviews-results">
          <p>Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}</p>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="reviews-grid-enhanced">
            {filteredReviews.map(review => (
              <div key={review.id} className="review-card-enhanced">
                {works[review.workId] && (
                  <Link to={`/work/${review.workId}`} className="review-work-banner">
                    <img 
                      src={works[review.workId].thumbnail} 
                      alt={works[review.workId].name}
                      className="review-work-thumbnail-enhanced"
                    />
                    <div className="review-work-overlay">
                      <span className="review-work-category">{works[review.workId].category}</span>
                      <span className="review-work-name">{works[review.workId].name}</span>
                    </div>
                  </Link>
                )}
                
                <div className="review-content-wrapper">
                  <div className="review-header-enhanced">
                    <div className="reviewer-avatar">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="reviewer-info">
                      <h3 className="reviewer-name-enhanced">{review.name}</h3>
                      <div className="reviewer-rating">
                        {renderStars(parseInt(review.rating))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="review-text-enhanced">"{review.review}"</p>
                  
                  <div className="review-footer">
                    <small className="review-date-enhanced">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </small>
                    <Link to={`/work/${review.workId}`} className="view-work-link">
                      View Project →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews-enhanced">
            <div className="no-reviews-icon">💬</div>
            <h3>No reviews found</h3>
            <p>Try adjusting your filters or search term</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setFilterWork('all');
                setSortBy('newest');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Work-wise Statistics Section */}
        <div className="work-statistics-section">
          <h2 className="section-title-enhanced">Work-wise Statistics</h2>
          <div className="work-stats-grid">
            {Object.keys(works).map(workId => {
              const workReviews = reviews.filter(r => r.workId === workId);
              if (workReviews.length === 0) return null;
              
              return (
                <Link to={`/work/${workId}`} key={workId} className="work-stat-card">
                  <div className="work-stat-image">
                    <img src={works[workId].thumbnail} alt={works[workId].name} />
                  </div>
                  <div className="work-stat-details">
                    <h4>{works[workId].name}</h4>
                    <div className="work-stat-meta">
                      <span className="work-review-count">
                        📝 {workReviews.length} {workReviews.length === 1 ? 'review' : 'reviews'}
                      </span>
                      <span className="work-rating">
                        ⭐ {getAverageRating(workId)}/5
                      </span>
                    </div>
                    <div className="work-rating-bars">
                      {[5,4,3,2,1].map(star => {
                        const count = workReviews.filter(r => parseInt(r.rating) === star).length;
                        const percentage = (count / workReviews.length) * 100;
                        return (
                          <div key={star} className="work-rating-bar">
                            <span className="bar-label">{star}★</span>
                            <div className="bar-container">
                              <div 
                                className="bar-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="bar-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="reviews-cta">
          <h2>Have you worked with us?</h2>
          <p>We'd love to hear about your experience</p>
          <Link to="/works" className="btn btn-primary btn-large">
            Browse Works to Review
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Reviews;