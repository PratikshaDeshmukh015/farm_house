import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'General Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message with friendly user experience
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFeedback(`Thank you ${formData.name}! Your message has been received. Our concierge team will get back to you within 2 hours.`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest: 'General Inquiry',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="contact-page">
      {/* Hero Banner */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <span className="contact-badge">Support & Inquiries</span>
          <h1>Contact Us</h1>
          <div className="contact-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Contact</span>
          </div>
          <p className="contact-subtitle">
            Have questions about a farmhouse stay or want custom event planning? Reach out to our concierge team anytime.
          </p>
        </div>
      </section>

      {/* Main Grid Container */}
      <section className="contact-main-container">
        <div className="contact-grid">
          {/* Left Column: Get in Touch Info */}
          <div className="contact-info-card">
            <div className="info-card-header">
              <span className="info-tag">Concierge Desk</span>
              <h2>Get in Touch</h2>
              <p className="info-desc">
                We're here to help you plan your perfect farm house getaway, weekend retreat, or special celebration.
              </p>
            </div>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="info-icon-box">📍</div>
                <div className="info-text">
                  <h3>Address</h3>
                  <p>132 Green Valley Road, Lonavala, Maharashtra 410401</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon-box">📞</div>
                <div className="info-text">
                  <h3>Phone</h3>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                  <span className="info-sub">Toll-free 24/7 for active guests</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon-box">✉️</div>
                <div className="info-text">
                  <h3>Email</h3>
                  <a href="mailto:support@farmhouse.com">support@farmhouse.com</a>
                  <span className="info-sub">Quick responses within 2 hours</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon-box">⏰</div>
                <div className="info-text">
                  <h3>Working Hours</h3>
                  <p>Monday - Sunday: 9:00 AM - 8:00 PM</p>
                  <span className="info-sub">Emergency support available 24/7</span>
                </div>
              </div>
            </div>

            {/* Quick action pill cards */}
            <div className="contact-quick-links">
              <h3>Helpful Resources</h3>
              <div className="quick-links-grid">
                <Link to="/faq" className="quick-link-pill">
                  <span>❓ Browse FAQs</span>
                  <span>→</span>
                </Link>
                <Link to="/farmhouses" className="quick-link-pill">
                  <span>🏡 View All Farmhouses</span>
                  <span>→</span>
                </Link>
                <Link to="/about" className="quick-link-pill">
                  <span>🌱 About Our Story</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Send Message Form */}
          <div className="contact-form-card">
            <div className="form-card-header">
              <h2>Send a Message</h2>
              <p>Fill out the details below and we will contact you right away.</p>
            </div>

            {submitted && (
              <div className="contact-success-banner">
                <div className="success-icon">✓</div>
                <div>
                  <h4>Message Sent Successfully!</h4>
                  <p>{feedback}</p>
                </div>
                <button
                  className="dismiss-btn"
                  onClick={() => setSubmitted(false)}
                  aria-label="Close message"
                >
                  ✕
                </button>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number <span className="req">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="req">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="interest">Interest / Topic</label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Farmhouse Booking">Farmhouse Booking</option>
                    <option value="Corporate / Event Booking">Corporate / Event Booking</option>
                    <option value="Property Owner Listing">Property Owner Listing</option>
                    <option value="Feedback / Complaints">Feedback / Complaints</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message <span className="req">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell us about your trip dates, preferred destination, guest count, or any questions..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn" disabled={loading}>
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="send-arrow">➔</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Map & Office Showcase */}
        <div className="contact-map-section">
          <div className="map-header">
            <div>
              <span className="map-badge">Our Office</span>
              <h2>Visit Us in Lonavala</h2>
              <p>Drop by our experience lounge to discuss luxury private stays and estate reservations.</p>
            </div>
            <a
              href="https://maps.google.com/?q=Lonavala+Maharashtra"
              target="_blank"
              rel="noopener noreferrer"
              className="map-directions-btn"
            >
              <span>Get Directions</span>
              <span>📍</span>
            </a>
          </div>

          <div className="map-embed-container">
            <div className="map-card-overlay">
              <div className="map-pin-pulse">
                <div className="pin">🏡</div>
                <div className="pulse"></div>
              </div>
              <div className="map-info-pill">
                <strong>Farm House Headquarters</strong>
                <span>132 Green Valley Road, Lonavala, Maharashtra</span>
              </div>
            </div>
            {/* Visual map background with terrain */}
            <iframe
              title="Farm House Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60447.88289758832!2d73.37684695!3d18.75628555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be801098bda8155%3A0x3418579998822002!2sLonavala%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
              width="100%"
              height="340"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
