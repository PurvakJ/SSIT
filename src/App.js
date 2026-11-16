import React, { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import gsap from 'gsap';
import {
  ScrollTrigger,
  MorphSVGPlugin,
  MotionPathPlugin,
  CustomEase,
  ScrambleTextPlugin,
} from 'gsap/all';
import './App.css';

/* npm i gsap   (GSAP and all its plugins are free, they ship inside the "gsap" package) */
gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, MotionPathPlugin, CustomEase, ScrambleTextPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });
CustomEase.create(
  'softCustom',
  'M0,0 C0,0.408 0.11,0.712 0.222,0.712 0.35,0.712 0.37,0.506 0.498,0.532 0.658,0.564 0.582,0.911 0.736,1.024 0.784,1.059 0.826,1.054 0.89,1.024 0.916,1.011 0.946,1 1,1'
);

/* ==========================================================================
   Safe ScrollTrigger refresh
   ScrollTrigger.refresh() briefly resets the scroll position. If it runs while a
   finger is still scrolling on a phone it kills the momentum and the page shakes
   or jumps. So it only runs once the user has stopped scrolling, and never inside /admin.
   ========================================================================== */
let lastScrollAt = 0;
let refreshTimer;
if (typeof window !== 'undefined') {
  const mark = () => { lastScrollAt = Date.now(); };
  window.addEventListener('scroll', mark, { passive: true });
  window.addEventListener('touchmove', mark, { passive: true });
}
const safeRefresh = (delay = 250) => {
  clearTimeout(refreshTimer);
  const attempt = () => {
    if (window.location.pathname.startsWith('/admin')) return;
    if (Date.now() - lastScrollAt < 300) { refreshTimer = setTimeout(attempt, 300); return; }
    ScrollTrigger.refresh();
  };
  refreshTimer = setTimeout(attempt, delay);
};

/* Reliable "section entered the screen" watcher.
   IntersectionObserver does not depend on measured scroll positions, so it keeps working on phones
   even when images load late and the page height changes. Fires once, as soon as the section
   starts to appear at the bottom of the screen. Returns a cleanup function. */
function watchEnter(el, cb, margin = '0px 0px 6% 0px') {
  if (!el) return () => {};
  if (typeof IntersectionObserver === 'undefined') { cb(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { threshold: 0, rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}

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
  try { return new URL(formatUrl(url)).hostname; } catch { return url; }
}
const apiGet = async (action) => (await fetch(`${API}?action=${action}`)).json();
const apiPost = (action, data) => fetch(API, { method: 'POST', body: JSON.stringify({ ...data, action }) });
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
   Constants & helpers
   ========================================================================== */
const LOGO_URL = 'https://i.postimg.cc/0QHSjnK6/611276591-17933684004156896-6444722502286434287-n-1-removebg-preview.png';
const LINKEDIN_URL = 'https://www.linkedin.com/in/purvak-jindal-6741682a1/';
const INSTAGRAM_URL = 'https://www.instagram.com/shree_shyam_it_solutions/';
const ADMIN_EMAIL = 'purvakjindal2102@gmail.com';
const ADMIN_PASSWORD = 'purvak';

const GREEN = '#0ae448';
const CREAM = '#fffce1';

const unsplash = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const hideOnError = (e) => { e.target.style.visibility = 'hidden'; };
const avg = (list) =>
  list.length ? (list.reduce((s, r) => s + parseInt(r.rating, 10), 0) / list.length).toFixed(1) : '0.0';
const shortDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const placeholder = (name) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#191919"/><text x="50%" y="50%" fill="#0ae448" font-family="sans-serif" font-size="22" text-anchor="middle">${String(name).replace(/[<&]/g, '')}</text></svg>`
  );

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/works', label: 'Our Works' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
];

