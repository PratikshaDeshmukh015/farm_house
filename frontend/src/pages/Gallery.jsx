import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';
import {
  FARMHOUSE_CURATED_GALLERIES,
  getFarmhouseGalleryPhotos
} from '../utils/farmhouseGalleryData';
import './Gallery.css';

const DEFAULT_DEMO_FARMHOUSES = [
  { id: 1, name: 'Luxury Mountain Villa', location: 'Himachal Pradesh', pricePerDay: 5000, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200' },
  { id: 2, name: 'Cozy Countryside Cottage', location: 'Goa', pricePerDay: 3500, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200' },
  { id: 3, name: 'Modern Farm Estate', location: 'Punjab', pricePerDay: 6000, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200' },
  { id: 4, name: 'Riverside Farmhouse', location: 'Uttarakhand', pricePerDay: 4500, imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200' },
  { id: 5, name: 'Heritage Farm Resort', location: 'Rajasthan', pricePerDay: 4000, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200' },
];

function Gallery() {
  const { farmhouseId: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const requestedId = routeId || searchParams.get('farmhouseId');

  const navigate = useNavigate();
  const [farmhouses, setFarmhouses] = useState(DEFAULT_DEMO_FARMHOUSES);
  const [selectedId, setSelectedId] = useState(requestedId || 'all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState(null);

  // Fetch live farmhouses from backend
  useEffect(() => {
    let mounted = true;
    farmhouseAPI.getAllFarmHouses(0, 100)
      .then(({ data }) => {
        const items = data?.farmhouses || data?.content || (Array.isArray(data) ? data : []);
        if (mounted && items.length) {
          setFarmhouses(items);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch farmhouses from backend for gallery, using default estates', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync selectedId when URL param changes
  useEffect(() => {
    if (requestedId) {
      setSelectedId(String(requestedId));
    }
  }, [requestedId]);

  // Find currently selected farmhouse
  const selectedFarmhouse = useMemo(() => {
    if (selectedId === 'all') return null;
    return farmhouses.find(item => String(item.id) === String(selectedId)) || null;
  }, [selectedId, farmhouses]);

  // Compute photos: If farmhouse selected, show THAT farmhouse photos ONLY!
  const photos = useMemo(() => {
    if (selectedFarmhouse) {
      return getFarmhouseGalleryPhotos(selectedFarmhouse);
    }
    // "All" selected: combine all farmhouses' photo collections
    return farmhouses.flatMap(fh => getFarmhouseGalleryPhotos(fh));
  }, [selectedFarmhouse, farmhouses]);

  // Dynamic categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts = { All: photos.length };
    photos.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    const uniqueCats = ['All', ...Object.keys(counts).filter(c => c !== 'All')];
    return uniqueCats.map(name => ({ name, count: counts[name] || 0 }));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return photos;
    return photos.filter(p => p.category === activeCategory);
  }, [photos, activeCategory]);

  const activePhoto = activeIndex !== null ? filteredPhotos[activeIndex] : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activePhoto) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') {
        setActiveIndex(index => (index - 1 + filteredPhotos.length) % filteredPhotos.length);
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex(index => (index + 1) % filteredPhotos.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePhoto, filteredPhotos.length]);

  const selectFarmhouse = (id) => {
    setSelectedId(id);
    setActiveCategory('All');
    setActiveIndex(null);
    if (id === 'all') {
      navigate('/gallery');
    } else {
      navigate(`/gallery?farmhouseId=${id}`);
    }
  };

  const title = selectedFarmhouse
    ? `${selectedFarmhouse.name} — Photo Gallery`
    : 'Farm House Photo Gallery';

  const subtitle = selectedFarmhouse
    ? `Explore real high-definition photos of ${selectedFarmhouse.name}`
    : 'Discover scenic views, luxury pools, bedrooms, and outdoor experiences';

  const heroBg = selectedFarmhouse?.imageUrl ||
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600';

  return (
    <div className="gallery-mockup-page">
      {/* ── 1. Hero Banner with dynamic farmhouse styling ── */}
      <section
        className="gallery-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(13, 56, 32, 0.88) 0%, rgba(20, 85, 48, 0.82) 100%), url('${heroBg}')`
        }}
      >
        <div className="gallery-hero-overlay" />
        <div className="gallery-hero-inner">
          <p className="gallery-eyebrow">
            {selectedFarmhouse ? `ESTATE PHOTO SHOWCASE · ${selectedFarmhouse.location}` : 'STAY SOMEWHERE WORTH REMEMBERING'}
          </p>
          <h1>{title}</h1>
          <p className="gallery-hero-location">{subtitle}</p>

          <div className="gallery-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">&gt;</span>
            <Link to="/farmhouses">Farm Houses</Link>
            {selectedFarmhouse && (
              <>
                <span className="sep">&gt;</span>
                <Link to={`/farmhouses/${selectedFarmhouse.id}`}>
                  {selectedFarmhouse.name}
                </Link>
              </>
            )}
            <span className="sep">&gt;</span>
            <span className="current">Gallery</span>
          </div>

          {selectedFarmhouse && (
            <div className="gallery-hero-actions">
              <Link to={`/farmhouses/${selectedFarmhouse.id}`} className="gallery-hero-btn secondary">
                ← Back to Farmhouse Details
              </Link>
              <Link to={`/booking/${selectedFarmhouse.id}`} className="gallery-hero-btn primary">
                Book This Farmhouse ➔
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Content Wrap ── */}
      <section className="gallery-content-wrap">
        {/* Interactive Farmhouse Switcher */}
        <div className="gallery-estate-selector-bar">
          <div className="estate-selector-header">
            <span className="selector-title">🏡 Select Farmhouse:</span>
            <span className="selector-hint">
              {selectedFarmhouse
                ? `Showing ${photos.length} photos for "${selectedFarmhouse.name}"`
                : `Showing all estates (${photos.length} photos)`}
            </span>
          </div>

          {/* Desktop horizontal pill switcher */}
          <div className="estate-pills-row">
            <button
              type="button"
              className={`estate-pill ${selectedId === 'all' ? 'active' : ''}`}
              onClick={() => selectFarmhouse('all')}
            >
              ✨ All Estates ({farmhouses.length})
            </button>
            {farmhouses.map(fh => (
              <button
                key={fh.id}
                type="button"
                className={`estate-pill ${String(selectedId) === String(fh.id) ? 'active' : ''}`}
                onClick={() => selectFarmhouse(String(fh.id))}
              >
                📍 {fh.name}
              </button>
            ))}
          </div>

          {/* Mobile dropdown selector */}
          <div className="estate-select-dropdown-wrap">
            <select
              value={selectedId}
              onChange={e => selectFarmhouse(e.target.value)}
              className="estate-select-dropdown"
              aria-label="Select farmhouse"
            >
              <option value="all">✨ All Farm Houses</option>
              {farmhouses.map(fh => (
                <option key={fh.id} value={fh.id}>
                  {fh.name} ({fh.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="gallery-filters-row">
          {categoriesWithCounts.map(({ name, count }) => (
            <button
              key={name}
              type="button"
              className={`gallery-pill-btn ${activeCategory === name ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(name);
                setActiveIndex(null);
              }}
            >
              {name} <span className="pill-count">({count})</span>
            </button>
          ))}
        </div>

        {/* ── 3. 3-Column Masonry Mosaic Grid ── */}
        {filteredPhotos.length === 0 ? (
          <div className="gallery-empty-state">
            <span className="empty-icon">📷</span>
            <h3>No photos found in "{activeCategory}"</h3>
            <button
              className="gallery-pill-btn active"
              onClick={() => setActiveCategory('All')}
            >
              Show All Photos
            </button>
          </div>
        ) : (
          <div className="gallery-mosaic-grid">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className={`mosaic-card ${photo.aspect || 'medium'}`}
                onClick={() => setActiveIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveIndex(index);
                  }
                }}
                aria-label={`View photo: ${photo.title}`}
              >
                <img src={photo.image} alt={photo.title} loading="lazy" />
                <div className="mosaic-overlay">
                  <div className="mosaic-top-badges">
                    <span className="mosaic-tag">{photo.category}</span>
                    {photo.farmhouseName && (
                      <span className="mosaic-estate-tag">🏡 {photo.farmhouseName}</span>
                    )}
                  </div>
                  <h3 className="mosaic-title">{photo.title}</h3>
                  <p className="mosaic-loc">📍 {photo.location}</p>
                  <span className="mosaic-zoom-hint">Click to enlarge 🔍</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Fullscreen Interactive Lightbox Modal ── */}
      {activePhoto && (
        <div className="gallery-modal-backdrop" onClick={() => setActiveIndex(null)}>
          <div className="gallery-modal-box" onClick={e => e.stopPropagation()}>
            <button
              className="gallery-modal-close"
              onClick={() => setActiveIndex(null)}
              aria-label="Close image"
            >
              ✕
            </button>

            {filteredPhotos.length > 1 && (
              <>
                <button
                  className="gallery-modal-nav prev"
                  onClick={() => setActiveIndex(index => (index - 1 + filteredPhotos.length) % filteredPhotos.length)}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="gallery-modal-nav next"
                  onClick={() => setActiveIndex(index => (index + 1) % filteredPhotos.length)}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <div className="modal-img-container">
              <img src={activePhoto.image} alt={activePhoto.title} />
              <div className="modal-counter-badge">
                {activeIndex + 1} / {filteredPhotos.length}
              </div>
            </div>

            <div className="modal-info-panel">
              <div className="modal-info-left">
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <span className="modal-tag">{activePhoto.category}</span>
                  {activePhoto.farmhouseName && (
                    <span className="modal-tag estate">🏡 {activePhoto.farmhouseName}</span>
                  )}
                </div>
                <h2>{activePhoto.title}</h2>
                <p>📍 {activePhoto.location}</p>
              </div>

              <div className="modal-actions-group">
                {activePhoto.farmhouseId ? (
                  <>
                    <Link
                      to={`/farmhouses/${activePhoto.farmhouseId}`}
                      className="modal-detail-btn"
                      onClick={() => setActiveIndex(null)}
                    >
                      View Farmhouse Details
                    </Link>
                    <Link
                      to={`/booking/${activePhoto.farmhouseId}`}
                      className="modal-book-btn"
                      onClick={() => setActiveIndex(null)}
                    >
                      Book This Farmhouse ➔
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/farmhouses"
                    className="modal-book-btn"
                    onClick={() => setActiveIndex(null)}
                  >
                    Browse Farmhouses ➔
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
