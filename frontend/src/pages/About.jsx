import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";
import "./FAQ.css";

const FAQ_DATA = [
  {
    id: 1,
    category: "Booking & Stays",
    question: "How are farmhouses verified before listing?",
    answer: "Every property listed on Farm House undergoes a thorough 25-point physical verification by our regional inspection team. We test hygiene standards, verify swimming pool water filtration, check generator power backup, inspect kitchen facilities, and ensure photographs represent 100% genuine current property conditions."
  },
  {
    id: 2,
    category: "Payments & Cancellation",
    question: "What is the cancellation and refund policy?",
    answer: "We offer a 100% full refund for cancellations made up to 48 hours prior to your scheduled check-in time. For cancellations made within 48 hours, a 1-night standard fee applies. You can also reschedule your booking dates once for free subject to owner availability."
  },
  {
    id: 3,
    category: "Booking & Stays",
    question: "What are the standard check-in and check-out timings?",
    answer: "Standard check-in is at 2:00 PM and check-out is at 11:00 AM to allow thorough deep cleaning and sanitation between guest stays. Early check-in or late check-out can be requested during booking and is accommodated whenever schedule permits."
  },
  {
    id: 4,
    category: "Amenities & Food",
    question: "Are private chefs, meals, and BBQ add-ons available?",
    answer: "Yes! Most of our luxury estates feature options for on-site private chefs who prepare customized local or multi-cuisine breakfast, lunch, high-tea, and dinners. You can also select BBQ setups, bonfire arrangements, and live acoustic music add-ons during the checkout step."
  },
  {
    id: 5,
    category: "Safety & Rules",
    question: "Are the farmhouses pet-friendly and suitable for family reunions?",
    answer: "Over 80% of our properties are pet-friendly with fenced private lawns where pets can freely play. Each farmhouse page clearly displays pet policies, allowed guest capacity, sound limits for music, and child-safe pool fencing details."
  },
  {
    id: 6,
    category: "Property Owners",
    question: "How can I register and list my farmhouse as an owner?",
    answer: "Property owners can click 'Sign Up' and select the 'Farm Owner' account role. You can upload property photos, amenities, bedroom configurations, and pricing. Our local inspector visits within 48-72 hours to certify your property and activate live bookings on the platform."
  },
  {
    id: 7,
    category: "Safety & Rules",
    question: "Is there 24/7 power backup, security, and caretaker assistance?",
    answer: "Yes, all verified farmhouses are equipped with heavy-duty diesel generators / inverters for uninterrupted power, CCTV on perimeter gates for guest safety, and a dedicated resident caretaker available 24/7 on call for all your needs."
  },
  {
    id: 8,
    category: "Booking & Stays",
    question: "What makes Farm House Booking different from regular hotel portals?",
    answer: "We offer private, exclusive, standalone countryside estates where your family or group gets complete privacy without sharing spaces with strangers. Enjoy private swimming pools, cricket lawns, fruit orchards, bonfires, and personalized hospitality."
  },
  {
    id: 9,
    category: "Payments & Cancellation",
    question: "Which payment methods are accepted?",
    answer: "We support all major payment options including UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and easy split payment options for large group reservations."
  }
];

const FAQ_CATEGORIES = ["All", "Booking & Stays", "Payments & Cancellation", "Amenities & Food", "Safety & Rules", "Property Owners"];

function About() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState({ 1: true, 2: false });

  const toggleAccordion = (id) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

      {/* ── 5. FAQ Section ── */}
      <section className="faq-main-container" style={{ background: '#f8fdf9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="story-sub-tag" style={{ display: 'inline-block' }}>FAQ</span>
            <h2 className="why-heading" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Frequently Asked Questions</h2>
            <p style={{ color: '#5c7263', fontSize: '0.98rem' }}>Find quick answers about bookings, cancellations, amenities, and more.</p>
          </div>

          {/* Search bar */}
          <div className="faq-search-box" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search questions (e.g. cancellation, pool, chef, pets)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search questions"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="faq-category-pills">
            {FAQ_CATEGORIES.map(category => (
              <button
                key={category}
                className={`faq-pill ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <div className="faq-results-info">
            <span>Showing <strong>{filteredFaqs.length}</strong> questions</span>
            {searchQuery && <span> matching "<em>{searchQuery}</em>"</span>}
          </div>

          {/* Accordion List */}
          <div className="faq-accordion-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => {
                const isOpen = !!openIds[faq.id];
                return (
                  <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-question-btn"
                      onClick={() => toggleAccordion(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="faq-question-text">
                        <span className="faq-category-mini">{faq.category}</span>
                        <span className="faq-question-title">{faq.question}</span>
                      </div>
                      <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="faq-empty-state">
                <div className="empty-icon">🔎</div>
                <h3>No matching questions found</h3>
                <p>Try searching for a different keyword or browse by category above.</p>
                <button
                  className="btn-reset-search"
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Still Have Questions CTA */}
          <div className="faq-contact-cta">
            <div className="cta-icon-box">💬</div>
            <div className="cta-content">
              <h3>Still Have Questions?</h3>
              <p>Can't find the answer you're looking for? Our friendly guest support team is available 24/7 to assist you.</p>
            </div>
            <div className="cta-buttons">
              <Link to="/contact" className="btn-cta-contact">Contact Support</Link>
              <a href="tel:+919876543210" className="btn-cta-call">📞 Call Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Nature Therapy Panoramic Quote Banner ── */}
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