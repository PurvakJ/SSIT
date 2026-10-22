import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import './App.css';

/* ==========================================================================
   API
   ========================================================================== */

const API =
  'https://script.google.com/macros/s/AKfycbww7M7cnscSWC6qJL2EpAQOUmQbwsvFFoCxK7mHeSklpEA-1CH40JjQRCm6WmEKqTEo5g/exec';

function formatUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

function getDomainFromUrl(url) {
  if (!url) return '';
  try {
    return new URL(formatUrl(url)).hostname;
  } catch {
    return url;
  }
}

const apiGet = async (action) => (await fetch(`${API}?action=${action}`)).json();
const apiPost = (action, data) =>
  fetch(API, { method: 'POST', body: JSON.stringify({ ...data, action }) });

const getWorks = () => apiGet('getWorks');
const getReviews = () => apiGet('getReviews');
const getContacts = () => apiGet('getContacts');
const addReview = (d) => apiPost('addReview', d);
const addContact = (d) => apiPost('addContact', d);
const addWork = (d) => apiPost('addWork', d);
const updateWork = (d) => apiPost('updateWork', d);
const deleteWork = (d) => apiPost('deleteWork', d);
const deleteReview = (d) => apiPost('deleteReview', d);

/* ==========================================================================
   Shared constants & small components
   ========================================================================== */

const LOGO_URL = 'https://i.postimg.cc/0QHSjnK6/611276591-17933684004156896-6444722502286434287-n-1-removebg-preview.png';
const LINKEDIN_URL = 'https://www.linkedin.com/in/purvak-jindal-6741682a1/';
const INSTAGRAM_URL = 'https://www.instagram.com/shree_shyam_it_solutions/';

const ADMIN_EMAIL = 'purvakjindal2102@gmail.com';
const ADMIN_PASSWORD = 'purvak';

const unsplash = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const hideOnError = (e) => { e.target.style.visibility = 'hidden'; };

const avg = (list) =>
  list.length ? (list.reduce((s, r) => s + parseInt(r.rating, 10), 0) / list.length).toFixed(1) : '0.0';

const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/works', label: 'Our Works' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
];

function SocialLinks() {
  return (
    <div className="social-links">
      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
        </svg>
      </a>
    </div>
  );
}

function BrandName({ className = '' }) {
  return (
    <span className={`brand-name ${className}`}>
      <span className="brand-1">SHREE SHYAM</span>
      <span className="brand-2">IT SOLUTIONS</span>
    </span>
  );
}

function PageHero({ sub, title, desc, image }) {
  return (
    <header className={`hero ${image ? 'has-image' : ''}`} style={image ? { '--hero-img': `url(${image})` } : undefined}>
      <div className="hero-inner">
        <span className="hero-sub">{sub}</span>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-desc">{desc}</p>
      </div>
    </header>
  );
}

function Loading({ text }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

function EmptyState({ title, text, onClear }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
      {onClear && (
        <button className="btn btn-outline" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}

function Stars({ rating, onChange, size }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const shown = interactive && hover > 0 ? hover : rating;
  return (
    <span className={`stars ${size || ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${interactive ? 'interactive' : ''} ${n <= shown ? 'filled' : ''}`}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange(n)}
        >
          ★
        </span>
      ))}
      {interactive && <span className="rating-text">{rating} out of 5</span>}
    </span>
  );
}

