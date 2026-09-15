import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🏡</span>
              <div>
                <span className="footer-logo-name">Farm House</span>
                <span className="footer-logo-tagline">Relax · Reconnect · Rejuvenate</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Your trusted platform for booking beautiful farmhouses, luxury pool villas, and countryside retreats across India.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/farmhouses">Browse Farm Houses</Link></li>
              <li><Link to="/gallery">Photo Gallery</Link></li>
              <li><Link to="/offers">Special Offers</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
              <li><Link to="/register">List Your Farmhouse</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="footer-section">
            <h4>Support & Legal</h4>
            <ul>
              <li><Link to="/faq">Cancellation Policy</Link></li>
              <li><Link to="/faq">Guest Safety Rules</Link></li>
              <li><Link to="/contact">Emergency Helpline</Link></li>
              <li><Link to="/contact">Concierge Booking</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Farm House. All rights reserved.</p>
          <p>Made with ❤️ for nature lovers & weekend escapes</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