/* ==========================================================================
   GSAP hooks & helpers
   ========================================================================== */
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* gsap.context scoped to a ref. The callback may return a cleanup function. */
function useGsap(fn, deps = []) {
  const scope = useRef(null);
  useLayoutEffect(() => {
    let cleanup;
    const ctx = gsap.context((self, safe) => { cleanup = fn(safe); }, scope);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return scope;
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setSeen(true), io.disconnect()),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

/* Fades the wrapper up once, then pops its .pop-item children in with a stagger.
   Starts the moment the section's top edge enters the screen (not when it is centred). */
function Reveal({ as: Tag = 'div', className = '', threshold = 0.15, children, ...rest }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) return undefined;
    const items = [...el.querySelectorAll('.pop-item')].filter((i) => i.closest('.reveal') === el);
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0, y: 40 });
      if (items.length) gsap.set(items, { autoAlpha: 0, y: 70, scale: 0.92, rotate: () => gsap.utils.random(-3, 3) });
    }, el);
    const stop = watchEnter(el, () => ctx.add(() => {
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      if (items.length)
        gsap.to(items, { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.5)', stagger: 0.07, delay: 0.05 });
    }));
    return () => { stop(); ctx.revert(); };
  }, [threshold]);
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* Characters rise out of a mask one by one */
function Split({ text, className = '', delay = 0 }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) return undefined;
    const chars = el.querySelectorAll('.char');
    const ctx = gsap.context(() => {
      gsap.set(chars, { yPercent: 118, rotate: 9, transformOrigin: '0% 100%' });
    }, el);
    const stop = watchEnter(el, () => ctx.add(() => {
      gsap.to(chars, { yPercent: 0, rotate: 0, duration: 1.15, ease: 'power4.out', stagger: 0.028, delay });
    }));
    return () => { stop(); ctx.revert(); };
  }, [text, delay]);
  return (
    <span ref={ref} className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((w, wi, arr) => (
        <span className="word" key={wi} aria-hidden="true">
          {[...w].map((c, ci) => <span className="char" key={ci}>{c}</span>)}
          {wi < arr.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

/* ==========================================================================
   Shapes (the colourful gradient flair used all over gsap.com)
   ========================================================================== */
let uidCount = 0;
const useUid = () => useState(() => `g${++uidCount}`)[0];

const STOPS = {
  orangePink: [[0.2, '#ff8709'], [0.85, '#f7bdf8']],
  sunset: [[0, '#ffebe7'], [0.55, '#ff9c7c'], [0.85, '#ff774b'], [1, '#e76f00']],
  purple: [[0, '#e193ff'], [0.67, '#8e78da'], [1, '#dfc7e8']],
  sky: [[0, '#f0fcff'], [0.6, '#9bedff'], [0.85, '#5be1ff'], [1, '#00bae2']],
  pinkBlue: [[0.25, '#fec5fb'], [0.85, '#00bae2']],
  greenBlue: [[0, '#0ae448'], [1, '#0085d0']],
  mint: [[0.2, '#d1ffbc'], [0.6, '#0ae448'], [1, '#0aa3e4']],
  lilac: [[0.2, '#dfdcff'], [1, '#a69eff']],
  violet: [[0.2, '#f7bdf8'], [1, '#2f3cc0']],
  hotpink: [[0, '#ffe2f2'], [0.5, '#ffadda'], [0.8, '#ff7cc5'], [1, '#f84fac']],
  lipstick: [[0.3, '#cd237f'], [1, '#f7bdf8']],
};

function Grad({ id, kind }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      {STOPS[kind].map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
    </linearGradient>
  );
}

function Shape({ type, grad = 'orangePink', className = '', style }) {
  const id = useUid();
  const fill = `url(#${id})`;
  let body;
  switch (type) {
    case 'windmill':
      body = (
        <g fill={fill}>
          {[0, 90, 180, 270].map((r) => <path key={r} transform={`rotate(${r} 50 50)`} d="M53 47V5A44 44 0 0 1 95 47Z" />)}
        </g>
      );
      break;
    case 'flower4':
      body = (
        <g fill={fill}>
          <circle cx="32" cy="32" r="26" /><circle cx="68" cy="32" r="26" />
          <circle cx="32" cy="68" r="26" /><circle cx="68" cy="68" r="26" />
        </g>
      );
      break;
    case 'star':
      body = <path d="M50 10V90M10 50H90M22 22L78 78M78 22L22 78" fill="none" stroke={fill} strokeWidth="11" strokeLinecap="round" />;
      break;
    case 'bolt':
      body = <path d="M64 4 24 56h24L36 96 78 40H54Z" fill={fill} stroke={fill} strokeWidth="3" strokeLinejoin="round" />;
      break;
    case 'hourglass':
      body = <path d="M16 10H84L54 50 84 90H16L46 50Z" fill={fill} stroke={fill} strokeWidth="8" strokeLinejoin="round" />;
      break;
    case 'halfcircle':
      body = <path d="M0 100A50 50 0 0 1 100 100Z" fill={fill} />;
      break;
    case 'ring':
      body = <path fillRule="evenodd" fill={fill} d="M50 4A46 46 0 1 1 49.99 4ZM50 30A20 20 0 1 0 50.01 30Z" />;
      break;
    case 'squiggle':
      body = <path d="M34 6C74 14 74 28 30 36S74 58 30 66S66 90 44 96" fill="none" stroke={fill} strokeWidth="14" strokeLinecap="round" />;
      break;
    case 'circle':
      body = <circle cx="50" cy="50" r="46" fill={fill} />;
      break;
    case 'diamond':
    default:
      body = <path d="M50 8 92 50 50 92 8 50Z" fill={fill} stroke={fill} strokeWidth="6" strokeLinejoin="round" />;
  }
  return (
    <svg className={`shape ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <defs><Grad id={id} kind={grad} /></defs>
      {body}
    </svg>
  );
}

const BRACE =
  'M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z';

/* { Label } with curly braces that slide in */
function Subtitle({ children, large = false, className = '' }) {
  const ref = useGsap((safe) => {
    if (prefersReduced()) return undefined;
    const el = ref.current;
    gsap.set(el, { autoAlpha: 0 });
    return watchEnter(el, safe(() => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.from('.sb-l', { xPercent: 400, autoAlpha: 0, duration: 0.9, ease: 'power3.out' });
      gsap.from('.sb-r', { xPercent: -400, autoAlpha: 0, duration: 0.9, ease: 'power3.out' });
      gsap.from('.sub-label', { autoAlpha: 0, y: 14, duration: 0.7, delay: 0.2 });
    }));
  });
  return (
    <div ref={ref} className={`subtitle ${large ? 'subtitle-large' : ''} ${className}`}>
      <span className="sb sb-l"><svg viewBox="0 0 27 78" aria-hidden="true"><path fill="currentColor" d={BRACE} /></svg></span>
      <p className="sub-label">{children}</p>
      <span className="sb sb-r"><svg viewBox="0 0 27 78" aria-hidden="true" style={{ transform: 'scaleX(-1)' }}><path fill="currentColor" d={BRACE} /></svg></span>
    </div>
  );
}

/* Hovering the button throws little shapes into the air */
function BurstButton({ to, children, className = '' }) {
  const ref = useRef(null);
  const burst = () => {
    ref.current.querySelectorAll('.burst').forEach((b, i) => {
      gsap.fromTo(
        b,
        { autoAlpha: 1, scale: 0, x: 0, y: 10, rotation: 0 },
        {
          scale: 1,
          x: gsap.utils.random(-80, 80),
          y: gsap.utils.random(-100, -55),
          rotation: gsap.utils.random(-180, 180),
          duration: 0.8,
          ease: 'back.out(2)',
          delay: i * 0.05,
          onComplete: () => gsap.to(b, { autoAlpha: 0, scale: 0, duration: 0.4 }),
        }
      );
    });
  };
  return (
    <span className="burst-wrap" ref={ref} onMouseEnter={burst}>
      <Shape type="circle" grad="orangePink" className="burst b1" />
      <Shape type="windmill" grad="sky" className="burst b2" />
      <Shape type="diamond" grad="pinkBlue" className="burst b3" />
      <Shape type="star" grad="greenBlue" className="burst b4" />
      <Link to={to} className={`btn btn-ring ${className}`}>
        <span>{children}</span>
        <span className="ring-icon" aria-hidden="true">↓</span>
      </Link>
    </span>
  );
}

/* ==========================================================================
   Shared small components
   ========================================================================== */
function SocialLinks() {
  return (
    <div className="social-links">
      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
      </a>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" /></svg>
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

function PageHero({ sub, title, desc, image, shapes = [['windmill', 'orangePink'], ['flower4', 'purple']] }) {
  const ref = useGsap(() => {
    gsap.utils.toArray('.hero-shape').forEach((s, i) => {
      gsap.from(s, { scale: 0, rotation: gsap.utils.random(-200, 200), duration: 1.4, ease: 'elastic.out(1,.6)', delay: 0.4 + i * 0.18 });
      gsap.to(s.querySelector('svg'), {
        y: gsap.utils.random(-22, -12), rotation: gsap.utils.random(-14, 14),
        duration: gsap.utils.random(2.2, 3.4), ease: 'sine.inOut', yoyo: true, repeat: -1,
      });
    });
    gsap.from('.hero-sub', { autoAlpha: 0, y: 20, duration: 0.8, delay: 0.1 });
    gsap.from('.hero-desc', { autoAlpha: 0, y: 30, duration: 0.9, delay: 0.9 });
    if (image) {
      gsap.fromTo(ref.current, { '--bgy': '40%' }, {
        '--bgy': '75%', ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  });
  return (
    <header ref={ref} className={`hero ${image ? 'has-image' : ''}`} style={image ? { '--hero-img': `url(${image})` } : undefined}>
      {shapes.map(([t, g], i) => (
        <span key={t} className={`hero-shape hs${i + 1}`}><Shape type={t} grad={g} /></span>
      ))}
      <div className="hero-inner">
        <Subtitle className="hero-sub">{sub}</Subtitle>
        <h1 className="hero-title"><Split text={title} delay={0.2} /></h1>
        <p className="hero-desc">{desc}</p>
      </div>
    </header>
  );
}

function Loading({ text }) {
  return (
    <div className="loading-state"><div className="spinner" /><p>{text}</p></div>
  );
}

function EmptyState({ title, text, onClear }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
      {onClear && <button className="btn btn-outline" onClick={onClear}>Clear filters</button>}
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
        >★</span>
      ))}
      {interactive && <span className="rating-text">{rating} out of 5</span>}
    </span>
  );
}

function RatingBars({ reviews }) {
  const ref = useGsap(() => {
    const stops = gsap.utils.toArray('.bar-fill').map((b) => {
      const w = b.dataset.w;
      const tw = gsap.fromTo(b, { width: '0%' }, { width: `${w}%`, duration: 1.2, ease: 'power3.out', paused: true });
      return watchEnter(b, () => tw.play());
    });
    return () => stops.forEach((st) => st());
  }, [reviews.length]);
  return (
    <div className="rating-bars" ref={ref}>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => parseInt(r.rating, 10) === star).length;
        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
        return (
          <div key={star} className="bar-row">
            <span className="bar-label">{star} ★</span>
            <div className="bar"><div className="bar-fill" data-w={pct} style={{ width: `${pct}%` }} /></div>
            <span className="bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function SectionHead({ eyebrow, title, desc }) {
  return (
    <Reveal className="section-head">
      {eyebrow && <Subtitle>{eyebrow}</Subtitle>}
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          {/* logo first, then the brand name */}
          <h3 className="footer-logo">
            <img src={LOGO_URL} alt="Shree Shyam IT Solutions logo" className="footer-logo-img" />
            <BrandName />
          </h3>
          <p className="footer-text">Creating innovative digital solutions that help businesses grow and succeed in the modern world.</p>
          <SocialLinks />
        </div>
        <div className="fc-green">
          <h4>Quick links</h4>
          <ul>{NAV_ITEMS.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}</ul>
        </div>
        <div className="fc-orange">
          <h4>Services</h4>
          <ul>
            <li>Custom Websites</li><li>E-commerce Stores</li><li>Web Applications</li>
            <li>Mobile Apps</li><li>Software Development</li>
          </ul>
        </div>
        <div className="fc-blue">
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
        {/* manual admin button (the keyboard shortcut does not exist on phones) */}
        <Link to="/admin" className="admin-link">Admin</Link>
      </div>
    </footer>
  );
}

/* ==========================================================================
   Home data
   ========================================================================== */
const devicon = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}-original.svg`;

const HOME_IMG = { cta: unsplash('1531482615713-2afd69097998', 1600) };

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

const MARQUEE_WORDS = ['Websites', 'E-commerce', 'Mobile Apps', 'Custom Software', 'UI / UX Design', 'API Integration', 'Cloud Hosting', 'SEO', 'Maintenance', 'Web Applications'];

const PROCESS = [
  { title: 'Discover', text: 'We listen to your goals, audience and budget, then agree on scope and timeline.', s: 0, e: 38, c: '#0ae448' },
  { title: 'Design', text: 'Wireframes and visual designs you can review and approve before any code is written.', s: 18, e: 60, c: '#fec5fb' },
  { title: 'Develop', text: 'Clean, tested code with regular progress demos so there are no surprises.', s: 40, e: 82, c: '#00bae2' },
  { title: 'Deliver', text: 'Launch, training and ongoing support to keep your product running smoothly.', s: 62, e: 100, c: '#ff8709' },
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

const STATEMENT =
  'We turn ideas into *websites,* *apps* and *software* that feel *alive.* Delivering *lightning-fast* performance and support that never stops, so you can focus on *growing.*';

/* ==========================================================================
   Home sections
   ========================================================================== */
function Hero() {
  const ref = useGsap(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hf-windmill', { x: () => -window.innerWidth / 2, rotation: -360, autoAlpha: 0, duration: 1.5 })
      .from('.hf-ring', { yPercent: 220, autoAlpha: 0, duration: 1.3, ease: 'power4.out' }, 0.3)
      .from('.hf-star', { scale: 0, rotation: -200, duration: 1.1, ease: 'back.out(1.7)' }, 0.5)
      .from('.hf-bolt', { scale: 0, rotation: 25, duration: 1.4, ease: 'elastic.out(1,.5)' }, 0.8)
      .from('.hf-diamond', { scale: 0, rotation: 180, duration: 1, ease: 'back.out(2)' }, 1)
      .from('.hf-squiggle', { autoAlpha: 0, yPercent: 100, rotation: 180, duration: 1.5, ease: 'back.out(1.6)' }, 1.1)
      .from('.hero-pill', { autoAlpha: 0, y: 20, duration: 0.8 }, 0.1)
      .from('.hero-bottom > *, .hero-points li', { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.12 }, 1.6);

    /* idle motion */
    gsap.to('.hf-windmill svg', { rotation: 360, duration: 16, ease: 'none', repeat: -1 });
    gsap.to('.hf-star svg', { rotation: -360, duration: 10, ease: 'none', repeat: -1 });
    gsap.to('.hf-ring svg', { rotation: 360, duration: 22, ease: 'none', repeat: -1 });
    gsap.to('.hf-bolt svg', { rotation: 8, scale: 1.06, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.hf-diamond svg', { rotation: 90, duration: 0.8, ease: 'elastic.out(1,.6)', repeat: -1, repeatDelay: 1.4, repeatRefresh: true });
    gsap.to('.hf-squiggle svg', { rotation: 6, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    /* mouse parallax, deeper layers move more */
    const movers = gsap.utils.toArray('.hf').map((el) => {
      const svg = el.querySelector('svg');
      return { d: parseFloat(el.dataset.depth) || 1, x: gsap.quickTo(svg, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(svg, 'y', { duration: 1.2, ease: 'power3' }) };
    });
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => { m.x(nx * 70 * m.d); m.y(ny * 70 * m.d); });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  });

  return (
    <section className="home-hero" ref={ref}>
      <div className="hf hf-windmill" data-depth="1.2"><Shape type="windmill" grad="orangePink" /></div>
      <div className="hf hf-ring" data-depth="0.8"><Shape type="ring" grad="purple" /></div>
      <div className="hf hf-star" data-depth="1.6"><Shape type="star" grad="sunset" /></div>
      <div className="hf hf-bolt" data-depth="1.4"><Shape type="bolt" grad="mint" /></div>
      <div className="hf hf-diamond" data-depth="1"><Shape type="diamond" grad="sky" /></div>
      <div className="hf hf-squiggle" data-depth="2.4"><Shape type="squiggle" grad="purple" /></div>

      <div className="home-hero-text">
        <p className="hero-pill"><b>New</b> Now booking websites, apps and software</p>
        <h1 aria-label="We design it. We build it. You grow with it.">
          <span className="hl hl-1"><Split text="We design it." delay={0.2} /></span>
          <span className="hl hl-2"><Split text="We build it." delay={0.5} /></span>
          <span className="hl hl-3 grad"><Split text="You grow with it." delay={0.8} /></span>
        </h1>
        <div className="hero-bottom">
          <Subtitle large className="hero-lede">
            Websites, software and mobile apps built with care, tested on real devices and delivered on time, with support that continues after launch.
          </Subtitle>
          <BurstButton to="/contact">Get a free quote</BurstButton>
        </div>
        <ul className="hero-points">
          <li>Free consultation</li><li>Reply within 24 hours</li><li>Post-launch support</li>
        </ul>
      </div>
    </section>
  );
}

/* Endless ticker that speeds up with your scroll velocity */
function Marquee() {
  const ref = useGsap(() => {
    const track = ref.current.querySelector('.marquee-track');
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 32, repeat: -1 });
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = 1 + Math.min(8, Math.abs(self.getVelocity()) / 260);
        gsap.timeline({ overwrite: true })
          .to(loop, { timeScale: boost * self.direction, duration: 0.2 })
          .to(loop, { timeScale: self.direction, duration: 1.4 });
      },
    });
  });
  const items = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="marquee" aria-hidden="true" ref={ref}>
      <div className="marquee-track">
        {[0, 1].map((n) => (
          <div className="marquee-set" key={n}>
            {items.map((w, i) => (
              <span key={i} className={`marquee-item ${i % 2 ? 'outline' : ''}`}>
                {w}<Shape type={['star', 'diamond', 'circle', 'windmill'][i % 4]} grad={['sunset', 'sky', 'purple', 'orangePink'][i % 4]} className="marquee-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Big statement: words light up with scroll, highlighted letters flip green */
function Statement() {
  const ref = useGsap((safe) => {
    const words = gsap.utils.toArray('.sw');
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top 95%', end: 'bottom 70%', scrub: true },
    });
    const chars = gsap.utils.toArray('.hlw .c');
    const stops = [watchEnter(ref.current, safe(() => {
      gsap.fromTo(chars, { color: CREAM }, { color: GREEN, rotateX: 360, duration: 1.3, ease: 'power3.inOut', stagger: 0.05 });
    }))];
    gsap.utils.toArray('.sw-flair').forEach((s, i) => {
      const pop = gsap.from(s, { scale: 0, rotation: -180, ease: 'back.out(1.7)', duration: 1, delay: i * 0.15, paused: true });
      stops.push(watchEnter(ref.current, () => pop.play()));
      gsap.to(s.querySelector('svg'), { y: -14, rotation: 12, duration: 2.5 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    return () => stops.forEach((st) => st());
  });
  const words = STATEMENT.split(' ');
  return (
    <section className="statement" ref={ref}>
      <div className="statement-inner">
        <Subtitle>Why Shree Shyam</Subtitle>
        <h2 className="statement-text">
          {words.map((w, i) => {
            const m = w.match(/^\*(.+)\*$/);
            return (
              <span className={`sw ${m ? 'hlw' : ''}`} key={i}>
                {m ? [...m[1]].map((c, k) => <span className="c" key={k}>{c}</span>) : w}{' '}
              </span>
            );
          })}
        </h2>
        <span className="sw-flair sf1"><Shape type="star" grad="sunset" /></span>
        <span className="sw-flair sf2"><Shape type="flower4" grad="purple" /></span>
        <span className="sw-flair sf3"><Shape type="diamond" grad="violet" /></span>
      </div>
    </section>
  );
}

function Stats() {
  const scope = useGsap((safe) => {
    const stops = gsap.utils.toArray('.stat-number').map((el) => {
      const to = parseInt(el.dataset.to, 10);
      const o = { v: 0 };
      return watchEnter(el, safe(() => {
        gsap.to(o, { v: to, duration: 2.2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
      }));
    });
    return () => stops.forEach((st) => st());
  });
  return (
    <Reveal as="section" className="band">
      <div className="band-inner stats-strip" ref={scope}>
        {[
          [150, 'Projects delivered', 'Websites, apps and software', 'green'],
          [50, 'Happy clients', 'Startups and enterprises', 'pink'],
          [10, 'Countries served', 'Clients across the globe', 'orange'],
          [5, 'Years of experience', 'In software development', 'blue'],
        ].map(([to, label, desc, tint], i) => (
          <div key={label} className={`stats-strip-item pop-item t-${tint}`} style={{ '--k': i }}>
            <span className="stat-number" data-to={to}>0</span>
            <strong>{label}</strong>
            <span className="muted">{desc}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ---------- Pinned horizontal story (like the "Nice and Easy Easing" strip) ---------- */
const IN = {
  rise: { autoAlpha: 0, yPercent: 100, ease: 'power2.out', duration: 0.7 },
  drop: { autoAlpha: 0, yPercent: -250, rotate: -18, ease: 'elastic.out(1,.75)', duration: 1.3 },
  zoom: { autoAlpha: 0, scale: 4, ease: 'power4.inOut', duration: 1 },
  pop: { autoAlpha: 0, scale: 0, rotate: -200, ease: 'back.out(2)', duration: 0.9 },
  flip: { autoAlpha: 0, rotateX: -85, rotateY: -25, ease: 'back.out(1.4)', duration: 1.3 },
};
const CURVE_FROM = 'M3 146C116.996 146 74.3933 3.00001 188 3';
const CURVE_TO = 'M188 33.0001C188 160 2.99953 161 2.99955 33.0001';

const Chars = ({ t }) => [...t].map((c, i) => <span className="c" key={i}>{c === ' ' ? '\u00A0' : c}</span>);

function Story() {
  const root = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
        const pin = root.current.querySelector('.story-pin');
        const row = root.current.querySelector('.story-row');
        const dist = () => Math.max(0, row.scrollWidth - window.innerWidth);

        const scrollTween = gsap.to(row, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin, pin: true, scrub: 1, start: 'top top',
            end: () => '+=' + Math.round(dist() * 0.6),
            invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
          },
        });
        const cont = { containerAnimation: scrollTween, horizontal: true, start: 'left 98%' };

        /* generic entrances */
        row.querySelectorAll('[data-in]').forEach((el) => {
          const kind = el.dataset.in;
          if (kind === 'chars' || kind === 'charsX') {
            const chars = el.querySelectorAll('.c');
            gsap.from(chars, kind === 'chars'
              ? { autoAlpha: 0, yPercent: () => gsap.utils.random([-150, 150]), duration: () => gsap.utils.random(1, 2), ease: 'elastic.out(1,.75)', stagger: 0.1, scrollTrigger: { trigger: el, ...cont } }
              : { autoAlpha: 0, rotateX: 90, duration: 1.6, ease: 'softCustom', stagger: 0.12, scrollTrigger: { trigger: el, ...cont } });
          } else {
            gsap.from(el, { ...IN[kind], scrollTrigger: { trigger: el, ...cont } });
          }
        });

        /* landing panel */
        gsap.from('.story-chip-b', { rotateX: -95, duration: 4, ease: 'elastic.out(1,.3)', scrollTrigger: { trigger: root.current, start: 'top 90%' } });
        const land = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 90%' } });
        land.from('.sl-flower', { xPercent: 300, rotation: 360, scale: 0.4, duration: 1, ease: 'power4.out' })
          .from('.sl-half', { yPercent: -80, rotation: -180, scale: 0, duration: 1, ease: 'power4.out' }, 0.4)
          .from('.sl-hour', { xPercent: 550, yPercent: -140, rotation: 120, scale: 0, duration: 1.6, ease: 'elastic.out(1,.5)' }, 0.5)
          .from('.sl-ring', { xPercent: 350, yPercent: 100, rotation: 720, scale: 0, duration: 2, ease: 'elastic.out(1,.7)' }, 0.6)
          .from('.sl-dia', { xPercent: -250, yPercent: 200, rotation: 180, scale: 0, duration: 1.3, ease: 'elastic.out(1,.6)' }, 0.7);

        /* idle loops */
        gsap.to('.st-asterisk svg', { rotation: 360, duration: 4, ease: 'none', repeat: -1 });
        gsap.to('.st-diamond svg', { rotation: '+=90', duration: 0.7, ease: 'elastic.out(1,.75)', repeat: -1, repeatDelay: 1, repeatRefresh: true });
        gsap.to('.st-key svg', { y: -10, rotation: 8, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        /* curve that morphs while you scroll */
        const curve = row.querySelector('.st-curve');
        gsap.timeline({
          defaults: { duration: 2, ease: 'power3.inOut' },
          scrollTrigger: { trigger: curve, containerAnimation: scrollTween, horizontal: true, start: 'center center', scrub: 1 },
        })
          .to(curve.querySelector('.curve-path'), { morphSVG: CURVE_TO })
          .to(curve, { xPercent: 420, ease: 'none' }, '<')
          .to(curve.querySelector('.hd-1'), { rotation: -90, transformOrigin: '100% 50%' }, '<')
          .to(curve.querySelector('.hd-2'), { rotation: 90, transformOrigin: '0% 50%' }, '<');
      });
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 1023px)', () => {
        const chip = gsap.from('.story-chip-b', { rotateX: -95, duration: 4, ease: 'elastic.out(1,.3)', paused: true });
        const stop = watchEnter(root.current, () => chip.play());
        return () => stop();
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="story" ref={root}>
      <div className="story-pin">
        <p className="sr-only">Ideas become products. Add personality to your brand with a huge variety of super plug-and-play services, or build your own custom software. Design, build and launch in a snap.</p>
        <div className="story-row" aria-hidden="true">
          <div className="story-landing">
            <div className="story-heading">
              <div className="chip-a"><h3>Design &amp; Build</h3></div>
              <div className="chip-b-wrap"><div className="chip-b story-chip-b"><p>That's right, <b>Everything</b></p></div></div>
            </div>
            <div className="story-flair">
              <Shape type="halfcircle" grad="mint" className="sl-half" />
              <Shape type="flower4" grad="hotpink" className="sl-flower" />
              <Shape type="hourglass" grad="purple" className="sl-hour" />
              <Shape type="ring" grad="pinkBlue" className="sl-ring" />
              <Shape type="diamond" grad="orangePink" className="sl-dia" />
            </div>
            <p className="story-lead">Whether you need a website, a store or a mobile app, Shree Shyam has your back.</p>
          </div>

          <div className="story-track">
            <div className="sg sg-a">
              <span className="chip chip-lg chip-macha" data-in="drop">Ideas</span>
              <span className="chip chip-haze chip-up" data-in="drop">become</span>
              <span className="chip chip-crush chip-tilt" data-in="drop">Products</span>
            </div>
            <div className="sg sg-b">
              <span className="st-w" data-in="rise">Add</span>
              <span className="st-w st-personality" data-in="chars"><Chars t=" personality " /></span>
              <span className="st-w" data-in="rise">to your brand with a</span>
              <span className="st-w st-huge" data-in="zoom">&nbsp;huge&nbsp;</span>
              <span className="st-w" data-in="rise">variety of</span>
            </div>
            <div className="sg sg-c">
              <span className="st-asterisk" data-in="pop"><Shape type="star" grad="sunset" /></span>
              <span className="chip chip-lg chip-green chip-r1" data-in="flip">Super</span>
              <span className="chip chip-lg chip-pink chip-r2" data-in="flip">Plug-and-play</span>
              <span className="st-curve">
                <svg viewBox="0 0 191 149" aria-hidden="true">
                  <path className="curve-path" d={CURVE_FROM} fill="none" stroke={CREAM} strokeWidth="5" />
                  <g className="hd-1" transform="translate(150 3)"><rect x="-13" y="-8" width="16" height="16" fill={GREEN} stroke={CREAM} /><line x1="-13" x2="-135" y1="0" y2="0" stroke={CREAM} strokeDasharray="4 4" /><circle cx="-135" cy="0" r="6" fill={GREEN} stroke={CREAM} /></g>
                  <g className="hd-2" transform="translate(40 146)"><rect x="-3" y="-8" width="16" height="16" fill={GREEN} stroke={CREAM} /><line x1="13" x2="135" y1="0" y2="0" stroke={CREAM} strokeDasharray="4 4" /><circle cx="135" cy="0" r="6" fill={GREEN} stroke={CREAM} /></g>
                </svg>
              </span>
              <span className="st-w" data-in="rise">services</span>
            </div>
            <div className="sg sg-d">
              <span className="st-w" data-in="rise">, or build your own</span>
              <span className="st-w st-custom" data-in="charsX"><Chars t=" custom " /></span>
              <span className="st-w st-custom" data-in="charsX"><Chars t="software" /></span>
            </div>
            <div className="sg sg-e">
              <span className="chip chip-lg chip-pink" data-in="drop">Design</span>
              <span className="st-key" data-in="pop"><Shape type="bolt" grad="violet" /></span>
              <span className="chip chip-lg chip-green" data-in="drop">Build</span>
              <span className="chip chip-lg chip-orange" data-in="drop">Launch</span>
              <span className="st-w" data-in="rise">&nbsp;in a</span>
              <span className="st-diamond" data-in="pop"><Shape type="diamond" grad="violet" /></span>
              <span className="st-w" data-in="rise">snap</span>
            </div>
          </div>
        </div>

        <div className="story-mobile">
          <div className="story-heading">
            <div className="chip-a"><h3>Design &amp; Build</h3></div>
            <div className="chip-b-wrap"><div className="chip-b story-chip-b"><p><b>Everything</b></p></div></div>
          </div>
          <Reveal className="story-cards">
            {[['Ideas become products', 'We shape your idea into something people use and love.', 'green'],
              ['Super plug-and-play', 'Proven building blocks so you launch faster, without cutting corners.', 'pink'],
              ['Design, build, launch', 'One small team from first sketch to long after launch.', 'orange']].map(([t, d, c]) => (
              <div className={`card pop-item t-${c}`} key={t}><h3>{t}</h3><p className="muted">{d}</p></div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tool rows: each service gets its own animated graphic ---------- */
function VisualArch() {
  const id = useUid();
  const ref = useGsap(() => {
    const path = ref.current.querySelector('.arch-path');
    const tl = gsap.timeline({
      defaults: { duration: 1.5, ease: 'power3.inOut' },
      paused: true,
    }).to('.arch-ball', { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] } });
    return watchEnter(ref.current, () => tl.play());
  });
  return (
    <div className="tool-visual" ref={ref}>
      <svg viewBox="0 0 380 332" aria-hidden="true">
        <defs><Grad id={id} kind="pinkBlue" /></defs>
        <path fillRule="evenodd" fill={`url(#${id})`} d="M190 171.267C200.346 171.267 208.733 179.654 208.733 190V246.197C208.733 293.491 247.072 331.83 294.366 331.83C341.66 331.83 380 293.491 380 246.197V190C380 85.0658 294.934 0 190 0C85.0663 0 0.000549316 85.0658 0.000549316 190V246.197C0.000549316 293.491 38.34 331.83 85.6342 331.83C132.928 331.83 171.268 293.491 171.268 246.197V190C171.268 179.654 179.655 171.267 190 171.267Z" />
        <path className="arch-path" fill="none" stroke="none" d="M 85 246.1967 V 190.83 C 85 132.66 131.66 85.5 189.83 85.5 C 248 85.5 294.5 132.66 294.5 190.83 V 246.1967" />
        <g className="arch-ball"><circle cx="85.5" cy="246.5" r="86" fill={`url(#${id})`} /><circle cx="85.5" cy="246.5" r="86" fill="none" stroke="#0e100f" strokeWidth="6" /></g>
      </svg>
    </div>
  );
}

function VisualMorph() {
  const id = useUid();
  const gooId = `${id}goo`;
  const circle = 'M190 275C190 327.467 147.467 370 95 370C42.5329 370 0 327.467 0 275C0 222.533 42.5329 180 95 180C147.467 180 190 222.533 190 275Z';
  const ref = useGsap(() => {
    const target = ref.current.querySelector('.mo-square');
    const tl = gsap.timeline({
      defaults: { duration: 1.4, ease: 'power3.inOut' },
      paused: true,
    })
      .to('.mo-circle', { morphSVG: target }, 0)
      .fromTo('.mo-small', { transformOrigin: '80% 20%', scale: 0.3 }, { scale: 1 }, 0);
    return watchEnter(ref.current, () => tl.play());
  });
  return (
    <div className="tool-visual" ref={ref}>
      <svg viewBox="0 0 372 370" aria-hidden="true">
        <defs>
          <Grad id={id} kind="sunset" />
          <filter id={gooId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
        <g filter={`url(#${gooId})`} fill={`url(#${id})`}>
          <path className="mo-small" d={circle} />
          <path className="mo-circle" d={circle} />
        </g>
        <path className="mo-square" fill="none" d="M85 8C85 3.58172 88.5817 0 93 0H363.884C368.302 0 371.884 3.58172 371.884 8V277C371.884 281.418 368.302 285 363.884 285H93C88.5817 285 85 281.418 85 277V8Z" />
      </svg>
    </div>
  );
}

function VisualText() {
  const ref = useGsap(() => {
    const tl = gsap.timeline({ paused: true })
      .from('.tx-wrap-circle', { xPercent: 100, yPercent: 100, rotation: 180, duration: 1, ease: 'power4.inOut' })
      .from('.tx-wrap-square', { xPercent: -100, yPercent: -100, rotation: -180, duration: 1, ease: 'power4.inOut' }, '<')
      .from('.tx-a', { rotationX: 540, duration: 1.5, ease: 'power4.inOut' }, '<')
      .from('.tx-b', { rotationX: -180, duration: 0.8, ease: 'power4.inOut' }, '-=0.5')
      .from('.tx-square', { rotationX: 180, duration: 0.8, ease: 'power4.inOut' }, '<');
    return watchEnter(ref.current, () => tl.play());
  });
  return (
    <div className="tool-visual tx-grid" ref={ref} aria-hidden="true">
      <div className="tx-wrap tx-wrap-circle"><div className="tx-circle" /></div>
      <span className="tx-a">Ap</span>
      <span className="tx-b">ps</span>
      <div className="tx-wrap tx-wrap-square"><div className="tx-square" /></div>
    </div>
  );
}

/* UI / UX Design: the sliding 3x3 grid plus floating shapes on its sides */
function VisualGrid() {
  const ref = useGsap(() => {
    const c = ref.current.querySelectorAll('.ui-cell');
    gsap.set([c[0], c[2], c[4], c[6], c[8]], { opacity: 0 });
    const t = '<+0.1';
    const gridTl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power3.inOut' }, paused: true })
      .to(c[1], { yPercent: 100 })
      .to(c[3], { xPercent: 100 }, t)
      .to(c[5], { xPercent: -100 }, t)
      .to(c[7], { yPercent: -100 }, t)
      .set(c[4], { opacity: 1 })
      .to(c[7], { yPercent: '+=100', xPercent: '+=100' })
      .to(c[5], { yPercent: '+=100', xPercent: '-=100' }, t)
      .to(c[3], { yPercent: '-=100', xPercent: '-=100' }, t)
      .to(c[1], { yPercent: '-=100', xPercent: '+=100' }, t);

    /* side shapes: pop in, then float and spin gently */
    let popShapes;
    if (!prefersReduced()) {
      popShapes = gsap.from('.ui-shape', {
        scale: 0, rotation: () => gsap.utils.random(-220, 220), autoAlpha: 0,
        duration: 1.3, ease: 'elastic.out(1,.6)', stagger: 0.15, delay: 0.3,
        paused: true,
      });
      gsap.to('.us1 svg', { rotation: 360, duration: 14, ease: 'none', repeat: -1 });
      gsap.to('.us2 svg', { y: -14, rotation: 14, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.us3 svg', { rotation: -360, duration: 9, ease: 'none', repeat: -1 });
      gsap.to('.us4 svg', { rotation: '+=90', duration: 0.8, ease: 'elastic.out(1,.6)', repeat: -1, repeatDelay: 1.4, repeatRefresh: true });
    }
    return watchEnter(ref.current, () => { gridTl.play(); if (popShapes) popShapes.play(); });
  });
  return (
    <div className="tool-visual" ref={ref} aria-hidden="true">
      <div className="ui-grid">
        {Array.from({ length: 9 }, (_, i) => <div className="ui-cell" key={i} />)}
      </div>
      <span className="ui-shape us1"><Shape type="windmill" grad="orangePink" /></span>
      <span className="ui-shape us2"><Shape type="flower4" grad="purple" /></span>
      <span className="ui-shape us3"><Shape type="star" grad="sunset" /></span>
      <span className="ui-shape us4"><Shape type="diamond" grad="pinkBlue" /></span>
    </div>
  );
}

const TOOL_ROWS = [
  { title: 'Web Services', tint: 'pink', text: 'Custom websites, web applications and e-commerce solutions.', features: ['Responsive design', 'E-commerce platforms', 'Custom web apps', 'Progressive web apps'], visual: <VisualArch /> },
  { title: 'Software Services', tint: 'orange', text: 'Enterprise software, desktop applications and custom development.', features: ['Enterprise solutions', 'Desktop applications', 'Custom software', 'API integration'], visual: <VisualMorph /> },
  { title: 'Application Services', tint: 'lilac', text: 'Mobile apps, cross-platform solutions and app maintenance.', features: ['Android apps', 'iOS apps', 'App maintenance', 'Cross-platform'], visual: <VisualText /> },
  { title: 'UI / UX Design', tint: 'blue', text: 'Interfaces people enjoy using, from first wireframe to polished handoff.', features: ['Wireframes', 'Design systems', 'Prototypes', 'Usability review'], visual: <VisualGrid /> },
];

function Tools() {
  /* every service row slides in from the side (alternating left / right), also on phones */
  const ref = useGsap(() => {
    if (prefersReduced()) return;
    const mobile = window.innerWidth < 1024;
    const dist = mobile ? 70 : 140;
    const stops = [];
    gsap.utils.toArray('.tool-row').forEach((row, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      const visual = row.querySelector('.tool-visual-col');
      const items = row.querySelectorAll('.tool-copy > *');
      const tl = gsap.timeline({ paused: true })
        .from(visual, { x: dir * dist, autoAlpha: 0, rotate: dir * 6, duration: 1, ease: 'power3.out' })
        .from(items, { x: -dir * dist, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0.1);
      stops.push(watchEnter(row, () => tl.play()));
    });
    return () => stops.forEach((st) => st());
  });
  return (
    <section className="band tools-sec" ref={ref}>
      <div className="band-inner">
        <SectionHead eyebrow="What we do" title="Everything you need to launch and grow online." />
        <div className="tool-rows">
          {TOOL_ROWS.map((r) => (
            <Reveal className="tool-row" key={r.title}>
              <div className="tool-visual-col">{r.visual}</div>
              <div className="tool-copy">
                <h3 className={`tool-title t-${r.tint}`}>{r.title}</h3>
                <p className="tool-text">{r.text}</p>
                <ul className="chips">{r.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link to="/contact" className="btn btn-outline">Get a quote</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Process timeline: auto-plays, then can be scrubbed by hand */
function ProcessTimeline() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(true);
  const [ref, seen] = useInView(0.15);
  const raf = useRef();

  useEffect(() => {
    if (!seen || !auto) return undefined;
    let start;
    const tick = (now) => {
      start ??= now;
      const p = ((now - start) / 4500) * 100;
      if (p >= 100) { setT(100); setAuto(false); return; }
      setT(p);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [seen, auto]);

  const current = [...PROCESS].reverse().find((p) => t >= p.s) || PROCESS[0];

  return (
    <section className="band band-dark" id="process" ref={ref}>
      <div className="band-inner">
        <SectionHead eyebrow="How we work" title="From idea to launch in four steps" desc="Drag the playhead to move through a simple, transparent process." />
        <Reveal className="tl-card tl">
          {PROCESS.map((b) => {
            const fill = Math.min(1, Math.max(0, (t - b.s) / (b.e - b.s)));
            return (
              <div className="tl-row" key={b.title}>
                <span className="tl-name" style={{ color: b.c }}>{b.title}</span>
                <div className="tl-track">
                  <div className="tl-bar" style={{ left: `${b.s}%`, width: `${b.e - b.s}%`, '--c': b.c }}>
                    <i style={{ width: `${fill * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          <input
            className="scrub" type="range" min="0" max="100" step="0.1" value={t}
            aria-label="Process timeline position"
            onChange={(e) => { setAuto(false); setT(+e.target.value); }}
          />
          <div className="tl-foot">
            <button className="btn btn-outline btn-small" onClick={() => { setT(0); setAuto(true); }}>Replay</button>
            <span>{Math.round(t)}% complete</span>
          </div>
          <p className="tl-note" key={current.title}><strong style={{ color: current.c }}>{current.title}.</strong> {current.text}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* Scroll position scrubs an orb, heading bars and three cards */
function WhyScrub() {
  const ref = useGsap(() => {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: ref.current, start: 'top 98%', end: 'bottom 30%', scrub: 1 },
    })
      .fromTo('.sv-orb', { xPercent: -70, yPercent: 40, scale: 0.5, rotate: -90 }, { xPercent: 70, yPercent: -10, scale: 1.15, rotate: 180 }, 0)
      .from('.sv-head i', { scaleX: 0, transformOrigin: '0 50%', stagger: 0.1 }, 0.1)
      .from('.sv-card', { yPercent: 120, autoAlpha: 0, rotate: (i) => [-8, 0, 8][i], stagger: 0.12, ease: 'back.out(1.6)' }, 0.25);
  });
  return (
    <Reveal as="section" className="band">
      <div className="band-inner two">
        <div>
          <Subtitle>Why Shree Shyam</Subtitle>
          <h2>A team that treats your project like its own</h2>
          <p className="muted lead">
            We are a small, focused team, so you talk directly to the people building your product. No account
            managers in between, no hidden costs.
          </p>
          <ul className="why-list">
            {WHY_POINTS.map(([t, d]) => (
              <li key={t}><span className="tick">✓</span><div><strong>{t}</strong><p>{d}</p></div></li>
            ))}
          </ul>
          <Link to="/about" className="btn btn-outline">More about us</Link>
        </div>
        <div className="card scrub-vis" ref={ref}>
          <div className="sv-orb" />
          <div className="sv-head"><i style={{ width: '80%' }} /><i style={{ width: '55%' }} /></div>
          <div className="sv-card sv-l"><strong>Fixed pricing</strong><small>Written quote first</small></div>
          <div className="sv-card sv-c"><strong>24h reply</strong><small>Average first response</small></div>
          <div className="sv-card sv-r"><strong>Support</strong><small>Long after launch</small></div>
        </div>
      </div>
    </Reveal>
  );
}

function Compare() {
  return (
    <section className="band band-cream">
      <div className="band-inner">
        <SectionHead eyebrow="Why a custom build" title="Shree Shyam vs. do-it-yourself" desc="What changes when a dedicated team builds your product." />
        <Reveal className="compare-wrap">
          <div className="compare">
            <div className="compare-row compare-head">
              <div>What you get</div><div>Shree Shyam IT Solutions</div><div>Templates and DIY</div>
            </div>
            {COMPARE.map(([a, b, c]) => (
              <div key={a} className="compare-row pop-item"><div>{a}</div><div>{b}</div><div>{c}</div></div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section className="band">
      <div className="band-inner">
        <SectionHead eyebrow="Who we build for" title="Industries we serve" desc="From local shops to growing companies, we have built for a wide range of businesses." />
        <Reveal className="industry-grid">
          {INDUSTRIES.map((i, k) => (
            <div key={i.name} className="industry-tile pop-item" style={{ '--k': k }}>
              <img src={i.img} alt="" loading="lazy" onError={hideOnError} />
              <span>{i.name}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* Technology tiles ripple outward from whichever one you click */
function TechRipple() {
  const ref = useRef(null);
  const fire = useCallback((i) => {
    const tiles = ref.current?.querySelectorAll('.tech-tile');
    if (!tiles?.length) return;
    gsap.fromTo(tiles,
      { scale: 0.6, y: 30, opacity: 0.3, rotate: () => gsap.utils.random(-12, 12) },
      { scale: 1, y: 0, opacity: 1, rotate: 0, duration: 1, ease: 'elastic.out(1,.6)', overwrite: true,
        stagger: { each: 0.08, grid: [2, 4], from: i } });
  }, []);
  useLayoutEffect(() => {
    return watchEnter(ref.current, () => fire(1));
  }, [fire]);
  return (
    <Reveal as="section" className="band band-dark">
      <div className="band-inner two">
        <div>
          <Subtitle>Our stack</Subtitle>
          <h2>Technologies we work with</h2>
          <p className="muted lead">We pick the right tools for the job, and we work with yours too. Click a tile.</p>
        </div>
        <div className="tech-grid" ref={ref}>
          {TECHNOLOGIES.map((t, i) => (
            <button key={t.name} className="tech-tile" onClick={() => fire(i)} aria-label={t.name}>
              {t.image && <img src={t.image} alt="" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />}
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

const TXT = 'Ideas Into Software';
const MODES = ['chars', 'words', 'scramble'];

/* Headline that cycles through split / words / scramble effects */
function TextShowcase() {
  const host = useRef(null);
  const label = useRef(null);
  useLayoutEffect(() => {
    const el = host.current;
    let idx = 0;
    let anim;
    let call;
    const play = () => {
      const mode = MODES[idx % MODES.length];
      el.textContent = '';
      label.current.textContent = `split: '${mode}'`;
      if (mode === 'scramble') {
        anim = gsap.to(el, { duration: 2, scrambleText: { text: TXT, chars: 'アカサタナ#%&01<>/', speed: 0.6, revealDelay: 0.3 } });
      } else {
        (mode === 'chars' ? [...TXT] : TXT.split(' ')).forEach((u) => {
          const s = document.createElement('span');
          s.className = 'tsu';
          s.textContent = (u === ' ' ? '\u00A0' : u) + (mode === 'words' ? '\u00A0' : '');
          el.appendChild(s);
        });
        anim = gsap.from(el.children, mode === 'chars'
          ? { autoAlpha: 0, rotateX: 90, duration: 1.6, ease: 'softCustom', stagger: 0.06 }
          : { autoAlpha: 0, yPercent: 120, rotate: 6, duration: 1.2, ease: 'elastic.out(1,.6)', stagger: 0.2 });
      }
      call = gsap.delayedCall(anim.duration() + 1.6, () => { idx++; play(); });
    };
    const stop = watchEnter(el, play);
    return () => { stop(); anim?.kill(); call?.kill(); };
  }, []);
  return (
    <Reveal as="section" className="band band-lilac">
      <div className="band-inner two">
        <div>
          <Subtitle>What we ship</Subtitle>
          <h2>Whatever you imagine, we build it.</h2>
          <p className="muted lead">Websites, stores, mobile apps and business software, from the first sketch to long after launch.</p>
        </div>
        <div className="card ts-card">
          {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
          <h3 className="ts" ref={host} aria-label={TXT} />
          <p className="ts-label" ref={label} />
        </div>
      </div>
    </Reveal>
  );
}

function RecentWorks({ works }) {
  if (!works.length) return null;
  return (
    <section className="band">
      <div className="band-inner">
        <SectionHead eyebrow="Portfolio" title="Recent projects" />
        <div className="recent-works-list">
          {works.map((w, i) => (
            <Reveal key={w.id} className={`recent-work ${i % 2 === 1 ? 'reverse' : ''}`}>
              <Link to={`/work/${w.id}`} className="recent-work-image">
                <img src={w.thumbnail} alt={w.name} loading="lazy" onError={(e) => { e.target.src = placeholder(w.name); }} />
              </Link>
              <div className="recent-work-details">
                <span className="recent-num">0{i + 1}</span>
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
            </Reveal>
          ))}
        </div>
        <div className="center-row"><Link to="/works" className="btn btn-outline">View all projects</Link></div>
      </div>
    </section>
  );
}

function RecentReviews({ reviews, workMap }) {
  if (!reviews.length) return null;
  const stars = (r) => { const n = parseInt(r, 10) || 0; return '★'.repeat(n) + '☆'.repeat(5 - n); };
  return (
    <section className="band band-pink">
      <div className="band-inner">
        <SectionHead eyebrow="Testimonials" title="Client reviews" />
        <Reveal className="cards-3">
          {reviews.map((r, k) => (
            <div key={r.id} className="card review-mini pop-item" style={{ '--k': k }}>
              <span className="quote-mark">“</span>
              <span className="stars-text">{stars(r.rating)}</span>
              <p className="quote">{r.review || 'No review text'}</p>
              <div className="review-mini-foot">
                <div className="avatar">{(r.name || '?').charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{r.name || 'Anonymous'}</strong>
                  {workMap[r.workId] && <Link to={`/work/${r.workId}`} className="text-link block">on {workMap[r.workId].name}</Link>}
                </div>
              </div>
            </div>
          ))}
        </Reveal>
        <div className="center-row"><Link to="/reviews" className="btn btn-dark">View all reviews</Link></div>
      </div>
    </section>
  );
}

function Finale() {
  const ref = useGsap(() => {
    const stops = [];
    gsap.utils.toArray('.fin-shape').forEach((s, i) => {
      const pop = gsap.from(s, { scale: 0, rotation: gsap.utils.random(-240, 240), duration: 1.4, ease: 'elastic.out(1,.6)', delay: i * 0.12, paused: true });
      stops.push(watchEnter(ref.current, () => pop.play()));
      gsap.to(s.querySelector('svg'), { y: gsap.utils.random(-24, -12), rotation: gsap.utils.random(-20, 20), duration: gsap.utils.random(2, 3.4), ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    return () => stops.forEach((st) => st());
  });
  return (
    <section className="finale" ref={ref}>
      <span className="fin-shape fs1"><Shape type="windmill" grad="orangePink" /></span>
      <span className="fin-shape fs2"><Shape type="star" grad="sunset" /></span>
      <span className="fin-shape fs3"><Shape type="flower4" grad="purple" /></span>
      <span className="fin-shape fs4"><Shape type="bolt" grad="mint" /></span>
      <Subtitle>Let's talk</Subtitle>
      <h2><Split text="Ready to start your project?" /></h2>
      <p>Tell us what you need and we will reply within 24 hours.</p>
      <div className="btn-row center">
        <BurstButton to="/contact">Contact us</BurstButton>
        <a href="tel:+916284086208" className="btn btn-outline btn-large">Call +91 62840-86208</a>
      </div>
    </section>
  );
}

function Home() {
  const [recentWorks, setRecentWorks] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [workMap, setWorkMap] = useState({});

  const loadData = useCallback(async () => {
    try {
      const [worksData, reviewsData] = await Promise.all([getWorks(), getReviews()]);
      const works = worksData.map((w) => ({ ...w, thumbnail: w.thumbnail || placeholder(w.name) }));
      const map = {};
      works.forEach((w) => (map[w.id] = { name: w.name }));
      setWorkMap(map);
      setRecentWorks([...works].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3));
      setRecentReviews([...reviewsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));
      safeRefresh(400);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  return (
    <>
      <Hero />
      <Marquee />
      <Statement />
      <Stats />
      <Story />
      <Tools />
      <ProcessTimeline />
      <WhyScrub />
      <Compare />
      <Industries />
      <TechRipple />
      <TextShowcase />
      <RecentWorks works={recentWorks} />
      <RecentReviews reviews={recentReviews} workMap={workMap} />
      <Finale />
    </>
  );
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
      try { setWorks(await getWorks()); } catch (e) { console.error('Error loading works:', e); } finally { setLoading(false); }
    })();
  }, []);
  useEffect(() => { if (!loading) safeRefresh(300); }, [loading]);

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
        sub="Our portfolio" title="Featured works"
        desc="Explore our collection of digital solutions that have helped businesses grow and succeed online."
        image={unsplash('1498050108023-c5249f4df085', 1920)}
        shapes={[['halfcircle', 'mint'], ['diamond', 'orangePink'], ['star', 'sunset']]}
      />
      <div className="container">
        <Reveal className="highlights">
          {[
            ['Real clients', 'Every project here is live and in use.'],
            ['Built to convert', 'Designs focused on results, not just looks.'],
            ['Fully responsive', 'Works on phones, tablets and desktops.'],
          ].map(([t, d], k) => (
            <div key={t} className="highlight pop-item" style={{ '--k': k }}>
              <span className="tick">✓</span><div><strong>{t}</strong><p>{d}</p></div>
            </div>
          ))}
        </Reveal>

        <div className="toolbar">
          <div className="pill-filters">
            {categories.map((c) => (
              <button key={c} className={`pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="search-box">
            <input type="text" className="search-input" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <p className="results-count">Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</p>

        {filtered.length > 0 ? (
          <Reveal className="works-grid" threshold={0.05}>
            {filtered.map((work, k) => (
              <article key={work.id} className="work-card pop-item" style={{ '--k': k % 6 }}>
                <div className="work-thumb">
                  <img src={work.thumbnail} alt={work.name} onError={(e) => { e.target.src = placeholder(work.name); }} />
                  <div className="work-overlay">
                    <span className="chip-sm">{work.category || 'Web'}</span>
                    <button onClick={() => handleView(work)} className="btn btn-primary btn-small">
                      {work.videoLink ? 'Watch preview' : 'Visit site'}
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
          </Reveal>
        ) : (
          <EmptyState title="No projects found" text="Try a different search term or category." onClear={() => { setSearch(''); setCategory('All'); }} />
        )}

        <Reveal className="stats-row">
          <div className="stat-box pop-item"><span className="stat-number">{works.length}</span><span className="stat-label">Total projects</span></div>
          <div className="stat-box pop-item"><span className="stat-number">{works.filter((w) => w.videoLink).length}</span><span className="stat-label">With previews</span></div>
          <div className="stat-box pop-item"><span className="stat-number">{[...new Set(works.map((w) => w.category))].filter(Boolean).length}</span><span className="stat-label">Categories</span></div>
        </Reveal>

        <Reveal className="cta-block image-cta" style={{ '--cta-img': `url(${HOME_IMG.cta})` }}>
          <h2>Want a project like these?</h2>
          <p>Tell us your idea and get a free quote within 24 hours.</p>
          <Link to="/contact" className="btn btn-primary btn-large">Start your project</Link>
        </Reveal>
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
      setReviews(allReviews.filter((r) => r.workId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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

  const heroRef = useGsap(() => {
    if (!work) return;
    gsap.fromTo('.detail-hero', { '--bgy': '40%' }, { '--bgy': '80%', ease: 'none', scrollTrigger: { trigger: '.detail-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.detail-hero-content > :not(h1)', { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.12, delay: 0.5 });
  }, [work]);

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
    <div className="page" ref={heroRef}>
      <div className="detail-hero" style={{ '--detail-img': `url(${work.thumbnail})` }}>
        <div className="detail-hero-overlay">
          <div className="detail-hero-content">
            <span className="chip-sm">{work.category || 'Web Development'}</span>
            <h1><Split text={work.name} delay={0.2} /></h1>
            <div className="detail-meta">
              <span>{getDomainFromUrl(work.viewLink)}</span>
              <span>Rating {average} ({reviews.length} reviews)</span>
            </div>
            <button onClick={() => window.open(formatUrl(work.viewLink), '_blank', 'noopener,noreferrer')} className="btn btn-primary btn-large">
              Visit website
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* the whole project image, uncropped */}
        {work.thumbnail && (
          <div className="detail-full">
            <img src={work.thumbnail} alt={work.name} onError={(e) => { e.target.src = placeholder(work.name); }} />
          </div>
        )}

        <div className="tabs">
          {[['overview', 'Overview'], ['reviews', `Reviews (${reviews.length})`], ['details', 'Project details']].map(([k, label]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <Reveal className="panel stack">
            <section><h2>About this project</h2><p className="prose">{work.description}</p></section>
            {work.technologies && (
              <section>
                <h2>Technologies used</h2>
                <div className="tags large">{work.technologies.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>
              </section>
            )}
            {work.features && (
              <section>
                <h2>Key features</h2>
                <ul className="check-list">{work.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
              </section>
            )}
          </Reveal>
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
                      <div className="review-who"><strong>{r.name}</strong><Stars rating={parseInt(r.rating, 10)} /></div>
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
                <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <div className="rating-field">
                  <label>Your rating</label>
                  <Stars rating={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size="lg" />
                </div>
                <textarea placeholder="Share your experience with this project..." rows="4" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} required />
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit review'}</button>
              </form>
            </section>
          </div>
        )}

        {tab === 'details' && (
          <Reveal className="panel stack">
            <div className="details-grid">
              {[
                ['Project type', work.category || 'Web Development'],
                ['Client', work.client || 'Confidential'],
                ['Year', work.year || '2024'],
                ['Duration', work.duration || '3 months'],
              ].map(([l, v]) => (
                <div key={l} className="detail-item pop-item"><span className="muted">{l}</span><strong>{v}</strong></div>
              ))}
            </div>
            <section>
              <h3>Project links</h3>
              <div className="links-list">
                <a href={formatUrl(work.viewLink)} target="_blank" rel="noopener noreferrer" className="project-link">Live website</a>
                {work.githubLink && <a href={formatUrl(work.githubLink)} target="_blank" rel="noopener noreferrer" className="project-link">Source code</a>}
                {work.caseStudyLink && <a href={formatUrl(work.caseStudyLink)} target="_blank" rel="noopener noreferrer" className="project-link">Case study</a>}
              </div>
            </section>
          </Reveal>
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
        worksData.forEach((w) => { map[w.id] = { name: w.name, thumbnail: w.thumbnail, category: w.category || 'Web Development' }; });
        setWorks(map);
        setReviews([...reviewsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) {
        console.error('Error loading reviews:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  useEffect(() => { if (!loading) safeRefresh(300); }, [loading]);

  const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const q = search.trim().toLowerCase();
  const filtered = (filterWork === 'all' ? [...reviews] : reviews.filter((r) => r.workId === filterWork))
    .filter((r) => !q || (r.name || '').toLowerCase().includes(q) || (r.review || '').toLowerCase().includes(q) || (works[r.workId]?.name || '').toLowerCase().includes(q))
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
        sub="Client feedback" title="Customer reviews"
        desc="See what our clients say about our work. We value every piece of feedback."
        image={unsplash('1556761175-5973dc0f32e7', 1920)}
        shapes={[['flower4', 'hotpink'], ['hourglass', 'purple'], ['circle', 'sky']]}
      />
      <div className="container">
        <Reveal className="stats-row">
          {[
            [reviews.length, 'Total reviews'],
            [new Set(reviews.map((r) => r.workId)).size, 'Works reviewed'],
            [avg(reviews), 'Average rating'],
            [fiveStar, 'Five-star reviews'],
            [`${recommend}%`, 'Rated 4 stars or more'],
          ].map(([n, l], k) => (
            <div key={l} className="stat-box pop-item" style={{ '--k': k }}><span className="stat-number">{n}</span><span className="stat-label">{l}</span></div>
          ))}
        </Reveal>

        {reviews.length > 0 && (
          <Reveal className="card"><h3>Rating distribution</h3><RatingBars reviews={reviews} /></Reveal>
        )}

        <div className="toolbar">
          <div className="filter-group">
            <select value={filterWork} onChange={(e) => setFilterWork(e.target.value)} className="select">
              <option value="all">All works</option>
              {Object.keys(works).map((id) => (
                <option key={id} value={id}>{works[id].name} ({reviews.filter((r) => r.workId === id).length})</option>
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

        <p className="results-count">Showing {filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}</p>

        {filtered.length > 0 ? (
          <Reveal className="reviews-grid" threshold={0.05}>
            {filtered.map((r, k) => (
              <article key={r.id} className="card review-card with-banner pop-item" style={{ '--k': k % 6 }}>
                {works[r.workId] && (
                  <Link to={`/work/${r.workId}`} className="review-banner">
                    <img src={works[r.workId].thumbnail} alt={works[r.workId].name} onError={(e) => { e.target.src = placeholder(works[r.workId].name); }} />
                    <div className="review-banner-overlay">
                      <span className="chip-sm">{works[r.workId].category}</span>
                      <strong>{works[r.workId].name}</strong>
                    </div>
                  </Link>
                )}
                <div className="review-body">
                  <div className="review-head">
                    <div className="avatar">{(r.name || '?').charAt(0).toUpperCase()}</div>
                    <div className="review-who"><strong>{r.name}</strong><span className="stars-text">{renderStars(parseInt(r.rating, 10))}</span></div>
                  </div>
                  <p className="quote">“{r.review}”</p>
                  <div className="review-foot">
                    <small className="muted">{shortDate(r.createdAt)}</small>
                    <Link to={`/work/${r.workId}`} className="text-link">View project</Link>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>
        ) : (
          <EmptyState title="No reviews found" text="Try adjusting your filters or search term." onClear={() => { setFilterWork('all'); setSortBy('newest'); setSearch(''); }} />
        )}

        <section>
          <h2 className="section-title">Work-wise statistics</h2>
          <Reveal className="work-stats-grid">
            {Object.keys(works).map((id, k) => {
              const wr = reviews.filter((r) => r.workId === id);
              if (!wr.length) return null;
              return (
                <Link to={`/work/${id}`} key={id} className="card work-stat-card pop-item" style={{ '--k': k % 6 }}>
                  <img src={works[id].thumbnail} alt={works[id].name} />
                  <div>
                    <h4>{works[id].name}</h4>
                    <div className="work-stat-meta"><span>{wr.length} {wr.length === 1 ? 'review' : 'reviews'}</span><span>{avg(wr)}/5</span></div>
                    <RatingBars reviews={wr} />
                  </div>
                </Link>
              );
            })}
          </Reveal>
        </section>

        <Reveal className="cta-block image-cta" style={{ '--cta-img': `url(${HOME_IMG.cta})` }}>
          <h2>Have you worked with us?</h2>
          <p>We'd love to hear about your experience.</p>
          <Link to="/works" className="btn btn-primary btn-large">Browse works to review</Link>
        </Reveal>
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
        sub="Get in touch" title="Contact us"
        desc="Have a project in mind? Tell us about it and we'll show you how we can bring it to life."
        image={unsplash('1486312338219-ce68d2c6f44d', 1920)}
        shapes={[['bolt', 'mint'], ['windmill', 'orangePink'], ['ring', 'purple']]}
      />
      <div className="container">
        <Reveal className="info-grid">
          {CONTACT_INFO.map((i, k) => (
            <div key={i.label} className="card info-card pop-item" style={{ '--k': k }}>
              <div>
                <h3>{i.label}</h3>
                {i.link ? <a href={i.link} className="text-link">{i.value}</a> : <p>{i.value}</p>}
              </div>
            </div>
          ))}
        </Reveal>

        <div className="contact-grid">
          <Reveal className="card form-card">
            <h2>Send us a message</h2>
            <p className="muted">Fill out the form and we'll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="name">Full name *</label>
                <input id="name" name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="mobile">Mobile number *</label>
                  <input id="mobile" name="mobile" type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={handleChange} required pattern="[0-9+\-\s]+" title="Please enter a valid phone number" />
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
                <textarea id="message" name="message" rows="5" required placeholder="Tell us about your requirements, budget, timeline and any specific features you need..." value={form.message} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                {submitting ? (<><span className="spinner small" />Sending...</>) : 'Send message'}
              </button>
            </form>
          </Reveal>

          <aside className="contact-side">
            <Reveal className="card">
              <h3>What happens next?</h3>
              <ol className="next-steps">
                {NEXT_STEPS.map(([t, d], i) => (
                  <li key={t}><span className="process-num sm">{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></li>
                ))}
              </ol>
            </Reveal>
            <Reveal className="card">
              <h3>Why choose us?</h3>
              <ul className="benefits">
                {[
                  ['Expert team', 'Skilled professionals with years of experience'],
                  ['Timely delivery', 'Projects delivered on schedule'],
                  ['Quality assurance', 'Rigorous testing and quality checks'],
                  ['Post-launch support', 'Ongoing maintenance and support'],
                ].map(([t, d]) => (
                  <li key={t}><span className="tick">✓</span><div><strong>{t}</strong><p>{d}</p></div></li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="card">
              <h3>Visit us</h3>
              <div className="map-frame">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13773.862165776272!2d76.38365870688182!3d30.337716596432095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1773513107646!5m2!1sen!2sin"
                  style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps - Shree Shyam IT Solutions Location"
                />
              </div>
              <p className="map-address">Shree Shyam IT Solutions, Patiala, Punjab, India</p>
              <a href="https://www.google.com/maps/search/?api=1&query=30.337716596432095,76.38365870688182" target="_blank" rel="noopener noreferrer" className="text-link">Get directions</a>
            </Reveal>
            <Reveal className="card"><h3>Follow us</h3><SocialLinks /></Reveal>
          </aside>
        </div>

        <section>
          <h2 className="section-title">Frequently asked questions</h2>
          <Reveal className="faq-grid">
            {FAQS.map(([q, a], k) => (
              <div key={q} className="card faq-item pop-item" style={{ '--k': k }}><h4>{q}</h4><p>{a}</p></div>
            ))}
          </Reveal>
        </section>
      </div>
    </div>
  );
}

/* ==========================================================================
   Admin
   ========================================================================== */
const WORK_TYPE_LABELS = {
  'custom-web': 'Custom Website', ecommerce: 'E-commerce Website', portfolio: 'Portfolio Website',
  promotional: 'Promotional Website', software: 'Software', application: 'Application', other: 'Other',
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
      setWorks(w); setReviews(r); setContacts(c);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('adminAuthenticated') === 'true') { setAuthed(true); loadData(); }
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

  const resetForm = () => { setForm(emptyWork); setPreview({ viewLink: '', videoLink: '' }); setEditing(null); };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, viewLink: formatUrl(form.viewLink), videoLink: form.videoLink ? formatUrl(form.videoLink) : '' };
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
    setForm({ name: work.name, viewLink: work.viewLink, description: work.description, thumbnail: work.thumbnail, videoLink: work.videoLink || '' });
    setPreview({ viewLink: work.viewLink, videoLink: work.videoLink || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUrlChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setPreview({ ...preview, [field]: value ? formatUrl(value) : '' });
  };

  const formatDate = (s) => {
    try { const d = new Date(s); return `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}`; } catch { return s; }
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
                  {preview.viewLink && <small className="url-preview">Preview: <a href={preview.viewLink} target="_blank" rel="noopener noreferrer">{preview.viewLink}</a></small>}
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
                      {w && <small className="muted">{w.name} · <a href={formatUrl(w.viewLink)} target="_blank" rel="noopener noreferrer">{getDomainFromUrl(w.viewLink)}</a></small>}
                      <div className="review-who"><strong>{r.name}</strong><Stars rating={parseInt(r.rating, 10)} /></div>
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

  const heroRef = useGsap(() => {
    gsap.from('.about-hero .hero-sub', { autoAlpha: 0, y: 20, duration: 0.8, delay: 0.1 });
    gsap.from('.about-hero .hero-desc', { autoAlpha: 0, y: 30, duration: 0.9, delay: 0.9 });
    gsap.from('.stat-pill', { autoAlpha: 0, y: 40, scale: 0.8, duration: 1, ease: 'back.out(1.7)', stagger: 0.12, delay: 1.2 });
    gsap.utils.toArray('.hero-shape').forEach((s, i) => {
      gsap.from(s, { scale: 0, rotation: gsap.utils.random(-200, 200), duration: 1.4, ease: 'elastic.out(1,.6)', delay: 0.4 + i * 0.18 });
      gsap.to(s.querySelector('svg'), { y: -18, rotation: gsap.utils.random(-14, 14), duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    gsap.utils.toArray('.story-images img').forEach((img, i) => {
      gsap.to(img, { yPercent: [-6, 8, -10][i] || 0, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  const bg = (n) => (TECH_IMG[hovered] || TECH_IMG.web)[n];

  return (
    <div className="page about-page" ref={heroRef}>
      <header className="about-hero">
        {HERO_BGS.map((src, i) => (
          <div key={src} className={`hero-bg-image ${i === heroIdx ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
        ))}
        <div className="hero-overlay" />
        <span className="hero-shape hs1"><Shape type="windmill" grad="orangePink" /></span>
        <span className="hero-shape hs2"><Shape type="flower4" grad="purple" /></span>
        <span className="hero-shape hs3"><Shape type="star" grad="sunset" /></span>
        <div className="about-hero-content">
          <Subtitle className="hero-sub">About us</Subtitle>
          <h1 className="hero-title"><Split text="Shree Shyam IT Solutions" delay={0.2} /></h1>
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
        <Reveal as="section" className="story">
          <div className="story-images">
            <img className="s-main" src={TEAM_IMG.office1} alt="Modern office" loading="lazy" />
            <img className="s-second" src={TEAM_IMG.team} alt="Team collaboration" loading="lazy" />
            <img className="s-third" src={TEAM_IMG.office2} alt="Creative workspace" loading="lazy" />
          </div>
          <div className="story-text">
            <h2 className="section-title left">Our story</h2>
            <p>Shree Shyam IT Solutions was founded with a simple mission: to help businesses grow with reliable, well-designed digital products. We believe great design and development can turn ideas into reality.</p>
            <p>What started as a small team in Patiala has grown into a studio serving clients across the globe. Our journey has been driven by passion, innovation and a commitment to quality.</p>
            <div className="quote-card">
              <img src={TEAM_IMG.collaboration} alt="Teamwork" />
              <div><p>“Innovation distinguishes between a leader and a follower.”</p><span className="muted">Our team philosophy</span></div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="mission" style={{ '--mission-bg': `url(${bg(0)})` }}>
          <h2 className="section-title">What we do</h2>
          <div className="mission-card">
            <p>We design and build custom websites, e-commerce stores, mobile applications and business software. Every project is handled by a dedicated team that stays with you from the first call to long after launch.</p>
          </div>
        </Reveal>

        <section>
          <h2 className="section-title">Our services</h2>
          <Reveal className="about-services">
            {ABOUT_SERVICES.map((s, i) => (
              <div key={s.title} className="about-service pop-item" style={{ '--k': i }} onMouseEnter={() => setHovered(s.cat)} onMouseLeave={() => setHovered(null)}>
                <div className="about-service-image"><img src={TECH_IMG[s.cat][i % 3]} alt={s.title} loading="lazy" /></div>
                <div className="about-service-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ul className="check-list">{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
                </div>
              </div>
            ))}
          </Reveal>
        </section>

        <section>
          <h2 className="section-title">Meet the teams</h2>
          <Reveal className="team-grid">
            {TEAMS.map((t, k) => (
              <div key={t.name} className="team-card pop-item" style={{ '--k': k }}>
                <img src={t.img} alt={t.name} loading="lazy" onError={hideOnError} />
                <div className="team-body"><h3>{t.name}</h3><p>{t.text}</p></div>
              </div>
            ))}
          </Reveal>
        </section>

        <section>
          <h2 className="section-title">What we believe in</h2>
          <Reveal className="values-grid">
            {VALUES.map(([t, d], k) => (
              <div key={t} className="value-item pop-item" style={{ '--k': k }}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </Reveal>
        </section>

        <section>
          <h2 className="section-title">Why choose us</h2>
          <Reveal className="cards-3">
            {WHY_US.map(([title, desc], k) => (
              <div key={title} className="card feature-card pop-item" style={{ '--k': k }}><h3>{title}</h3><p>{desc}</p></div>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" className="about-cta" style={{ '--cta-bg': `url(${bg(1)})` }}>
          <h2>Ready to start your project?</h2>
          <p>Get in touch to discuss your requirements and bring your ideas to life.</p>
          <div className="cta-buttons">
            <Link to="/works" className="btn btn-primary btn-large">View our work</Link>
            <Link to="/contact" className="btn btn-ghost btn-large">Contact us</Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ==========================================================================
   App shell: loader, navigation, routes
   ========================================================================== */
const LOADER_MESSAGES = ['Warming up the servers', 'Compiling ideas', 'Polishing the pixels', 'Almost ready'];

function Loader({ progress }) {
  const ref = useGsap(() => {
    gsap.from('.loader-shape', { scale: 0, rotation: () => gsap.utils.random(-240, 240), duration: 1.4, ease: 'elastic.out(1,.6)', stagger: 0.12 });
    gsap.utils.toArray('.loader-shape svg').forEach((s, i) => {
      gsap.to(s, { rotation: i % 2 ? -360 : 360, duration: 8 + i * 2, ease: 'none', repeat: -1 });
    });
  });
  const msg = LOADER_MESSAGES[Math.min(LOADER_MESSAGES.length - 1, Math.floor(progress / 26))];
  return (
    <div className="app-loader" ref={ref}>
      <span className="loader-shape ls1"><Shape type="windmill" grad="orangePink" /></span>
      <span className="loader-shape ls2"><Shape type="star" grad="sunset" /></span>
      <span className="loader-shape ls3"><Shape type="flower4" grad="purple" /></span>
      <span className="loader-shape ls4"><Shape type="ring" grad="sky" /></span>
      <span className="loader-shape ls5"><Shape type="diamond" grad="mint" /></span>
      <div className="loader-content">
        <div className="loader-orb">
          <span className="ring r1" /><span className="ring r2" /><span className="ring r3" />
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
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [announceClosed, setAnnounceClosed] = useState(() => {
    try { return sessionStorage.getItem('announceClosed') === 'true'; } catch { return false; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  /* announcement bar: homepage only, and the visitor can close it with the cross */
  const showAnnounce = location.pathname === '/' && !announceClosed;
  const closeAnnounce = () => {
    setAnnounceClosed(true);
    try { sessionStorage.setItem('announceClosed', 'true'); } catch { /* ignore */ }
    safeRefresh(150); /* page got shorter, so re-measure the scroll triggers */
  };

  /* The admin area runs with NO scroll-linked effects (no hiding header, no progress bar,
     no ScrollTrigger refreshes), so it scrolls smoothly on phones and never jumps to the top. */
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    let p = 0;
    let hideTimer;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 2;
      if (p >= 100) { p = 100; clearInterval(interval); hideTimer = setTimeout(() => setLoading(false), 500); }
      setProgress(Math.min(p, 100));
    }, 200);
    return () => { clearInterval(interval); clearTimeout(hideTimer); };
  }, []);

  /* lock page scroll while the mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* keyboard shortcut + cursor glow (mouse only, never on touch screens) */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); navigate('/admin'); }
    };
    window.addEventListener('keydown', onKey);

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let move;
    if (fine && !loading) {
      const xTo = gsap.quickTo('.cursor-glow', 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo('.cursor-glow', 'y', { duration: 0.6, ease: 'power3' });
      move = (e) => { xTo(e.clientX); yTo(e.clientY); };
      window.addEventListener('pointermove', move);
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      if (move) window.removeEventListener('pointermove', move);
    };
  }, [navigate, loading]);

  /* scroll progress bar + header that hides while scrolling down (not used on /admin) */
  useEffect(() => {
    if (loading) return undefined;

    if (isAdmin) {
      setHidden(false);
      const onScroll = () => setScrolled(window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo('.progress-bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
      let last = 0;
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          setScrolled(y > 40);
          /* ignore iOS/Android overscroll bounce and tiny movements, so the header does not flicker */
          if (y < 0 || y > self.end) return;
          const d = y - last;
          if (Math.abs(d) < 12) return;
          last = y;
          const tall = document.documentElement.scrollHeight > window.innerHeight * 1.6;
          const desktop = window.innerWidth > 1100; /* never hide the header on phones/tablets */
          setHidden(desktop && tall && d > 0 && y > 400);
        },
      });
    });
    return () => ctx.revert();
  }, [loading, isAdmin]);

  /* page transition + refresh pins after the new route has laid out */
  useLayoutEffect(() => {
    if (loading) return undefined;
    setMenuOpen(false);
    if (isAdmin) return undefined;
    gsap.fromTo('.route', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'opacity' });
    safeRefresh(350);
    return undefined;
  }, [location.pathname, loading, isAdmin]);

  useEffect(() => {
    const onLoad = () => safeRefresh(0);
    const onImg = (e) => { if (e.target && e.target.tagName === 'IMG') safeRefresh(300); };
    window.addEventListener('load', onLoad);
    document.addEventListener('load', onImg, true); /* images loading late shift the page, so re-measure */
    return () => { window.removeEventListener('load', onLoad); document.removeEventListener('load', onImg, true); };
  }, []);

  /* re-measure every trigger when the width changes (rotate / device toolbar) or the page height changes (images loading) */
  useEffect(() => {
    if (loading || isAdmin) return undefined;
    const main = document.querySelector('.main');
    let lastW = window.innerWidth;
    let lastH = main ? main.offsetHeight : 0;
    const onResize = () => {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; safeRefresh(200); }
    };
    let ro;
    if (main && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        const h = main.offsetHeight;
        if (Math.abs(h - lastH) > 40) { lastH = h; safeRefresh(200); }
      });
      ro.observe(main);
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [loading, isAdmin]);

  /* liquid flair that grows from the cursor on every .btn */
  useEffect(() => {
    const over = (e) => {
      const b = e.target.closest?.('.btn');
      if (!b || b.disabled || b.contains(e.relatedTarget)) return;
      let f = b.querySelector(':scope > .btn-flair');
      if (!f) {
        f = document.createElement('span');
        f.className = 'btn-flair';
        f.setAttribute('aria-hidden', 'true');
        b.prepend(f);
      }
      const r = b.getBoundingClientRect();
      gsap.killTweensOf(f);
      gsap.set(f, { left: e.clientX - r.left, top: e.clientY - r.top, xPercent: -50, yPercent: -50, scale: 0 });
      gsap.to(f, { scale: 1, duration: 0.6, ease: 'power3.out' });
    };
    const out = (e) => {
      const b = e.target.closest?.('.btn');
      if (!b || b.contains(e.relatedTarget)) return;
      const f = b.querySelector(':scope > .btn-flair');
      if (!f) return;
      const r = b.getBoundingClientRect();
      gsap.killTweensOf(f);
      gsap.to(f, { left: e.clientX - r.left, top: e.clientY - r.top, scale: 0, duration: 0.45, ease: 'power3.in' });
    };
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => { document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out); };
  }, []);

  if (loading) return <Loader progress={progress} />;

  return (
    <div className={`App ${isAdmin ? 'is-admin' : ''}`}>
      <ScrollToTop />
      <div className="progress-bar" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {showAnnounce && (
        <div className="announce">
          <span className="announce-text">Now booking new projects: websites, apps and software.</span>
          <Link to="/contact">Get a free quote</Link>
          <button type="button" className="announce-close" onClick={closeAnnounce} aria-label="Close announcement">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      )}

      <header className={`site-header ${scrolled ? 'scrolled' : ''} ${hidden && !menuOpen ? 'is-hidden' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="brand">
            <img src={LOGO_URL} alt="Shree Shyam IT Solutions" className="brand-logo" />
            <BrandName />
          </Link>
          <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>
          <nav className={`site-nav ${menuOpen ? 'open' : ''}`}>
            <ul>
              {NAV_ITEMS.map((n) => (
                <li key={n.to}><Link to={n.to} className={`nav-link ${location.pathname === n.to ? 'active' : ''}`}>{n.label}</Link></li>
              ))}
            </ul>
            <Link to="/contact" className="btn btn-outline nav-cta">Start a project</Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="route" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/works" element={<Works />} />
            <Route path="/work/:id" element={<WorkDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </main>

      <button className={`back-to-top ${scrolled ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}