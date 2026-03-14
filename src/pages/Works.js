import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWorks, formatUrl, getDomainFromUrl } from '../api';
import './Pages.css';

function Works() {
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorks();
  }, []);

  const filterWorks = useCallback(() => {
    let filtered = [...works];
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(work => 
        work.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredWorks(filtered);
  }, [works, searchTerm]);

  useEffect(() => {
    filterWorks();
  }, [filterWorks]);

  const loadWorks = async () => {
    try {
      const data = await getWorks();
      setWorks(data);
    } catch (error) {
      console.error('Error loading works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewWork = async (work) => {
    const formattedViewLink = formatUrl(work.viewLink);
    
    if (work.videoLink) {
      setPlayingVideo({
        work: work,
        videoLink: formatUrl(work.videoLink),
        viewLink: formattedViewLink
      });
    } else {
      window.open(formattedViewLink, '_blank', 'noopener,noreferrer');
    }
  };

  const closeVideoPlayer = () => {
    setPlayingVideo(null);
  };

  const handleVideoEnded = () => {
    if (playingVideo) {
      window.open(playingVideo.viewLink, '_blank', 'noopener,noreferrer');
      closeVideoPlayer();
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading amazing works...</p>
    </div>
  );

  return (
    <div className="works-page">
      {/* Hero Section */}
      <div className="works-hero">
        <div className="works-hero-content">
          <h1 className="works-hero-title">
            <span className="hero-subtitle">OUR PORTFOLIO</span>
            <span className="hero-main">Featured Works</span>
          </h1>
          <p className="works-hero-description">
            Explore our collection of innovative digital solutions that have helped businesses 
            grow and succeed in the digital landscape.
          </p>
        </div>
      </div>

      <div className="works-container">
        {/* Filter and Search Section */}
        <div className="works-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Results Count */}
        <div className="works-results">
          <p>Showing {filteredWorks.length} {filteredWorks.length === 1 ? 'project' : 'projects'}</p>
        </div>

        {/* Works Grid */}
        {filteredWorks.length > 0 ? (
          <div className="works-grid-enhanced">
            {filteredWorks.map((work) => (
              <div key={work.id} className="work-card-enhanced">
                <div className="work-card-image-wrapper">
                  <img 
                    src={work.thumbnail} 
                    alt={work.name} 
                    className="work-card-image" 
                  />
                  <div className="work-card-overlay">
                    <span className="work-category">{work.category || 'Web'}</span>
                    <button 
                      onClick={() => handleViewWork(work)}
                      className="work-preview-btn"
                    >
                      {work.videoLink ? '▶ Watch Preview' : '🔗 Visit Site'}
                    </button>
                  </div>
                </div>
                
                <div className="work-card-content">
                  <h3 className="work-card-title">{work.name}</h3>
                  <p className="work-card-description">{work.description}</p>
                  
                  <div className="work-card-meta">
                    <div className="work-domain">
                      <span className="meta-icon">🌐</span>
                      <small>{getDomainFromUrl(work.viewLink)}</small>
                    </div>
                    
                    {work.technologies && (
                      <div className="work-tech-tags">
                        {work.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="tech-tag-small">{tech}</span>
                        ))}
                        {work.technologies.length > 3 && (
                          <span className="tech-tag-small">+{work.technologies.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="work-card-actions">
                    <button 
                      onClick={() => handleViewWork(work)}
                      className="btn btn-primary btn-small"
                    >
                      {work.videoLink ? 'Preview & Visit' : 'Visit Website'}
                    </button>
                    <Link 
                      to={`/work/${work.id}`} 
                      className="btn btn-outline btn-small"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-works-found">
            <div className="no-works-icon">🔍</div>
            <h3>No projects found</h3>
            <p>Try adjusting your search to find what you're looking for.</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="works-stats">
          <div className="stats-card">
            <span className="stats-number">{works.length}</span>
            <span className="stats-label">Total Projects</span>
          </div>
          <div className="stats-card">
            <span className="stats-number">{works.filter(w => w.videoLink).length}</span>
            <span className="stats-label">With Previews</span>
          </div>
          <div className="stats-card">
            <span className="stats-number">
              {[...new Set(works.map(w => w.category))].filter(Boolean).length}
            </span>
            <span className="stats-label">Categories</span>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="video-modal" onClick={closeVideoPlayer}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{playingVideo.work.name} - Preview</h3>
              <button className="close-btn" onClick={closeVideoPlayer}>&times;</button>
            </div>
            <div className="video-container">
              <video 
                controls 
                autoPlay 
                onEnded={handleVideoEnded}
                className="video-player"
              >
                <source src={playingVideo.videoLink} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="video-note">Video will automatically open the website when finished</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Works;