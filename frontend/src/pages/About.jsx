import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-mockup-page">
      {/* ── 1. Hero Banner ── */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-inner">
          <h1>About Us</h1>
          <div className="about-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">&gt;</span>
            <span className="current">About</span>
          </div>
        </div>
      </section>

      {/* ── 2. Our Story Section ── */}
      <section className="about-story-wrap">
        <div className="about-story-grid">
          {/* Left: Text & CTA */}
          <div className="story-left-col">
            <span className="story-sub-tag">Our Story</span>
            <h2 className="story-main-heading">A Dream Turned Into Reality</h2>
            <p className="story-paragraph">
              Farm House was born from a simple idea — to make beautiful farm stays, luxury villas and nature getaways accessible to everyone. We noticed how people were searching for peaceful escapes, but finding the right place was always a challenge. So, we built Farm House — a trusted platform to connect you with handpicked farmhouses across India.
            </p>
            <Link to="/farmhouses" className="story-btn-learn">
              <span>Learn More</span>
              <span className="arrow">➔</span>
            </Link>
          </div>

          {/* Right: Villa Photo */}
          <div className="story-right-col">
            <div className="story-photo-card">
              <img
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200"
                alt="Farm House Dream Turned Into Reality"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Stats Bar ── */}
      <section className="about-stats-wrap">
        <div className="stats-row-container">
          <div className="stat-pill-item">
            <div className="stat-green-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div className="stat-number-text">500+</div>
            <div className="stat-label-text">Farm Houses</div>
          </div>

          <div className="stat-pill-item">
            <div className="stat-green-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-number-text">20K+</div>
            <div className="stat-label-text">Happy Guests</div>
          </div>

          <div className="stat-pill-item">
            <div className="stat-green-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div className="stat-number-text">100%</div>
            <div className="stat-label-text">Verified Properties</div>
          </div>

          <div className="stat-pill-item">
            <div className="stat-green-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="stat-number-text">4.9/5</div>
            <div className="stat-label-text">Average Rating</div>
          </div>
        </div>
      </section>

      {/* ── 4. Why Choose Us Section ── */}
      <section className="about-why-wrap">
        <div className="why-section-container">
          <h2 className="why-heading">Why Choose Us</h2>
          <div className="why-cards-row">
            {/* Card 1 */}
            <div className="why-box">
              <div className="why-box-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <h3>Verified Properties</h3>
              <p>Only trusted farm houses</p>
            </div>

            {/* Card 2 */}
            <div className="why-box">
              <div className="why-box-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <polyline points="9 16 11 18 15 14"></polyline>
                </svg>
              </div>
              <h3>Easy Booking</h3>
              <p>Quick &amp; hassle-free process</p>
            </div>

            {/* Card 3 */}
            <div className="why-box">
              <div className="why-box-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>We're always here for you</p>
            </div>

            {/* Card 4 */}
            <div className="why-box">
              <div className="why-box-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a6b3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <h3>Best Price Guarantee</h3>
              <p>Get the best value</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Nature Therapy Panoramic Quote Banner ── */}
      <section className="about-nature-quote">
        <div className="quote-nature-overlay"></div>
        <div className="quote-nature-inner">
          <p className="quote-main">"Nature gives you the best kind of therapy."</p>
          <p className="quote-sub">Come, unwind, and create memories that last a lifetime.</p>
        </div>
      </section>
    </div>
  );
}

export default About;