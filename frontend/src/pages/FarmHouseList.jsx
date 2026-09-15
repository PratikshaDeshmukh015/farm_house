import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';
import './FarmHouseList.css';

const PAGE_SIZE = 6;

// Categories matching Mockup Screen 8: "Featured Estates"
const ESTATE_CATEGORIES = [
  { key: 'ALL', label: 'All', icon: '✨' },
  { key: 'MOUNTAIN', label: 'Mountain View', icon: '⛰️' },
  { key: 'POOL', label: 'Pool', icon: '🏊' },
  { key: 'RIVERSIDE', label: 'Riverside', icon: '🌊' },
  { key: 'LUXURY', label: 'Luxury', icon: '👑' },
  { key: 'BUDGET', label: 'Budget', icon: '💰' },
];

export const TYPE_CONFIG = {
  POOL_PARTY: { emoji: '🎉', label: 'Pool Party', color: '#ec4899' },
  ZEN_RETREAT: { emoji: '🧘', label: 'Zen Retreat', color: '#10b981' },
  ADVENTURE_WOODS: { emoji: '⛰️', label: 'Adventure Woods', color: '#059669' },
  HERITAGE_PALACE: { emoji: '🏰', label: 'Heritage Palace', color: '#ea580c' },
};

// Rich curated farmhouses matching Mockup 8
const DEMO_FARMHOUSES = [
  {
    id: 1,
    name: 'Riverside Farmhouse',
    category: 'RIVERSIDE',
    location: 'Lonavala, Maharashtra',
    description: 'A serene waterside sanctuary with private stone deck, lush mango orchard, and outdoor bonfire lounge.',
    pricePerDay: 6000,
    rating: 4.9,
    reviewsCount: 120,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    amenities: 'Swimming Pool, WiFi, BBQ, Lawn, Bonfire',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Mountain View Villa',
    category: 'MOUNTAIN',
    location: 'Mahabaleshwar, Maharashtra',
    description: 'Perched high with unbroken 270-degree valley vistas, cozy cedarwood interior, and strawberry farm access.',
    pricePerDay: 7500,
    rating: 4.8,
    reviewsCount: 95,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    amenities: 'Jacuzzi, Mountain Deck, Fireplace, Chef',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Poolside Retreat',
    category: 'POOL',
    location: 'Goa',
    description: 'Chic tropical villa featuring a private crystal-clear infinity pool, sun deck, and cocktail bar area.',
    pricePerDay: 5000,
    rating: 4.7,
    reviewsCount: 80,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    amenities: 'Private Pool, Bar Counter, Garden, WiFi',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Luxury Farmhouse',
    category: 'LUXURY',
    location: 'Alibaug, Maharashtra',
    description: 'Grand royal estate with manicured cricket lawn, private temperature-controlled pool, and 24/7 dedicated butler.',
    pricePerDay: 10000,
    rating: 4.9,
    reviewsCount: 210,
    maxGuests: 12,
    bedrooms: 5,
    bathrooms: 6,
    amenities: 'Private Pool, Butler Service, Lawn, Cinema Room',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Green Valley Farmhouse',
    category: 'BUDGET',
    location: 'Lonavala, Maharashtra',
    description: 'A beautiful countryside farmhouse with modern amenities, perfect for family vacations, corporate retreats and celebrations.',
    pricePerDay: 5000,
    rating: 4.9,
    reviewsCount: 24,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    amenities: 'Swimming Pool, WiFi, BBQ, Parking',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop'
  },
  {
    id: 6,
    name: 'Himalayan Pine Chalet',
    category: 'MOUNTAIN',
    location: 'Manali, Himachal Pradesh',
    description: 'Authentic pine wood chalet overlooking snow peaks with central indoor heating, attic lounge, and private chef.',
    pricePerDay: 8000,
    rating: 4.9,
    reviewsCount: 145,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    amenities: 'Heater, Pine Forest Deck, Bonfire, Chef',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop'
  },
  {
    id: 7,
    name: 'Whispering Palms Estate',
    category: 'POOL',
    location: 'Panchgani, Maharashtra',
    description: 'Surrounded by lush hills and private palm trees, with large outdoor pool, table tennis, and gazebo dining.',
    pricePerDay: 6500,
    rating: 4.8,
    reviewsCount: 88,
    maxGuests: 10,
    bedrooms: 4,
    bathrooms: 4,
    amenities: 'Pool, Gazebo, Table Tennis, Lawn',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
  },
  {
    id: 8,
    name: 'Royal Heritage Haveli',
    category: 'LUXURY',
    location: 'Jaipur, Rajasthan',
    description: 'Traditional sandstone palace with hand-carved pillars, peacock gardens, folk music nights, and royal dining.',
    pricePerDay: 12000,
    rating: 4.9,
    reviewsCount: 175,
    maxGuests: 14,
    bedrooms: 6,
    bathrooms: 6,
    amenities: 'Royal Courtyard, Pool, Folk Show, Banquet',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
  }
];

