import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';

// Exact image dataset matching Mockup Screen 3: "Gallery"
const GALLERY_PHOTOS = [
  // Left Column Photos
  {
    id: 1,
    column: 'left',
    title: 'Azure Infinity Pool Villa',
    category: 'Pools',
    location: 'Goa',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
    aspect: 'tall'
  },
  {
    id: 2,
    column: 'left',
    title: 'Misty Hillside Garden Lawn',
    category: 'Nature',
    location: 'Mahabaleshwar, Maharashtra',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    aspect: 'tall'
  },

  // Middle Column Photos
  {
    id: 3,
    column: 'middle',
    title: 'Green Valley Private Pool Estate',
    category: 'Farm Houses',
    location: 'Lonavala, Maharashtra',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
    aspect: 'medium'
  },
  {
    id: 4,
    column: 'middle',
    title: 'Luxury Master Bedroom Suite',
    category: 'Farm Houses',
    location: 'Udaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200',
    aspect: 'medium'
  },
  {
    id: 5,
    column: 'middle',
    title: 'Alfresco Garden Dining & Gazebo',
    category: 'Activities',
    location: 'Coorg, Karnataka',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    aspect: 'medium'
  },

  // Right Column Photos
  {
    id: 6,
    column: 'right',
    title: 'Panoramic Himalayan Ridge View',
    category: 'Hillside',
    location: 'Manali, Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200',
    aspect: 'medium'
  },
  {
    id: 7,
    column: 'right',
    title: 'Canopy Stargazing Lounge Tent',
    category: 'Nature',
    location: 'Kasauli, Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&q=80&w=1200',
    aspect: 'medium'
  },
  {
    id: 8,
    column: 'right',
    title: 'Illuminated Heritage Courtyard Villa',
    category: 'Farm Houses',
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    aspect: 'medium'
  }
];

const CATEGORIES = ['All', 'Farm Houses', 'Pools', 'Nature', 'Hillside', 'Activities'];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeModal, setActiveModal] = useState(null);

  const filteredPhotos = activeCategory === 'All'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(photo => photo.category === activeCategory);

  return (
    <div className="gallery-mockup-page">
      {/* ── 1. Hero Banner (Mockup #3) ── */}
      <section className="gallery-hero">
        <div className="gallery-hero-overlay"></div>
        <div className="gallery-hero-inner">
          <h1>Gallery</h1>
          <div className="gallery-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">&gt;</span>
            <span className="current">Gallery</span>
          </div>
        </div>
      </section>

      {/* ── 2. Filter Pills Bar (Mockup #3) ── */}
      <section className="gallery-content-wrap">
        <div className="gallery-filters-row">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`gallery-pill-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ── 3. 3-Column Masonry Mosaic Grid (Mockup #3) ── */}
        <div className="gallery-mosaic-grid">
          {/* Column 1 (Left) */}
          <div className="mosaic-column">
            {filteredPhotos
              .filter(p => activeCategory === 'All' ? p.column === 'left' : true)
              .slice(0, activeCategory === 'All' ? 2 : Math.ceil(filteredPhotos.length / 3))
              .map(item => (
                <div
                  key={item.id}
                  className={`mosaic-card ${item.aspect}`}
                  onClick={() => setActiveModal(item)}
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="mosaic-overlay">
                    <span className="mosaic-tag">{item.category}</span>
                    <h3 className="mosaic-title">{item.title}</h3>
                    <p className="mosaic-loc">📍 {item.location}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Column 2 (Middle) */}
          <div className="mosaic-column">
            {filteredPhotos
              .filter(p => activeCategory === 'All' ? p.column === 'middle' : true)
              .slice(
                0,
                activeCategory === 'All'
                  ? 3
                  : Math.ceil((filteredPhotos.length * 2) / 3) - Math.ceil(filteredPhotos.length / 3)
              )
              .map(item => (
                <div
                  key={item.id}
                  className={`mosaic-card ${item.aspect}`}
                  onClick={() => setActiveModal(item)}
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="mosaic-overlay">
                    <span className="mosaic-tag">{item.category}</span>
                    <h3 className="mosaic-title">{item.title}</h3>
                    <p className="mosaic-loc">📍 {item.location}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Column 3 (Right) */}
          <div className="mosaic-column">
            {filteredPhotos
              .filter(p => activeCategory === 'All' ? p.column === 'right' : true)
              .slice(
                0,
                activeCategory === 'All'
                  ? 3
                  : filteredPhotos.length - Math.ceil((filteredPhotos.length * 2) / 3)
              )
              .map(item => (
                <div
                  key={item.id}
                  className={`mosaic-card ${item.aspect}`}
                  onClick={() => setActiveModal(item)}
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="mosaic-overlay">
                    <span className="mosaic-tag">{item.category}</span>
                    <h3 className="mosaic-title">{item.title}</h3>
                    <p className="mosaic-loc">📍 {item.location}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── 4. Fullscreen Lightbox Modal ── */}
      {activeModal && (
        <div className="gallery-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="gallery-modal-box" onClick={e => e.stopPropagation()}>
            <button
              className="gallery-modal-close"
              onClick={() => setActiveModal(null)}
              aria-label="Close image"
            >
              ✕
            </button>
            <div className="modal-img-container">
              <img src={activeModal.image} alt={activeModal.title} />
            </div>
            <div className="modal-info-panel">
              <div className="modal-info-left">
                <span className="modal-tag">{activeModal.category}</span>
                <h2>{activeModal.title}</h2>
                <p>📍 {activeModal.location}</p>
              </div>
              <Link
                to="/farmhouses"
                className="modal-book-btn"
                onClick={() => setActiveModal(null)}
              >
                Browse Farmhouses ➔
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
