import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discountAPI } from '../api/axiosInstance';
import './Offers.css';

const isOfferCurrentlyValid = (discount) => {
  const hasValidValue = discount?.discountType === 'FIXED'
    ? Number(discount.discountValue) > 0
    : Number(discount?.discountPercent) > 0;
  if (!discount || discount.isActive === false || !hasValidValue) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (discount.validFrom && new Date(`${discount.validFrom}T00:00:00`) > today) return false;
  if (discount.validTo && new Date(`${discount.validTo}T00:00:00`) < today) return false;
  return true;
};

const toOfferCard = (discount) => {
  const isFixed = discount.discountType === 'FIXED';
  const discountLabel = isFixed
    ? `₹${discount.discountValue || 0} OFF`
    : `${discount.discountPercent}% OFF`;
  const code = discount.discountCode || discount.code || `DISCOUNT-${discount.id}`;

  return {
    ...discount,
    discount: discountLabel,
    percent: Number(discount.discountPercent || 0),
    discountValue: Number(discount.discountValue || 0),
    discountType: discount.discountType || 'PERCENTAGE',
    tagline: discount.farmhouseType === 'POOL_PARTY' ? 'Private Pools & Infinity Luxury' : 'Exclusive Farmhouse Savings',
    description: discount.description || discount.specialOffer || 'Enjoy exclusive savings on your farmhouse booking.',
    code: code,
    minNights: discount.minBookingAmount ? `Min stay ₹${discount.minBookingAmount}` : '1 night minimum',
    validTill: discount.validTo ? `Until ${discount.validTo}` : 'Ongoing',
    status: 'ACTIVE NOW',
    icon: discount.farmhouseType === 'POOL_PARTY' ? '🏊' : '🏡',
  };
};

function Offers() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeDiscounts, setActiveDiscounts] = useState([]);

  useEffect(() => {
    discountAPI.getActiveDiscounts()
      .then((res) => {
        const discounts = res.data?.success && Array.isArray(res.data.discounts)
          ? res.data.discounts
          : [];
        setActiveDiscounts(discounts.filter(isOfferCurrentlyValid).map(toOfferCard));
      })
      .catch(() => setActiveDiscounts([]));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="offers-page">
      {/* Hero Banner (Mockup #10) */}
      <section className="offers-hero">
        <div className="offers-hero-overlay"></div>
        <div className="offers-hero-content">
          <span className="offers-badge">🔥 Verified Live Discounts</span>
          <h1>Active Farmhouse Discounts</h1>
          <div className="offers-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Active Offers</span>
          </div>
          <p className="offers-subtitle">
            Showing only verified, currently active percentage discounts and instant promo codes for farmhouse bookings.
          </p>
        </div>
      </section>

      {/* Main Grid showing ONLY active discounts */}
      <section className="offers-main-container">
        {/* Active counter */}
        <div className="active-offers-status-bar">
          <span className="live-dot-pulse"></span>
          <span><strong>{activeDiscounts.length} Active Discounts</strong> available for booking right now</span>
        </div>

        {/* Toast alert when copied */}
        {copiedCode && (
          <div className="offers-toast">
            <span>🎉 Promo code <strong>{copiedCode}</strong> copied to clipboard!</span>
          </div>
        )}

        <div className="offers-grid">
          {activeDiscounts.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-card-top">
                <span className="offer-badge active-live-badge">
                  <span className="live-indicator">●</span> {offer.status}
                </span>
                <span className="offer-icon">{offer.icon}</span>
              </div>

              <h2 className="offer-discount">{offer.discount}</h2>
              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-tagline">{offer.tagline}</p>
              <p className="offer-desc">{offer.description}</p>

              <div className="offer-meta">
                <span className="meta-pill">⏳ {offer.minNights}</span>
                <span className="meta-pill active-pill">🟢 {offer.validTill}</span>
              </div>

              <div className="offer-coupon-box">
                <div className="coupon-code">
                  <span className="coupon-label">Code:</span>
                  <span className="code-text">{offer.code}</span>
                </div>
                <button
                  className={`copy-btn ${copiedCode === offer.code ? 'copied' : ''}`}
                  onClick={() => handleCopy(offer.code)}
                >
                  {copiedCode === offer.code ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>

              <Link
                to={`/booking/1?code=${offer.code}`}
                className="offer-book-btn"
              >
                <span>Apply {offer.discount} &amp; Book Now</span>
                <span>➔</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="offers-perk-banner">
          <div className="perk-item">
            <span className="perk-icon">🏷️</span>
            <div>
              <h4>100% Guaranteed Active</h4>
              <p>All promo codes listed on this page are active and tested daily for instant checkout deduction.</p>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🔄</span>
            <div>
              <h4>Free Date Rescheduling</h4>
              <p>Flexible date adjustments with 48 hours notice on all discount reservations.</p>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🛡️</span>
            <div>
              <h4>Verified Quality Stays</h4>
              <p>Every discounted villa maintains strict 5-star cleanliness &amp; safety standards.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Offers;