function RatingBars({ reviews }) {
  return (
    <div className="rating-bars">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => parseInt(r.rating, 10) === star).length;
        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
        return (
          <div key={star} className="bar-row">
            <span className="bar-label">{star} ★</span>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function SectionHead({ eyebrow, title, desc }) {
  return (
    <div className="section-head">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      <span className="rule" />
      {desc && <p>{desc}</p>}
    </div>
  );
}

/* ==========================================================================
   Footer
   ========================================================================== */

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3 className="footer-logo"><BrandName /></h3>
          <p className="footer-text">
            Creating innovative digital solutions that help businesses grow and succeed in the modern world.
          </p>
          <SocialLinks />
        </div>
        <div>
          <h4>Quick links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/works">Our Works</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li>Custom Websites</li>
            <li>E-commerce Stores</li>
            <li>Web Applications</li>
            <li>Mobile Apps</li>
            <li>Software Development</li>
          </ul>
        </div>
        <div>
          <h4>Contact us</h4>
          <p>Email: itsolutionsshreeshyam@gmail.com</p>
          <p>Phone: +91 62840-86208</p>
          <p>Phone: +91 81468-42099</p>
          <p>Phone: +91 82682-64000</p>
          <p>Mon – Sat: 9:00 AM – 7:00 PM</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SHREE SHYAM IT SOLUTIONS. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ==========================================================================
   Home
   ========================================================================== */

const devicon = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}-original.svg`;

const HOME_IMG = {
  heroMain: unsplash('1460925895917-afdab827c52f', 1920),
  heroSub: unsplash('1522071820081-009f0129c71c', 600),
  why: unsplash('1519389950473-47ba0277781c', 1000),
  cta: unsplash('1531482615713-2afd69097998', 1600),
};

const TECHNOLOGIES = [
  { name: 'React', image: devicon('react/react') },
  { name: 'Node.js', image: devicon('nodejs/nodejs') },
  { name: 'Python', image: devicon('python/python') },
  { name: 'Java', image: devicon('java/java') },
  { name: 'AWS', image: devicon('amazonwebservices/amazonwebservices') },
  { name: 'MongoDB', image: devicon('mongodb/mongodb') },
  { name: 'Flutter', image: devicon('flutter/flutter') },
  { name: 'Your stack', image: null },
];

const MARQUEE_WORDS = [
  'Websites', 'E-commerce', 'Mobile Apps', 'Custom Software', 'UI / UX Design', 'API Integration',
  'Cloud Hosting', 'SEO', 'Maintenance', 'Web Applications',
];

const SERVICES = [
  { title: 'Web Services', img: unsplash('1547658719-da2b51169166'), description: 'Custom websites, web applications and e-commerce solutions.', features: ['Responsive design', 'E-commerce platforms', 'Custom web apps', 'Progressive web apps'] },
  { title: 'Software Services', img: unsplash('1555066931-4365d14bab8c'), description: 'Enterprise software, desktop applications and custom development.', features: ['Enterprise solutions', 'Desktop applications', 'Custom software', 'API integration'] },
  { title: 'Application Services', img: unsplash('1512941937669-90a1b58e7e9c'), description: 'Mobile apps, cross-platform solutions and app maintenance.', features: ['Android apps', 'iOS apps', 'App maintenance', 'UI/UX design'] },
];

const PROCESS = [
  { title: 'Discover', text: 'We listen to your goals, audience and budget, then agree on scope and timeline.' },
  { title: 'Design', text: 'Wireframes and visual designs you can review and approve before any code is written.' },
  { title: 'Develop', text: 'Clean, tested code with regular progress demos so there are no surprises.' },
  { title: 'Deliver', text: 'Launch, training and ongoing support to keep your product running smoothly.' },
];

const INDUSTRIES = [
  { name: 'Retail & E-commerce', img: unsplash('1556742049-0cfed4f6a45d', 600) },
  { name: 'Education', img: unsplash('1503676260728-1c00da094a0b', 600) },
  { name: 'Healthcare', img: unsplash('1576091160399-112ba8d25d1d', 600) },
  { name: 'Real Estate', img: unsplash('1560518883-ce09059eeffa', 600) },
  { name: 'Finance', img: unsplash('1554224155-6726b3ff858f', 600) },
  { name: 'Restaurants', img: unsplash('1517248135467-4c7edcad34c4', 600) },
];

const WHY_POINTS = [
  ['Fixed, clear pricing', 'You get a written quote and timeline before we start.'],
  ['Mobile-first builds', 'Every site and app is tested on real phones and tablets.'],
  ['Fast and secure', 'Optimised loading, HTTPS and security best practices by default.'],
  ['Support after launch', 'Bug fixes, updates and improvements whenever you need them.'],
];

const COMPARE = [
  ['Design', 'Custom, built around your brand and users', 'Generic template'],
  ['Performance and SEO', 'Optimised from day one', 'Often slow, limited control'],
  ['Growth', 'Scalable code you own', 'Locked into a platform'],
  ['Who you talk to', 'The developers building it', 'A support queue'],
  ['After launch', 'Maintenance and improvements', 'You are on your own'],
];

const placeholder = (name) => `https://via.placeholder.com/400x300/e6f0f2/056e7f?text=${encodeURIComponent(name)}`;

function Banner() {
  const [counters, setCounters] = useState({ projects: 0, clients: 0, years: 0, countries: 0 });
  const [statsSeen, setStatsSeen] = useState(false);
  const [recentWorks, setRecentWorks] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [workMap, setWorkMap] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const statsRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [worksData, reviewsData] = await Promise.all([getWorks(), getReviews()]);
      const works = worksData.map((w) => ({ ...w, thumbnail: w.thumbnail || placeholder(w.name) }));
      const map = {};
      works.forEach((w) => (map[w.id] = { name: w.name }));
      setWorkMap(map);
      setRecentWorks([...works].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3));
      setRecentReviews([...reviewsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoadingData(false);
    }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsSeen) return undefined;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = step / steps;
      setCounters({
        projects: Math.floor(150 * p),
        clients: Math.floor(50 * p),
        years: Math.floor(5 * p),
        countries: Math.floor(10 * p),
      });
      if (step >= steps) clearInterval(timer);
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [statsSeen]);

  const stars = (r) => {
    const n = parseInt(r, 10) || 0;
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  };

  return (
    <>
      {/* Hero */}
      <section className="home-hero" style={{ '--hero-img': `url(${HOME_IMG.heroMain})` }}>
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <span className="eyebrow light">Shree Shyam IT Solutions</span>
            <h1>
              We design it.<br />
              We build it.<br />
              You grow with it.
            </h1>
            <span className="rule" />
            <p>
              Websites, software and mobile apps built with care, tested on real devices and delivered on time, with
              support that continues after launch.
            </p>
            <div className="btn-row">
              <Link to="/contact" className="btn btn-primary btn-large">Get a free quote</Link>
              <Link to="/works" className="btn btn-ghost btn-large">View our work</Link>
            </div>
            <ul className="hero-points">
              <li>Free consultation</li>
              <li>Reply within 24 hours</li>
              <li>Post-launch support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="marquee-item">{w}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="band band-tint" ref={statsRef}>
        <div className="band-inner stats-strip four">
          {[
            ['projects', 'Projects delivered', 'Websites, apps and software'],
            ['clients', 'Happy clients', 'Startups and enterprises'],
            ['countries', 'Countries served', 'Clients across the globe'],
            ['years', 'Years of experience', 'In software development'],
          ].map(([key, label, desc]) => (
            <div key={key} className="stats-strip-item">
              <span className="stat-number">{counters[key]}+</span>
              <strong>{label}</strong>
              <span className="muted">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="band">
        <div className="band-inner">
          <SectionHead eyebrow="What we do" title="Our services" desc="Everything you need to launch and grow online, from one team." />
          <div className="cards-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="card service-card has-img">
                <div className="service-img">
                  <img src={s.img} alt={s.title} loading="lazy" onError={hideOnError} />
                </div>
                <div className="service-body">
                  <h3>{s.title}</h3>
                  <p className="muted">{s.description}</p>
                  <ul className="check-list">
                    {s.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <Link to="/contact" className="text-link block">Get a quote</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="band band-dark">
        <div className="band-inner">
          <SectionHead eyebrow="How we work" title="From idea to launch in four steps" desc="A simple, transparent process that keeps you in control." />
          <ol className="process">
            {PROCESS.map((p, i) => (
              <li key={p.title} className="process-step">
                <span className="process-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p className="muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why us */}
      <section className="band">
        <div className="band-inner split">
          <div className="split-image">
            <img src={HOME_IMG.why} alt="Our team at work" loading="lazy" onError={hideOnError} />
            <div className="split-badge"><strong>24h</strong><span>average first reply</span></div>
          </div>
          <div className="split-text">
            <span className="eyebrow">Why Shree Shyam</span>
            <h2>A team that treats your project like its own</h2>
            <span className="rule left" />
            <p className="muted">
              We are a small, focused team, so you talk directly to the people building your product. No account
              managers in between, no hidden costs.
            </p>
            <ul className="why-list">
              {WHY_POINTS.map(([t, d]) => (
                <li key={t}>
                  <span className="tick">✓</span>
                  <div><strong>{t}</strong><p>{d}</p></div>
                </li>
              ))}
            </ul>
            <Link to="/about" className="btn btn-outline">More about us</Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="band band-white">
        <div className="band-inner">
          <SectionHead eyebrow="Why a custom build" title="Shree Shyam vs. do-it-yourself" desc="What changes when a dedicated team builds your product." />
          <div className="compare-wrap">
            <div className="compare">
              <div className="compare-row compare-head">
                <div>What you get</div><div>Shree Shyam IT Solutions</div><div>Templates and DIY</div>
              </div>
              {COMPARE.map(([a, b, c]) => (
                <div key={a} className="compare-row"><div>{a}</div><div>{b}</div><div>{c}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="band">
        <div className="band-inner">
          <SectionHead eyebrow="Who we build for" title="Industries we serve" desc="From local shops to growing companies, we have built for a wide range of businesses." />
          <div className="industry-grid">
            {INDUSTRIES.map((i) => (
              <div key={i.name} className="industry-tile">
                <img src={i.img} alt="" loading="lazy" onError={hideOnError} />
                <span>{i.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="band band-dark">
        <div className="band-inner">
          <SectionHead eyebrow="Our stack" title="Technologies we work with" desc="We pick the right tools for the job, and we work with yours too." />
          <div className="tech-grid">
            {TECHNOLOGIES.map((t) => (
              <div key={t.name} className="tech-tile">
                {t.image && (
                  <img src={t.image} alt="" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent works */}
      {!loadingData && recentWorks.length > 0 && (
        <section className="band">
          <div className="band-inner">
            <SectionHead eyebrow="Portfolio" title="Recent projects" />
            <div className="recent-works-list">
              {recentWorks.map((w, i) => (
                <div key={w.id} className={`recent-work ${i % 2 === 1 ? 'reverse' : ''}`}>
                  <Link to={`/work/${w.id}`} className="recent-work-image">
                    <img src={w.thumbnail} alt={w.name} loading="lazy" onError={(e) => { e.target.src = placeholder(w.name); }} />
                  </Link>
                  <div className="recent-work-details">
                    <h3>{w.name}</h3>
                    <p className="muted">{w.description || 'No description available'}</p>
                    {w.technologies?.length > 0 && (
                      <div className="tags">
                        {w.technologies.slice(0, 3).map((t, k) => <span key={k} className="tag">{t}</span>)}
                        {w.technologies.length > 3 && <span className="tag">+{w.technologies.length - 3}</span>}
                      </div>
                    )}
                    <Link to={`/work/${w.id}`} className="btn btn-outline btn-small">View details</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="center-row">
              <Link to="/works" className="btn btn-outline">View all projects</Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent reviews */}
      {!loadingData && recentReviews.length > 0 && (
        <section className="band band-white">
          <div className="band-inner">
            <SectionHead eyebrow="Testimonials" title="Client reviews" />
            <div className="cards-3">
              {recentReviews.map((r) => (
                <div key={r.id} className="card review-mini">
                  <span className="quote-mark">“</span>
                  <span className="stars-text">{stars(r.rating)}</span>
                  <p className="quote">{r.review || 'No review text'}</p>
                  <div className="review-mini-foot">
                    <div className="avatar">{(r.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{r.name || 'Anonymous'}</strong>
                      {workMap[r.workId] && (
                        <Link to={`/work/${r.workId}`} className="text-link block">on {workMap[r.workId].name}</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="center-row">
              <Link to="/reviews" className="btn btn-outline">View all reviews</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="band band-cta" style={{ '--cta-img': `url(${HOME_IMG.cta})` }}>
        <div className="band-inner cta-inner">
          <SectionHead eyebrow="Let's talk" title="Ready to start your project?" desc="Tell us what you need and we will reply within 24 hours." />
          <div className="btn-row center">
            <Link to="/contact" className="btn btn-primary btn-large">Contact us</Link>
            <a href="tel:+916284086208" className="btn btn-ghost btn-large">Call +91 62840-86208</a>
          </div>
        </div>
      </section>
    </>
  );
}

function Home() {
  return <Banner />;
}

/* ==========================================================================
   Works
   ========================================================================== */

function Works() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        setWorks(await getWorks());
      } catch (e) {
        console.error('Error loading works:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = ['All', ...new Set(works.map((w) => w.category).filter(Boolean))];

  const q = search.trim().toLowerCase();
  const filtered = works
    .filter((w) => category === 'All' || w.category === category)
    .filter((w) => !q || (w.name || '').toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q));

  const handleView = (work) => {
    const viewLink = formatUrl(work.viewLink);
    if (work.videoLink) setPlaying({ work, videoLink: formatUrl(work.videoLink), viewLink });
    else window.open(viewLink, '_blank', 'noopener,noreferrer');
  };

  const handleEnded = () => {
    if (!playing) return;
    window.open(playing.viewLink, '_blank', 'noopener,noreferrer');
    setPlaying(null);
  };

  if (loading) return <Loading text="Loading our works..." />;

  return (
    <div className="page">
      <PageHero
        sub="Our portfolio"
        title="Featured works"
        desc="Explore our collection of digital solutions that have helped businesses grow and succeed online."
        image={unsplash('1498050108023-c5249f4df085', 1920)}
      />
      <div className="container">
        <div className="highlights">
          {[
            ['Real clients', 'Every project here is live and in use.'],
            ['Built to convert', 'Designs focused on results, not just looks.'],
            ['Fully responsive', 'Works on phones, tablets and desktops.'],
          ].map(([t, d]) => (
            <div key={t} className="highlight">
              <span className="tick">✓</span>
              <div><strong>{t}</strong><p>{d}</p></div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="pill-filters">
            {categories.map((c) => (
              <button key={c} className={`pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <p className="results-count">
          Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
        </p>

        {filtered.length > 0 ? (
          <div className="works-grid">
            {filtered.map((work) => (
              <article key={work.id} className="work-card">
                <div className="work-thumb">
                  <img src={work.thumbnail} alt={work.name} />
                  <div className="work-overlay">
                    <span className="chip">{work.category || 'Web'}</span>
                    <button onClick={() => handleView(work)} className="btn btn-primary btn-small">
                      {work.videoLink ? ' Watch preview' : ' Visit site'}
                    </button>
                  </div>
                </div>
                <div className="work-body">
                  <h3>{work.name}</h3>
                  <p className="clamp-3">{work.description}</p>
                  <div className="work-meta">
                    <small className="muted">{getDomainFromUrl(work.viewLink)}</small>
                    {work.technologies && (
                      <div className="tags">
                        {work.technologies.slice(0, 3).map((t, i) => <span key={i} className="tag">{t}</span>)}
                        {work.technologies.length > 3 && <span className="tag">+{work.technologies.length - 3}</span>}
                      </div>
                    )}
                  </div>
                  <div className="work-actions">
                    <button onClick={() => handleView(work)} className="btn btn-primary btn-small">
                      {work.videoLink ? 'Preview and visit' : 'Visit website'}
                    </button>
                    <Link to={`/work/${work.id}`} className="btn btn-outline btn-small">Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            text="Try a different search term or category."
            onClear={() => { setSearch(''); setCategory('All'); }}
          />
        )}

        <div className="stats-row">
          <div className="stat-box"><span className="stat-number">{works.length}</span><span className="stat-label">Total projects</span></div>
          <div className="stat-box"><span className="stat-number">{works.filter((w) => w.videoLink).length}</span><span className="stat-label">With previews</span></div>
          <div className="stat-box"><span className="stat-number">{[...new Set(works.map((w) => w.category))].filter(Boolean).length}</span><span className="stat-label">Categories</span></div>
        </div>

        <div className="cta-block image-cta" style={{ '--cta-img': `url(${HOME_IMG.cta})` }}>
          <h2>Want a project like these?</h2>
          <p>Tell us your idea and get a free quote within 24 hours.</p>
          <Link to="/contact" className="btn btn-primary btn-large">Start your project</Link>
        </div>
      </div>

      {playing && (
        <div className="modal" onClick={() => setPlaying(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{playing.work.name} – preview</h3>
              <button className="close-btn" onClick={() => setPlaying(null)} aria-label="Close">&times;</button>
            </div>
            <video controls autoPlay onEnded={handleEnded} className="video-player">
              <source src={playing.videoLink} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="modal-note">The website opens automatically when the video ends.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Work detail
   ========================================================================== */

function WorkDetail() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name: '', review: '', rating: 5 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [worksData, allReviews] = await Promise.all([getWorks(), getReviews()]);
      setWork(worksData.find((w) => w.id === id));
      setReviews(
        allReviews.filter((r) => r.workId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { loadData(); }, [loadData]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview({ ...form, workId: id });
      alert('Review submitted successfully!');
      setForm({ name: '', review: '', rating: 5 });
      loadData();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading project details..." />;

  if (!work)
    return (
      <div className="page">
        <EmptyState title="Project not found" text="This project doesn't exist or has been removed." />
        <div className="center-row"><Link to="/works" className="btn btn-primary">View all projects</Link></div>
      </div>
    );

  const average = avg(reviews);

  return (
    <div className="page">
      <div className="detail-hero" style={{ backgroundImage: `url(${work.thumbnail})` }}>
        <div className="detail-hero-overlay">
          <div className="detail-hero-content">
            <span className="chip">{work.category || 'Web Development'}</span>
            <h1>{work.name}</h1>
            <div className="detail-meta">
              <span>{getDomainFromUrl(work.viewLink)}</span>
              <span>Rating {average} ({reviews.length} reviews)</span>
            </div>
            <button
              onClick={() => window.open(formatUrl(work.viewLink), '_blank', 'noopener,noreferrer')}
              className="btn btn-primary btn-large"
            >
              Visit website
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          {[['overview', 'Overview'], ['reviews', `Reviews (${reviews.length})`], ['details', 'Project details']].map(([k, label]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="panel stack">
            <section>
              <h2>About this project</h2>
              <p className="prose">{work.description}</p>
            </section>
            {work.technologies && (
              <section>
                <h2>Technologies used</h2>
                <div className="tags large">
                  {work.technologies.map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>
              </section>
            )}
            {work.features && (
              <section>
                <h2>Key features</h2>
                <ul className="check-list">
                  {work.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </section>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="panel stack">
            <div className="rating-summary">
              <div className="rating-big">
                <span className="big-number">{average}</span>
                <span className="muted">out of 5</span>
                <Stars rating={Math.round(average)} size="lg" />
                <span className="muted">Based on {reviews.length} reviews</span>
              </div>
              <RatingBars reviews={reviews} />
            </div>

            <section className="stack">
              <h3>Customer reviews</h3>
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={r.id || i} className="card review-card">
                    <div className="review-head">
                      <div className="avatar">{(r.name || '?').charAt(0).toUpperCase()}</div>
                      <div className="review-who">
                        <strong>{r.name}</strong>
                        <Stars rating={parseInt(r.rating, 10)} />
                      </div>
                      <small className="muted">{shortDate(r.createdAt)}</small>
                    </div>
                    <p>{r.review}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No reviews yet" text="Be the first to share your experience with this project." />
              )}
            </section>

            <section className="card">
              <h3>Write a review</h3>
              <form onSubmit={submitReview} className="form">
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <div className="rating-field">
                  <label>Your rating</label>
                  <Stars rating={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size="lg" />
                </div>
                <textarea
                  placeholder="Share your experience with this project..."
                  rows="4"
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit review'}
                </button>
              </form>
            </section>
          </div>
        )}

        {tab === 'details' && (
          <div className="panel stack">
            <div className="details-grid">
              {[
                ['Project type', work.category || 'Web Development'],
                ['Client', work.client || 'Confidential'],
                ['Year', work.year || '2024'],
                ['Duration', work.duration || '3 months'],
              ].map(([l, v]) => (
                <div key={l} className="detail-item">
                  <span className="muted">{l}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <section>
              <h3>Project links</h3>
              <div className="links-list">
                <a href={formatUrl(work.viewLink)} target="_blank" rel="noopener noreferrer" className="project-link"> Live website</a>
                {work.githubLink && <a href={formatUrl(work.githubLink)} target="_blank" rel="noopener noreferrer" className="project-link"> Source code</a>}
                {work.caseStudyLink && <a href={formatUrl(work.caseStudyLink)} target="_blank" rel="noopener noreferrer" className="project-link"> Case study</a>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Reviews
   ========================================================================== */

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [works, setWorks] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterWork, setFilterWork] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [reviewsData, worksData] = await Promise.all([getReviews(), getWorks()]);
        const map = {};
        worksData.forEach((w) => {
          map[w.id] = { name: w.name, thumbnail: w.thumbnail, category: w.category || 'Web Development' };
        });
        setWorks(map);
        setReviews([...reviewsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) {
        console.error('Error loading reviews:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  const q = search.trim().toLowerCase();
  const filtered = (filterWork === 'all' ? [...reviews] : reviews.filter((r) => r.workId === filterWork))
    .filter(
      (r) =>
        !q ||
        (r.name || '').toLowerCase().includes(q) ||
        (r.review || '').toLowerCase().includes(q) ||
        (works[r.workId]?.name || '').toLowerCase().includes(q)
    )
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return parseInt(b.rating, 10) - parseInt(a.rating, 10);
      if (sortBy === 'lowest') return parseInt(a.rating, 10) - parseInt(b.rating, 10);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) return <Loading text="Loading reviews..." />;

  const fiveStar = reviews.filter((r) => parseInt(r.rating, 10) === 5).length;
  const recommend = reviews.length ? Math.round((reviews.filter((r) => parseInt(r.rating, 10) >= 4).length / reviews.length) * 100) : 0;

  return (
    <div className="page">
      <PageHero
        sub="Client feedback"
        title="Customer reviews"
        desc="See what our clients say about our work. We value every piece of feedback."
        image={unsplash('1556761175-5973dc0f32e7', 1920)}
      />
      <div className="container">
        <div className="stats-row">
          <div className="stat-box"><span className="stat-number">{reviews.length}</span><span className="stat-label">Total reviews</span></div>
          <div className="stat-box"><span className="stat-number">{new Set(reviews.map((r) => r.workId)).size}</span><span className="stat-label">Works reviewed</span></div>
          <div className="stat-box"><span className="stat-number">{avg(reviews)}</span><span className="stat-label">Average rating</span></div>
          <div className="stat-box"><span className="stat-number">{fiveStar}</span><span className="stat-label">Five-star reviews</span></div>
          <div className="stat-box"><span className="stat-number">{recommend}%</span><span className="stat-label">Rated 4 stars or more</span></div>
        </div>

        {reviews.length > 0 && (
          <div className="card">
            <h3>Rating distribution</h3>
            <RatingBars reviews={reviews} />
          </div>
        )}

        <div className="toolbar">
          <div className="filter-group">
            <select value={filterWork} onChange={(e) => setFilterWork(e.target.value)} className="select">
              <option value="all">All works</option>
              {Object.keys(works).map((id) => (
                <option key={id} value={id}>
                  {works[id].name} ({reviews.filter((r) => r.workId === id).length})
                </option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
          <div className="search-box">
            <input type="text" className="search-input" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <p className="results-count">
          Showing {filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}
        </p>

        {filtered.length > 0 ? (
          <div className="reviews-grid">
            {filtered.map((r) => (
              <article key={r.id} className="card review-card with-banner">
                {works[r.workId] && (
                  <Link to={`/work/${r.workId}`} className="review-banner">
                    <img src={works[r.workId].thumbnail} alt={works[r.workId].name} />
                    <div className="review-banner-overlay">
                      <span className="chip">{works[r.workId].category}</span>
                      <strong>{works[r.workId].name}</strong>
                    </div>
                  </Link>
                )}
                <div className="review-body">
                  <div className="review-head">
                    <div className="avatar">{(r.name || '?').charAt(0).toUpperCase()}</div>
                    <div className="review-who">
                      <strong>{r.name}</strong>
                      <span className="stars-text">{renderStars(parseInt(r.rating, 10))}</span>
                    </div>
                  </div>
                  <p className="quote">“{r.review}”</p>
                  <div className="review-foot">
                    <small className="muted">{shortDate(r.createdAt)}</small>
                    <Link to={`/work/${r.workId}`} className="text-link">View project</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews found"
            text="Try adjusting your filters or search term."
            onClear={() => { setFilterWork('all'); setSortBy('newest'); setSearch(''); }}
          />
        )}

        <section>
          <h2 className="section-title">Work-wise statistics</h2>
          <div className="work-stats-grid">
            {Object.keys(works).map((id) => {
              const wr = reviews.filter((r) => r.workId === id);
              if (!wr.length) return null;
              return (
                <Link to={`/work/${id}`} key={id} className="card work-stat-card">
                  <img src={works[id].thumbnail} alt={works[id].name} />
                  <div>
                    <h4>{works[id].name}</h4>
                    <div className="work-stat-meta">
                      <span>{wr.length} {wr.length === 1 ? 'review' : 'reviews'}</span>
                      <span>{avg(wr)}/5</span>
                    </div>
                    <RatingBars reviews={wr} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="cta-block image-cta" style={{ '--cta-img': `url(${HOME_IMG.cta})` }}>
          <h2>Have you worked with us?</h2>
          <p>We'd love to hear about your experience.</p>
          <Link to="/works" className="btn btn-primary btn-large">Browse works to review</Link>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Contact
   ========================================================================== */

const WORK_TYPES = [
  { value: 'custom-web', label: 'Custom Website' },
  { value: 'ecommerce', label: 'E-commerce Website' },
  { value: 'portfolio', label: 'Portfolio Website' },
  { value: 'promotional', label: 'Promotional Website' },
  { value: 'software', label: 'Software Development' },
  { value: 'application', label: 'Mobile Application' },
  { value: 'other', label: 'Other' },
];

const CONTACT_INFO = [
  { label: 'Email', value: 'itsolutionsshreeshyam@gmail.com', link: 'mailto:itsolutionsshreeshyam@gmail.com' },
  { label: 'Phone', value: '+91 62840-86208', link: 'tel:+916284086208' },
  { label: 'Address', value: 'Patiala, Punjab, India', link: null },
  { label: 'Working hours', value: 'Mon – Sat: 9:00 AM – 7:00 PM', link: null },
];

const NEXT_STEPS = [
  ['You send the form', 'Share your idea, budget and timeline. Rough notes are fine.'],
  ['We call you back', 'Within 24 hours we discuss requirements and answer your questions.'],
  ['You get a clear quote', 'A written proposal with scope, price and delivery dates.'],
];

const FAQS = [
  ['What is your typical project timeline?', 'Timelines vary with complexity. A simple website might take 2–3 weeks, while complex applications can take 2–3 months. We provide a detailed timeline during consultation.'],
  ['Do you provide maintenance after launch?', 'Yes. We offer post-launch maintenance packages so your project keeps running smoothly and stays up to date.'],
  ['What information do you need to start?', 'Your project requirements, goals, target audience, design preferences and content (text, images). We guide you through the rest.'],
  ['How do you handle revisions?', 'Our packages include a set number of revision rounds. Additional revisions can be discussed based on project scope.'],
  ['Can you work with my existing website?', 'Yes. We can redesign, speed up, fix or extend an existing site or app without starting from scratch.'],
  ['How do payments work?', 'We usually split payment into milestones, so you pay as the project progresses. Details are in your written quote.'],
];

function Contact() {
  const empty = { name: '', email: '', mobile: '', message: '', workType: '' };
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addContact(form);
      alert('Message sent successfully! We will contact you soon.');
      setForm(empty);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page contact-page">
      <PageHero
        sub="Get in touch"
        title="Contact us"
        desc="Have a project in mind? Tell us about it and we'll show you how we can bring it to life."
        image={unsplash('1486312338219-ce68d2c6f44d', 1920)}
      />

      <div className="container">
        <div className="info-grid">
          {CONTACT_INFO.map((i) => (
            <div key={i.label} className="card info-card">
              <div>
                <h3>{i.label}</h3>
                {i.link ? <a href={i.link} className="text-link">{i.value}</a> : <p>{i.value}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="contact-grid">
          <div className="card form-card">
            <h2>Send us a message</h2>
            <p className="muted">Fill out the form and we'll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="name">Full name *</label>
                <div className="input-wrap">
                  <input id="name" name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <div className="input-wrap">
                    <input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="mobile">Mobile number *</label>
                  <div className="input-wrap">
                    <input
                      id="mobile" name="mobile" type="tel" placeholder="+91 98765 43210"
                      value={form.mobile} onChange={handleChange} required
                      pattern="[0-9+\-\s]+" title="Please enter a valid phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Type of work required *</label>
                <div className="worktype-grid">
                  {WORK_TYPES.map((t) => (
                    <label key={t.value} className={`worktype ${form.workType === t.value ? 'selected' : ''}`}>
                      <input type="radio" name="workType" value={t.value} checked={form.workType === t.value} onChange={handleChange} required />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your message *</label>
                <textarea
                  id="message" name="message" rows="5" required
                  placeholder="Tell us about your requirements, budget, timeline and any specific features you need..."
                  value={form.message} onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                {submitting ? (<><span className="spinner small" />Sending...</>) : 'Send message'}
              </button>
            </form>
          </div>

          <aside className="contact-side">
            <div className="card">
              <h3>What happens next?</h3>
              <ol className="next-steps">
                {NEXT_STEPS.map(([t, d], i) => (
                  <li key={t}>
                    <span className="process-num sm">{i + 1}</span>
                    <div><strong>{t}</strong><p>{d}</p></div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card">
              <h3>Why choose us?</h3>
              <ul className="benefits">
                {[
                  ['Expert team', 'Skilled professionals with years of experience'],
                  ['Timely delivery', 'Projects delivered on schedule'],
                  ['Quality assurance', 'Rigorous testing and quality checks'],
                  ['Post-launch support', 'Ongoing maintenance and support'],
                ].map(([t, d]) => (
                  <li key={t}>
                    <span className="tick">✓</span>
                    <div><strong>{t}</strong><p>{d}</p></div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3>Visit us</h3>
              <div className="map-frame">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13773.862165776272!2d76.38365870688182!3d30.337716596432095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1773513107646!5m2!1sen!2sin"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps - Shree Shyam IT Solutions Location"
                />
              </div>
              <p className="map-address">Shree Shyam IT Solutions, Patiala, Punjab, India</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=30.337716596432095,76.38365870688182"
                target="_blank" rel="noopener noreferrer" className="text-link"
              >
                Get directions
              </a>
            </div>

            <div className="card">
              <h3>Follow us</h3>
              <SocialLinks />
            </div>
          </aside>
        </div>

        <section>
          <h2 className="section-title">Frequently asked questions</h2>
          <div className="faq-grid">
            {FAQS.map(([q, a]) => (
              <div key={q} className="card faq-item">
                <h4>{q}</h4>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ==========================================================================
   Admin
   ========================================================================== */

const WORK_TYPE_LABELS = {
  'custom-web': 'Custom Website',
  ecommerce: 'E-commerce Website',
  portfolio: 'Portfolio Website',
  promotional: 'Promotional Website',
  software: 'Software',
  application: 'Application',
  other: 'Other',
};

function Admin() {
  const emptyWork = { name: '', viewLink: '', description: '', thumbnail: '', videoLink: '' };
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [works, setWorks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tab, setTab] = useState('works');
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState({ viewLink: '', videoLink: '' });
  const [form, setForm] = useState(emptyWork);

  const loadData = async () => {
    try {
      const [w, r, c] = await Promise.all([getWorks(), getReviews(), getContacts()]);
      setWorks(w);
      setReviews(r);
      setContacts(c);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      setAuthed(true);
      loadData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (login.email === ADMIN_EMAIL && login.password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      loadData();
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    sessionStorage.removeItem('adminAuthenticated');
    setLogin({ email: '', password: '' });
  };

  const resetForm = () => {
    setForm(emptyWork);
    setPreview({ viewLink: '', videoLink: '' });
    setEditing(null);
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        viewLink: formatUrl(form.viewLink),
        videoLink: form.videoLink ? formatUrl(form.videoLink) : '',
      };
      if (editing) await updateWork({ ...data, id: editing.id });
      else await addWork(data);
      await loadData();
      alert(`Work ${editing ? 'updated' : 'added'} successfully!`);
      resetForm();
    } catch (err) {
      console.error('Error saving work:', err);
    }
  };

  const remove = async (fn, id, label) => {
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;
    try {
      await fn({ id });
      await loadData();
      alert(`${label[0].toUpperCase() + label.slice(1)} deleted successfully!`);
    } catch (err) {
      console.error(`Error deleting ${label}:`, err);
    }
  };

  const startEditing = (work) => {
    setEditing(work);
    setForm({
      name: work.name,
      viewLink: work.viewLink,
      description: work.description,
      thumbnail: work.thumbnail,
      videoLink: work.videoLink || '',
    });
    setPreview({ viewLink: work.viewLink, videoLink: work.videoLink || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUrlChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setPreview({ ...preview, [field]: value ? formatUrl(value) : '' });
  };

  const formatDate = (s) => {
    try {
      const d = new Date(s);
      return `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}`;
    } catch {
      return s;
    }
  };

  if (!authed)
    return (
      <div className="page admin-login-page">
        <div className="card login-card">
          <h1>Admin login</h1>
          <p className="muted">Enter your credentials to open the admin panel.</p>
          <form onSubmit={handleLogin} className="form">
            <div className="form-group">
              <label htmlFor="admin-email">Email address</label>
              <input id="admin-email" type="email" placeholder="Enter your email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input id="admin-password" type="password" placeholder="Enter your password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
            </div>
            {loginError && <div className="form-error">{loginError}</div>}
            <button type="submit" className="btn btn-primary btn-large">Log in</button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin dashboard</h1>
          <button onClick={handleLogout} className="btn btn-danger btn-small">Log out</button>
        </div>

        <div className="stats-row">
          <div className="stat-box"><span className="stat-number">{works.length}</span><span className="stat-label">Works</span></div>
          <div className="stat-box"><span className="stat-number">{reviews.length}</span><span className="stat-label">Reviews</span></div>
          <div className="stat-box"><span className="stat-number">{contacts.length}</span><span className="stat-label">Enquiries</span></div>
        </div>

        <div className="tabs">
          {[['works', 'Manage works'], ['reviews', 'Manage reviews'], ['contacts', 'View contacts']].map(([k, l]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'works' && (
          <div className="stack">
            <section className="card">
              <h2>{editing ? 'Edit work' : 'Add new work'}</h2>
              <form onSubmit={handleWorkSubmit} className="form">
                <div className="form-group">
                  <label>Work name</label>
                  <input type="text" placeholder="e.g., SSIT" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>View link (website URL)</label>
                  <input type="text" placeholder="e.g., www.ssit.com or https://ssit.com" value={form.viewLink} onChange={(e) => handleUrlChange('viewLink', e.target.value)} required />
                  {preview.viewLink && (
                    <small className="url-preview">Preview: <a href={preview.viewLink} target="_blank" rel="noopener noreferrer">{preview.viewLink}</a></small>
                  )}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Describe the work or project..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Thumbnail image URL</label>
                  <input type="text" placeholder="e.g., https://example.com/image.jpg" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} required />
                  {form.thumbnail && <img src={form.thumbnail} alt="Preview" className="thumb-preview" />}
                </div>
                <div className="form-group">
                  <label>Video link (optional)</label>
                  <input type="text" placeholder="e.g., https://example.com/video.mp4" value={form.videoLink} onChange={(e) => handleUrlChange('videoLink', e.target.value)} />
                  {preview.videoLink && <small className="url-preview">Preview: {preview.videoLink}</small>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editing ? 'Update work' : 'Add work'}</button>
                  {editing && <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>}
                </div>
              </form>
            </section>

            <h2>Existing works</h2>
            <div className="admin-list">
              {works.map((w) => (
                <div key={w.id} className="card admin-item">
                  <img src={w.thumbnail} alt={w.name} className="admin-thumb" />
                  <div className="admin-item-body">
                    <h3>{w.name}</h3>
                    <p className="clamp-3">{w.description}</p>
                    <small className="muted">Website: <a href={formatUrl(w.viewLink)} target="_blank" rel="noopener noreferrer">{getDomainFromUrl(w.viewLink)}</a></small>
                    {w.videoLink && <small className="muted">Video: <a href={formatUrl(w.videoLink)} target="_blank" rel="noopener noreferrer">Watch preview</a></small>}
                  </div>
                  <div className="admin-item-actions">
                    <button onClick={() => startEditing(w)} className="btn btn-outline btn-small">Edit</button>
                    <button onClick={() => remove(deleteWork, w.id, 'work')} className="btn btn-danger btn-small">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="stack">
            <h2>Manage reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((r) => {
                const w = works.find((x) => x.id === r.workId);
                return (
                  <div key={r.id} className="card admin-item">
                    {w && <img src={w.thumbnail} alt={w.name} className="admin-thumb" />}
                    <div className="admin-item-body">
                      {w && (
                        <small className="muted">
                          {w.name} · <a href={formatUrl(w.viewLink)} target="_blank" rel="noopener noreferrer">{getDomainFromUrl(w.viewLink)}</a>
                        </small>
                      )}
                      <div className="review-who">
                        <strong>{r.name}</strong>
                        <Stars rating={parseInt(r.rating, 10)} />
                      </div>
                      <p>{r.review}</p>
                      <small className="muted">Work ID: {r.workId} · {formatDate(r.createdAt)}</small>
                    </div>
                    <div className="admin-item-actions">
                      <button onClick={() => remove(deleteReview, r.id, 'review')} className="btn btn-danger btn-small">Delete review</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState title="No reviews yet" text="Reviews appear here once clients submit them." />
            )}
          </div>
        )}

        {tab === 'contacts' && (
          <div className="stack">
            <h2>Contact submissions</h2>
            {contacts.length > 0 ? (
              contacts.map((c) => (
                <div key={c.id} className="card contact-entry">
                  <h3>{c.name}</h3>
                  <p><strong>Email:</strong> <a href={`mailto:${c.email}`}>{c.email}</a></p>
                  <p><strong>Mobile:</strong> {c.mobile}</p>
                  <p><strong>Work type:</strong> {WORK_TYPE_LABELS[c.workType] || c.workType}</p>
                  <p><strong>Message:</strong> {c.message}</p>
                  <small className="muted">Submitted: {formatDate(c.createdAt)}</small>
                </div>
              ))
            ) : (
              <EmptyState title="No contact submissions yet" text="New enquiries from the contact form appear here." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   About
   ========================================================================== */

const HERO_BGS = ['1522071820081-009f0129c71c', '1552664730-d307ca884978', '1522542550221-31fd19575a2d'].map((id) => unsplash(id, 1920));

const TEAM_IMG = {
  office1: unsplash('1497366216548-37526070297c'),
  office2: unsplash('1497366811353-6870744d04b2'),
  team: unsplash('1522071820081-009f0129c71c'),
  collaboration: unsplash('1552664730-d307ca884978'),
};

const TECH_IMG = {
  web: ['1555066931-4365d14bab8c', '1461749280684-dccba630e2f6', '1547658719-da2b51169166'],
  ecommerce: ['1556742049-0cfed4f6a45d', '1556740714-a8395b3bf30f', '1472851294608-062f824d29cc'],
  portfolio: ['1507238691740-187a5b1d37b8', '1517694712202-14dd9538aa97', '1499951360447-b19be8fe80f5'],
  webapp: ['1551288049-bebda4e38f71', '1555949963-aa79dcee981c', '1542744173-8e7e53415bb0'],
  mobile: ['1512941937669-90a1b58e7e9c', '1526498460520-4c246339dccb', '1551650975-87deedd944c3'],
  software: ['1558494949-ef010cbdcc31', '1461749280684-dccba630e2f6', '1555066931-4365d14bab8c'],
};
Object.keys(TECH_IMG).forEach((k) => { TECH_IMG[k] = TECH_IMG[k].map((id) => unsplash(id)); });

const ABOUT_SERVICES = [
  { title: 'Custom Websites', desc: 'Tailored websites built to your specific requirements', features: ['Responsive Design', 'SEO Optimized', 'Fast Loading'], cat: 'web' },
  { title: 'E-commerce Solutions', desc: 'Full-featured online stores with secure payment integration', features: ['Payment Gateway', 'Inventory Management', 'Mobile Friendly'], cat: 'ecommerce' },
  { title: 'Portfolio Sites', desc: 'Beautiful portfolio websites to showcase your work', features: ['Gallery Layouts', 'Case Studies', 'Client Showcase'], cat: 'portfolio' },
  { title: 'Web Applications', desc: 'Interactive web applications with powerful functionality', features: ['Real-time Features', 'API Integration', 'Scalable Architecture'], cat: 'webapp' },
  { title: 'Mobile Apps', desc: 'Native and cross-platform mobile applications', features: ['iOS & Android', 'Push Notifications', 'Offline Support'], cat: 'mobile' },
  { title: 'Software Development', desc: 'Custom software solutions for businesses', features: ['Enterprise Solutions', 'Cloud Integration', 'Custom APIs'], cat: 'software' },
];

const WHY_US = [
  ['Expert team', 'Skilled professionals with years of experience'],
  ['Quality work', 'High-quality deliverables that exceed expectations'],
  ['Timely delivery', 'Projects completed on time, every time'],
  ['24/7 support', 'Dedicated support throughout and after completion'],
  ['Secure development', 'Following best practices for security'],
  ['Innovation first', 'Embracing cutting-edge technologies'],
];

const VALUES = [
  ['Honest communication', 'Plain language, realistic timelines and no surprises on price.'],
  ['Craft over shortcuts', 'We care about clean code and details most visitors never notice.'],
  ['Your goals first', 'We build what helps your business, not what is easiest for us.'],
  ['Long-term partnership', 'We stay after launch to fix, improve and grow what we built.'],
];

// Edit these to match your real team.
const TEAMS = [
  { name: 'Design team', text: 'UI/UX designers who turn ideas into clear, attractive interfaces.', img: unsplash('1522202176988-66273c2fd55f', 600) },
  { name: 'Development team', text: 'Engineers building fast, secure web, mobile and custom software.', img: unsplash('1551434678-e076c223a692', 600) },
  { name: 'Support team', text: 'Friendly people who keep your product running after launch.', img: unsplash('1556761175-5973dc0f32e7', 600) },
];

function About() {
  const [hovered, setHovered] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_BGS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const bg = (n) => (TECH_IMG[hovered] || TECH_IMG.web)[n];

  return (
    <div className="page about-page">
      <header className="about-hero">
        {HERO_BGS.map((src, i) => (
          <div key={src} className={`hero-bg-image ${i === heroIdx ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
        ))}
        <div className="hero-overlay" />
        <div className="about-hero-content">
          <span className="hero-sub">About us</span>
          <h1 className="hero-title">Shree Shyam IT Solutions</h1>
          <p className="hero-desc">
            Crafting digital excellence through innovation, creativity and technical expertise. We turn ideas into
            digital solutions that drive success.
          </p>
          <div className="pill-row">
            {[['150+', 'Projects'], ['50+', 'Clients'], ['10+', 'Countries'], ['5+', 'Years']].map(([n, l]) => (
              <div key={l} className="stat-pill"><strong>{n}</strong><span>{l}</span></div>
            ))}
          </div>
        </div>
      </header>

      <div className="container">
        <section className="story">
          <div className="story-images">
            <img className="s-main" src={TEAM_IMG.office1} alt="Modern office" loading="lazy" />
            <img className="s-second" src={TEAM_IMG.team} alt="Team collaboration" loading="lazy" />
            <img className="s-third" src={TEAM_IMG.office2} alt="Creative workspace" loading="lazy" />
          </div>
          <div className="story-text">
            <h2 className="section-title left">Our story</h2>
            <p>
              Shree Shyam IT Solutions was founded with a simple mission: to help businesses grow with reliable,
              well-designed digital products. We believe great design and development can turn ideas into reality.
            </p>
            <p>
              What started as a small team in Patiala has grown into a studio serving clients across the globe. Our
              journey has been driven by passion, innovation and a commitment to quality.
            </p>
            <div className="quote-card">
              <img src={TEAM_IMG.collaboration} alt="Teamwork" />
              <div>
                <p>“Innovation distinguishes between a leader and a follower.”</p>
                <span className="muted">Our team philosophy</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mission" style={{ '--mission-bg': `url(${bg(0)})` }}>
          <h2 className="section-title">What we do</h2>
          <div className="mission-card">
            <p>
              We design and build custom websites, e-commerce stores, mobile applications and business software. Every
              project is handled by a dedicated team that stays with you from the first call to long after launch.
            </p>
          </div>
        </section>

        <section>
          <h2 className="section-title">Our services</h2>
          <div className="about-services">
            {ABOUT_SERVICES.map((s, i) => (
              <div
                key={s.title}
                className="about-service"
                onMouseEnter={() => setHovered(s.cat)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="about-service-image">
                  <img src={TECH_IMG[s.cat][i % 3]} alt={s.title} loading="lazy" />
                </div>
                <div className="about-service-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ul className="check-list">
                    {s.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Meet the teams</h2>
          <div className="team-grid">
            {TEAMS.map((t) => (
              <div key={t.name} className="team-card">
                <img src={t.img} alt={t.name} loading="lazy" onError={hideOnError} />
                <div className="team-body">
                  <h3>{t.name}</h3>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">What we believe in</h2>
          <div className="values-grid">
            {VALUES.map(([t, d]) => (
              <div key={t} className="value-item">
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Why choose us</h2>
          <div className="cards-3">
            {WHY_US.map(([title, desc]) => (
              <div key={title} className="card feature-card">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-cta" style={{ '--cta-bg': `url(${bg(1)})` }}>
          <h2>Ready to start your project?</h2>
          <p>Get in touch to discuss your requirements and bring your ideas to life.</p>
          <div className="cta-buttons">
            <Link to="/works" className="btn btn-primary btn-large">View our work</Link>
            <Link to="/contact" className="btn btn-ghost btn-large">Contact us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ==========================================================================
   App shell: loader, navigation, routes
   ========================================================================== */

const LOADER_MESSAGES = [
  'Warming up the servers',
  'Compiling ideas',
  'Polishing the pixels',
  'Almost ready',
];
const LOADER_SYMBOLS = ['</>', '{ }', '#', '( )', ';', '[ ]'];

function Loader({ progress }) {
  const msg = LOADER_MESSAGES[Math.min(LOADER_MESSAGES.length - 1, Math.floor(progress / 26))];
  return (
    <div className="app-loader">
      <div className="loader-glow g1" />
      <div className="loader-glow g2" />
      {LOADER_SYMBOLS.map((s, i) => (
        <span key={s} className={`loader-symbol s${i + 1}`} aria-hidden="true">{s}</span>
      ))}
      <div className="loader-content">
        <div className="loader-orb">
          <span className="ring r1" />
          <span className="ring r2" />
          <span className="ring r3" />
          <span className="loader-logo"><img src={LOGO_URL} alt="Shree Shyam IT Solutions" /></span>
        </div>
        <BrandName className="loader-brand" />
        <p className="loader-msg" key={msg}>{msg}<span className="dots"><i>.</i><i>.</i><i>.</i></span></p>
        <div className="loader-progress">
          <div className="loader-track"><div className="loader-bar" style={{ width: `${progress}%` }} /></div>
          <span className="loader-pct">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let p = 0;
    let hideTimer;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        hideTimer = setTimeout(() => setLoading(false), 500);
      }
      setProgress(Math.min(p, 100));
    }, 200);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/admin');
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [navigate]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  if (loading) return <Loader progress={progress} />;

  return (
    <div className="App">
      <ScrollToTop />

      <div className="announce">
        Now booking new projects: websites, apps and software.
        <Link to="/contact">Get a free quote</Link>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="brand">
            <img src={LOGO_URL} alt="Shree Shyam IT Solutions" className="brand-logo" />
            <BrandName />
          </Link>

          <button
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>

          <nav className={`site-nav ${menuOpen ? 'open' : ''}`}>
            <ul>
              {NAV_ITEMS.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={`nav-link ${location.pathname === n.to ? 'active' : ''}`}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn btn-primary nav-cta">Start a project</Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </main>

      <button
        className={`back-to-top ${scrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
      </button>
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