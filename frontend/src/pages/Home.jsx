import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';
import ExperienceChatbot from '../components/ExperienceChatbot';
import './Home.css';

const DEFAULT_FARMHOUSES = [
  {
    id: 1,
    name: 'Sunset Valley Farmhouse',
    location: 'Lonavala, Maharashtra',
    pricePerDay: 5000,
    rating: 4.8,
    reviewsCount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
    isBestSeller: true,
  },
  {
    id: 2,
    name: 'Green Hills Farmhouse',
    location: 'Alibaug, Maharashtra',
    pricePerDay: 6500,
    rating: 4.7,
    reviewsCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
    isBestSeller: false,
  },
  {
    id: 3,
    name: "Nature's Nest",
    location: 'Karjat, Maharashtra',
    pricePerDay: 7000,
    rating: 4.9,
    reviewsCount: 32,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
    isBestSeller: false,
  },
  {
    id: 4,
    name: 'The Rustic Farm',
    location: 'Mahabaleshwar, Maharashtra',
    pricePerDay: 5500,
    rating: 4.6,
    reviewsCount: 15,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
    isBestSeller: false,
  },
];

const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: 'Priya Sharma',
    comment: 'Amazing experience! The farmhouse was clean, well-maintained and the view was just breathtaking. Highly recommended!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Rohan Mehta',
    comment: 'The private pool and bonfire night made our family weekend unforgettable. Excellent caretaker service and food!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Ananya Verma',
    comment: 'Serene environment and completely pet-friendly. Booking through the platform was super smooth and seamless.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
];

