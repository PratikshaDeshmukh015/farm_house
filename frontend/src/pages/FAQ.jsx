import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

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

function FAQ() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState({ 1: true, 2: false }); // First one open by default

  const toggleAccordion = (id) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="faq-page">
      {/* Hero Banner */}
      <section className="faq-hero">
        <div className="faq-hero-overlay"></div>
        <div className="faq-hero-content">
          <span className="faq-badge">Help Center</span>
          <h1>Frequently Asked Questions</h1>
          <div className="faq-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">FAQ</span>
          </div>
          <p className="faq-subtitle">
            Find immediate answers about booking procedures, cancellation policies, on-site amenities, and hosting your estate.
          </p>

          {/* Search bar inside Hero */}
          <div className="faq-search-box">
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
        </div>
      </section>

      {/* Main FAQ Container */}
      <section className="faq-main-container">
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
                <div
                  key={faq.id}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-text">
                      <span className="faq-category-mini">{faq.category}</span>
                      <span className="faq-question-title">{faq.question}</span>
                    </div>
                    <span className="faq-toggle-icon">
                      {isOpen ? '−' : '+'}
                    </span>
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
            <Link to="/contact" className="btn-cta-contact">
              Contact Support
            </Link>
            <a href="tel:+919876543210" className="btn-cta-call">
              📞 Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