function getCategoryForEstate(estate) {
  if (estate.category) return estate.category.toUpperCase();
  const text = `${estate.name} ${estate.description} ${estate.location}`.toLowerCase();
  if (text.includes('mountain') || text.includes('himachal') || text.includes('manali')) return 'MOUNTAIN';
  if (text.includes('pool') || text.includes('infinity') || text.includes('water')) return 'POOL';
  if (text.includes('river') || text.includes('stream') || text.includes('ganga')) return 'RIVERSIDE';
  if (estate.pricePerDay >= 9000 || text.includes('luxury') || text.includes('royal')) return 'LUXURY';
  if (estate.pricePerDay <= 5500) return 'BUDGET';
  return 'ALL';
}

function FarmHouseList({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'ALL';

  const [allFarmhouses, setAllFarmhouses] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [likedEstates, setLikedEstates] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const gridRef = useRef(null);

  const paginate = useCallback((list, page) => {
    const total = Math.ceil(list.length / PAGE_SIZE) || 1;
    setTotalPages(total);
    setCurrentPage(page);
    const start = page * PAGE_SIZE;
    setDisplayList(list.slice(start, start + PAGE_SIZE));
  }, []);

  const applyFilters = useCallback((category, loc, list = allFarmhouses) => {
    let result = list;

    if (category && category !== 'ALL') {
      result = result.filter((fh) => getCategoryForEstate(fh) === category);
    }

    if (loc && loc.trim()) {
      const q = loc.trim().toLowerCase();
      result = result.filter(
        (fh) => fh.location?.toLowerCase().includes(q) || fh.name?.toLowerCase().includes(q)
      );
    }

    paginate(result, 0);
  }, [allFarmhouses, paginate]);

  useEffect(() => {
    fetchFarmhouses();
  }, []);

  const fetchFarmhouses = async () => {
    setLoading(true);
    try {
      const response = await farmhouseAPI.getAllFarmHouses(0, 100);
      let data = DEMO_FARMHOUSES;
      if (response.data?.success && response.data.farmhouses?.length > 0) {
        data = response.data.farmhouses;
      }
      setAllFarmhouses(data);
      applyFilters(activeCategory, searchLocation, data);
    } catch (err) {
      setAllFarmhouses(DEMO_FARMHOUSES);
      applyFilters(activeCategory, searchLocation, DEMO_FARMHOUSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allFarmhouses.length > 0) {
      applyFilters(activeCategory, searchLocation, allFarmhouses);
    }
  }, [activeCategory, allFarmhouses, applyFilters]);

  const handleCategorySelect = (key) => {
    if (key === 'ALL') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: key });
    }
  };

  const handleToggleLike = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedEstates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getImageUrl = (fh) => {
    if (fh.imageUrl) return fh.imageUrl;
    if (fh.imageUrls && Array.isArray(fh.imageUrls) && fh.imageUrls.length > 0) return fh.imageUrls[0];
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop';
  };

  return (
    <div className="featured-estates-page">
      {/* 1. Hero Banner (Mockup #8) */}
      <section className="featured-hero-banner">
        <div className="featured-hero-overlay"></div>
        <div className="featured-hero-content">
          <h1>Featured Estates</h1>
          <p className="featured-subtitle">
            Handcrafted luxury farmhouses in the most beautiful regions.
          </p>
          <div className="featured-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Farm Houses</span>
          </div>
        </div>
      </section>

      {/* 2. Main Catalog Container */}
      <section className="featured-main-container" ref={gridRef}>
        {/* Category Filter Pills (Mockup #8) */}
        <div className="featured-filter-tabs">
          {ESTATE_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`filter-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.key)}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="featured-search-row">
          <div className="search-bar-inner">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by city, region, or farmhouse name (e.g. Lonavala, Goa, Pool)..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === 'Enter') applyFilters(activeCategory, searchLocation, allFarmhouses);
              }}
            />
            {searchLocation && (
              <button
                className="clear-btn"
                onClick={() => {
                  setSearchLocation('');
                  applyFilters(activeCategory, '', allFarmhouses);
                }}
              >
                ✕
              </button>
            )}
            <button
              className="btn-search-go"
              onClick={() => applyFilters(activeCategory, searchLocation, allFarmhouses)}
            >
              Search
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="featured-results-header">
          <span>Showing <strong>{displayList.length}</strong> of <strong>{allFarmhouses.length}</strong> available properties</span>
        </div>

        {/* Estates Grid (Mockup #8) */}
        {loading ? (
          <div className="featured-loading-state">
            <div className="spinner"></div>
            <p>Loading handcrafted estates...</p>
          </div>
        ) : displayList.length > 0 ? (
          <div className="featured-estates-grid">
            {displayList.map(estate => {
              const ratingVal = estate.rating || 4.9;
              const reviewCount = estate.reviewsCount || 45;
              const isLiked = !!likedEstates[estate.id];

              return (
                <div key={estate.id} className="estate-card">
                  {/* Image container */}
                  <div className="estate-image-box">
                    <img src={getImageUrl(estate)} alt={estate.name} loading="lazy" />
                    <button
                      className={`estate-like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => handleToggleLike(e, estate.id)}
                      aria-label="Save to favorites"
                    >
                      {isLiked ? '❤️' : '🤍'}
                    </button>
                    <span className="estate-category-badge">
                      {estate.category || 'Featured'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="estate-card-body">
                    <div className="estate-header-row">
                      <h3 className="estate-title">{estate.name}</h3>
                      <div className="estate-rating-tag">
                        ⭐ {ratingVal} <span className="reviews-num">({reviewCount})</span>
                      </div>
                    </div>

                    <p className="estate-location">
                      📍 {estate.location}
                    </p>

                    <p className="estate-description">
                      {estate.description}
                    </p>

                    {/* Amenities Badges */}
                    <div className="estate-amenities-tags">
                      <span>🛏️ {estate.bedrooms || 3} Beds</span>
                      <span>🏊 Pool</span>
                      <span>📶 WiFi</span>
                      <span>🅿️ Parking</span>
                    </div>

                    {/* Price and View Details Action */}
                    <div className="estate-card-footer">
                      <div className="estate-price-box">
                        <span className="price-currency">₹ {estate.pricePerDay?.toLocaleString()}</span>
                        <span className="price-period"> / night</span>
                      </div>

                      <div className="estate-action-group">
                        <Link to={`/farmhouses/${estate.id}`} className="btn-view-details">
                          View Details
                        </Link>
                        <Link to={`/booking/${estate.id}`} className="btn-book-quick">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="featured-empty-state">
            <div className="empty-emoji">🏡</div>
            <h3>No Farmhouses Found</h3>
            <p>We couldn't find any farmhouses matching your current filters.</p>
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSearchLocation('');
                handleCategorySelect('ALL');
              }}
            >
              Show All Farmhouses
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="featured-pagination">
            <button
              className="page-btn"
              disabled={currentPage === 0}
              onClick={() => {
                const nextP = currentPage - 1;
                paginate(allFarmhouses, nextP);
                if (gridRef.current) gridRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              ‹ Previous
            </button>
            <span className="page-indicator">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={currentPage >= totalPages - 1}
              onClick={() => {
                const nextP = currentPage + 1;
                paginate(allFarmhouses, nextP);
                if (gridRef.current) gridRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Next ›
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default FarmHouseList;