function Home({ user }) {
  const navigate = useNavigate();
  const [farmhouses, setFarmhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

  // Search state
  const [searchLoc, setSearchLoc] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');

  // Testimonials index
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const fetchFarmhouses = async () => {
      try {
        const res = await farmhouseAPI.getAllFarmHouses(0, 8);
        if (res.data?.success && res.data.farmhouses?.length > 0) {
          // Augment with ratings/seller badge for preview
          const formatted = res.data.farmhouses.map((fh, idx) => ({
            ...fh,
            rating: fh.rating || (4.6 + (idx % 4) * 0.1).toFixed(1),
            reviewsCount: fh.reviewsCount || 15 + idx * 6,
            isBestSeller: idx === 0,
            imageUrl: fh.imageUrl || DEFAULT_FARMHOUSES[idx % DEFAULT_FARMHOUSES.length].imageUrl,
          }));
          setFarmhouses(formatted);
        } else {
          setFarmhouses(DEFAULT_FARMHOUSES);
        }
      } catch (err) {
        console.error('Error fetching farmhouses:', err);
        setFarmhouses(DEFAULT_FARMHOUSES);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmhouses();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchLoc) queryParams.append('location', searchLoc);
    if (guestsCount) queryParams.append('guests', guestsCount);
    navigate(`/farmhouses?${queryParams.toString()}`);
  };

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const displayedList = farmhouses.slice(0, 4);

  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-wrapper">
        <div className="hero-inner">
          <span className="hero-tag">← ESCAPE TO NATURE —</span>
          <h1 className="hero-title">
            Book Your Perfect<br />
            <span className="highlight">Farm House Getaway</span>
          </h1>
          <p className="hero-subtitle">
            Enjoy nature, fresh air and unforgettable moments with your loved ones.
          </p>

          {/* Floating Search Bar */}
          <form className="search-bar-card" onSubmit={handleSearchSubmit}>
            <div className="search-field">
              <span className="search-icon">📍</span>
              <div className="search-field-content">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <span className="search-icon">📅</span>
              <div className="search-field-content">
                <label>Check In</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <span className="search-icon">📅</span>
              <div className="search-field-content">
                <label>Check Out</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <span className="search-icon">👥</span>
              <div className="search-field-content">
                <label>Guests</label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="10">10+ Guests</option>
                </select>
              </div>
            </div>

            <button type="submit" className="search-btn">
              🔍 Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. FEATURES STRIP (4 Floating Cards) */}
      <div className="features-strip-container">
        <div className="features-strip">
          <div className="feature-pill-card">
            <div className="feature-pill-icon">🍃</div>
            <div className="feature-pill-text">
              <h4>Nature & Fresh Air</h4>
              <p>Rejuvenate your mind</p>
            </div>
          </div>

          <div className="feature-pill-card">
            <div className="feature-pill-icon">🏡</div>
            <div className="feature-pill-text">
              <h4>Spacious Farm Houses</h4>
              <p>Comfortable stays</p>
            </div>
          </div>

          <div className="feature-pill-card">
            <div className="feature-pill-icon">🛡️</div>
            <div className="feature-pill-text">
              <h4>Safe & Secure</h4>
              <p>Your safety, our priority</p>
            </div>
          </div>

          <div className="feature-pill-card">
            <div className="feature-pill-icon">👨‍👩‍👧‍👦</div>
            <div className="feature-pill-text">
              <h4>Perfect for Families</h4>
              <p>Create lasting memories</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED FARM HOUSES */}
      <section className="section-wrapper">
        <div className="section-header-row">
          <div>
            <span className="section-pretitle">FEATURED FARM HOUSES</span>
            <h2 className="section-title">Discover Our Most Popular Farm Houses</h2>
            <p className="section-subtitle">Handpicked stays for a perfect countryside experience.</p>
          </div>
          <Link to="/farmhouses" className="view-all-link">
            View All →
          </Link>
        </div>

        <div className="farmhouse-cards-grid">
          {displayedList.map((fh) => (
            <div key={fh.id} className="fh-card">
              <div className="fh-card-img-box">
                <img src={fh.imageUrl} alt={fh.name} className="fh-card-img" />
                {fh.isBestSeller && <span className="badge-bestseller">Best Seller</span>}
                <button
                  type="button"
                  className="heart-btn"
                  onClick={(e) => toggleFavorite(fh.id, e)}
                  aria-label="Save to favorites"
                >
                  {favorites[fh.id] ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="fh-card-body">
                <h3 className="fh-card-title">{fh.name}</h3>
                <div className="fh-card-location">
                  <span>📍</span> {fh.location || 'Maharashtra, India'}
                </div>

                <div className="fh-card-footer">
                  <div className="fh-price-box">
                    <div className="fh-price">
                      ₹{fh.pricePerDay?.toLocaleString()} <span>/ night</span>
                    </div>
                    <div className="fh-rating">
                      <span className="star">★</span> {fh.rating || '4.8'} ({fh.reviewsCount || 20} reviews)
                    </div>
                  </div>

                  <Link to={`/farmhouses/${fh.id}`} className="fh-view-btn">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SPECIAL DISCOUNTS & OFFERS BANNER */}
      <div className="promo-banner-container">
        <div className="promo-banner">
          <div className="promo-content">
            <span className="promo-tag">✨ Plan Your Next Getaway</span>
            <h2 className="promo-title">Special Discounts & Offers</h2>
            <p className="promo-subtitle">
              Get the best deals on your favorite farm houses. Book now and save more!
            </p>
            <Link to="/farmhouses" className="promo-btn">
              Explore Offers →
            </Link>
          </div>
          <div className="promo-badge-box">
            <small>Up to</small>
            20% OFF
          </div>
        </div>
      </div>

      {/* 5. WHY CHOOSE US & WHAT OUR GUESTS SAY (2 Columns) */}
      <section className="dual-section-wrapper">
        {/* Left Column: Why Choose Us */}
        <div className="why-us-column">
          <h3>Why Choose Us</h3>
          <p className="sub">We make your farm house experience simple, safe and memorable.</p>

          <div className="why-features-grid">
            <div className="why-item">
              <div className="why-icon-circle green">🛡️</div>
              <h4>Verified Properties</h4>
              <p>Only trusted farm houses</p>
            </div>

            <div className="why-item">
              <div className="why-icon-circle blue">⚡</div>
              <h4>Easy Booking</h4>
              <p>Quick & hassle-free process</p>
            </div>

            <div className="why-item">
              <div className="why-icon-circle teal">🎧</div>
              <h4>24/7 Support</h4>
              <p>We're always here for you</p>
            </div>

            <div className="why-item">
              <div className="why-icon-circle yellow">🏷️</div>
              <h4>Best Price Guarantee</h4>
              <p>Get the best value</p>
            </div>
          </div>
        </div>

        {/* Right Column: What Our Guests Say */}
        <div className="testimonials-column">
          <h3>What Our Guests Say</h3>
          <p className="sub">Real stories from our happy travelers.</p>

          {TESTIMONIALS_DATA.length > 0 && (
            <div className="testi-card">
              <img
                src={TESTIMONIALS_DATA[currentTestimonial].avatar}
                alt={TESTIMONIALS_DATA[currentTestimonial].name}
                className="testi-avatar"
              />
              <div className="testi-body">
                <p className="testi-quote">
                  "{TESTIMONIALS_DATA[currentTestimonial].comment}"
                </p>
                <div className="testi-author">
                  — {TESTIMONIALS_DATA[currentTestimonial].name}
                </div>
                <div className="testi-stars">
                  {'★'.repeat(TESTIMONIALS_DATA[currentTestimonial].rating)}
                </div>
              </div>
            </div>
          )}

          <div className="testi-controls">
            <button
              type="button"
              className="testi-nav-btn"
              onClick={handlePrevTestimonial}
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              type="button"
              className="testi-nav-btn"
              onClick={handleNextTestimonial}
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Floating chatbot assistant */}
      <ExperienceChatbot />
    </div>
  );
}

export default Home;
