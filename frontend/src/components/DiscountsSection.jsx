import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { discountAPI, farmhouseAPI } from '../api/axiosInstance';
import './DiscountsSection.css';

// Metadata for each farmhouse type
const TYPE_META = {
  ZEN_RETREAT: {
    emoji: '🧘',
    label: 'Zen Retreat',
    themeClass: 'theme-zen',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
    tagline: 'Riverside & Quiet Stays',
  },
  POOL_PARTY: {
    emoji: '🎉',
    label: 'Pool Party',
    themeClass: 'theme-pool',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    tagline: 'Private Infinity Pools & DJ Stays',
  },
  ADVENTURE_WOODS: {
    emoji: '⛰️',
    label: 'Adventure Woods',
    themeClass: 'theme-adventure',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
    tagline: 'Mountain Cabins & Bonfire Trails',
  },
  HERITAGE_PALACE: {
    emoji: '🏰',
    label: 'Heritage Palace',
    themeClass: 'theme-heritage',
    gradient: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    tagline: 'Royal Havelis & Cultural Stays',
  },
  ALL: {
    emoji: '🏡',
    label: 'All Farmhouses',
    themeClass: 'theme-all',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    tagline: 'Group Bookings & Celebrations',
  },
};

const formatDiscountDate = (date) => date
  ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  : null;

export default function DiscountsSection({ onOffersCount }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userFarmhouses, setUserFarmhouses] = useState([]);

  // Owner/Admin Discount Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [discountForm, setDiscountForm] = useState({
    title: '',
    description: '',
    farmhouseType: 'POOL_PARTY',
    farmhouseId: '',
    discountPercent: '20',
    specialOffer: '',
    validFrom: '',
    validTo: '',
    isActive: true,
  });

  const navigate = useNavigate();

  const isOwnerOrAdmin = user && (user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN');

  const loadDiscounts = useCallback(async () => {
    try {
      const res = await discountAPI.getActiveDiscounts();
      if (res.data && res.data.success && Array.isArray(res.data.discounts)) {
        setDiscounts(res.data.discounts);
      } else {
        setDiscounts([]);
      }
    } catch (err) {
      console.warn('Could not load discounts from server:', err.message);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        if (u.role === 'OWNER') {
          farmhouseAPI.getFarmHousesByOwner(u.id)
            .then((r) => r.data?.success && setUserFarmhouses(r.data.farmhouses || []))
            .catch(() => {});
        } else if (u.role === 'ADMIN' || u.role === 'SUPERADMIN') {
          farmhouseAPI.getAllFarmHouses(0, 50)
            .then((r) => r.data?.success && setUserFarmhouses(r.data.farmhouses || []))
            .catch(() => {});
        }
      } catch (e) {
        setUser(null);
      }
    }
    loadDiscounts();
  }, [loadDiscounts]);

  const openCreateModal = (defaultCategory = 'POOL_PARTY') => {
    setEditingDiscount(null);
    setDiscountForm({
      title: '',
      description: '',
      farmhouseType: defaultCategory,
      farmhouseId: '',
      discountPercent: '20',
      specialOffer: '',
      validFrom: '',
      validTo: '',
      isActive: true,
    });
    setFormMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const openEditModal = (d) => {
    setEditingDiscount(d);
    setDiscountForm({
      title: d.title || '',
      description: d.description || '',
      farmhouseType: d.farmhouseType || 'ALL',
      farmhouseId: d.farmhouseId ? String(d.farmhouseId) : '',
      discountPercent: d.discountPercent ? String(d.discountPercent) : '20',
      specialOffer: d.specialOffer || '',
      validFrom: d.validFrom || '',
      validTo: d.validTo || '',
      isActive: d.isActive !== false,
    });
    setFormMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setFormSaving(true);
    if (discountForm.validFrom && discountForm.validTo && discountForm.validTo < discountForm.validFrom) {
      setFormMsg({ type: 'error', text: 'Valid To date cannot be earlier than Valid From date.' });
      setFormSaving(false);
      return;
    }

    try {
      const payload = {
        title: discountForm.title || `${discountForm.discountPercent}% OFF on ${discountForm.farmhouseType.replace('_', ' ')}`,
        description: discountForm.description,
        farmhouseType: discountForm.farmhouseType,
        farmhouseId: discountForm.farmhouseId ? parseInt(discountForm.farmhouseId, 10) : null,
        discountPercent: parseFloat(discountForm.discountPercent),
        specialOffer: discountForm.specialOffer,
        validFrom: discountForm.validFrom || null,
        validTo: discountForm.validTo || null,
        isActive: discountForm.isActive !== false,
      };

      if (editingDiscount) {
        await discountAPI.updateDiscount(editingDiscount.id, payload, user.id);
        setFormMsg({ type: 'success', text: 'Discount updated successfully!' });
      } else {
        await discountAPI.createDiscount(payload, user.id);
        setFormMsg({ type: 'success', text: 'Discount created and published!' });
      }

      await loadDiscounts();
      setTimeout(() => {
        setShowModal(false);
        setFormMsg({ type: '', text: '' });
      }, 1000);
    } catch (err) {
      setFormMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to save discount.',
      });
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      await discountAPI.deleteDiscount(id, user.id);
      loadDiscounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete discount');
    }
  };

  // Filter for genuine active offers (positive discount percent)
  const activeOffers = discounts.filter(
    (d) => d && d.isActive !== false && Number(d.discountPercent) > 0
  );

  useEffect(() => {
    if (typeof onOffersCount === 'function') {
      onOffersCount(activeOffers.length);
    }
  }, [activeOffers.length, onOffersCount]);

  // ONLY build cards for farmhouse types that have an active offer
  const displayCards = activeOffers.map((activeDiscount) => {
    const typeKey = activeDiscount.farmhouseType || 'ALL';
    const meta = TYPE_META[typeKey] || TYPE_META.ALL;
    const discountPercent = Number(activeDiscount.discountPercent);

    return {
      typeKey,
      meta,
      discountPercent,
      specialOffer: activeDiscount.specialOffer || null,
      validFrom: activeDiscount.validFrom || null,
      validTo: activeDiscount.validTo || null,
      farmhouseName: activeDiscount.farmhouseName || null,
      farmhouseId: activeDiscount.farmhouseId || null,
      discountId: activeDiscount.id,
      createdById: activeDiscount.createdById,
      isCustom: true,
      rawDiscount: activeDiscount,
    };
  });

  // If not loading, no active offers exist, and user is not an admin/owner, hide the section entirely
  if (!loading && displayCards.length === 0 && !isOwnerOrAdmin) {
    return null;
  }

  return (
    <section className="discounts-section" id="discounts">
      {/* Decorative background blobs */}
      <div className="ds-blob ds-blob-1" />
      <div className="ds-blob ds-blob-2" />

      {/* Header Intro */}
      <div className="section-intro">
        <div className="ds-header-top">
          <a
            href="#discounts"
            className="section-chip ds-chip"
            style={{ cursor: 'pointer', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('discounts')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            🔥 DISCOUNTS BY FARMHOUSE TYPE
          </a>
          {isOwnerOrAdmin && (
            <div className="ds-admin-control-bar">
              <button
                type="button"
                className="ds-create-discount-btn"
                onClick={() => openCreateModal('POOL_PARTY')}
              >
                ➕ Set / Change % Discount ({user.role})
              </button>
              <button
                type="button"
                className="ds-owner-manage-btn"
                onClick={() => navigate(user.role === 'OWNER' ? '/owner-dashboard' : '/admin')}
              >
                ⚙️ Dashboard
              </button>
            </div>
          )}
        </div>
        <h2>Special Farmhouse Type Discounts</h2>
        <p>Explore exclusive percentage discounts currently active for farmhouse stays.</p>
      </div>

      {/* ── SHOW ACTIVE OFFERS OR ADMIN EMPTY STATE ── */}
      {displayCards.length === 0 ? (
        <div className="ds-no-deals">
          <span>🏷️</span>
          <h3>No Active Discount Offers</h3>
          <p>
            There are currently no active offers. When you publish a discount for a farmhouse type,
            only that type of discount will be displayed to guests.
          </p>
          {isOwnerOrAdmin && (
            <button
              type="button"
              className="ds-create-discount-btn"
              style={{ margin: '0 auto', display: 'inline-flex' }}
              onClick={() => openCreateModal('POOL_PARTY')}
            >
              ➕ Set First % Discount
            </button>
          )}
        </div>
      ) : (
        <div className="ds-grid">
          {displayCards.map((card) => (
            <div
              key={card.discountId || card.typeKey}
              className={`ds-type-card ${card.meta.themeClass || ''}`}
              style={{ background: card.meta.gradient }}
            >
              {/* Percentage Badge */}
              <div className="ds-badge">
                <span className="ds-badge-percent">{card.discountPercent}%</span>
                <span className="ds-badge-off">OFF</span>
              </div>

              {/* Owner/Admin Quick Edit / Set Buttons */}
              {isOwnerOrAdmin && (
                <div className="ds-card-admin-actions">
                  <button
                    type="button"
                    className="ds-mini-btn edit"
                    title="Edit % Discount"
                    onClick={() => openEditModal(card.rawDiscount)}
                  >
                    ✏️ Edit %
                  </button>
                  <button
                    type="button"
                    className="ds-mini-btn delete"
                    title="Delete discount"
                    onClick={() => handleDeleteDiscount(card.discountId)}
                  >
                    🗑️
                  </button>
                </div>
              )}

              {/* Farmhouse Type Header */}
              <div className="ds-type-card-header">
                <span className="ds-type-icon">{card.meta.emoji}</span>
                <div className="ds-type-info">
                  <h3 className="ds-type-name">{card.meta.label}</h3>
                  <span className="ds-type-tagline">{card.meta.tagline}</span>
                </div>
              </div>

              {/* Specific Property Tag if applicable */}
              {card.farmhouseName && (
                <div className="ds-specific-farmhouse">
                  🏡 Applies to: <strong>{card.farmhouseName}</strong>
                </div>
              )}

              {(card.validFrom || card.validTo) && (
                <div className="ds-validity-tag">
                  📅 Valid: {formatDiscountDate(card.validFrom) || 'Now'} - {formatDiscountDate(card.validTo) || 'Ongoing'}
                </div>
              )}

              {/* Special Perk if set */}
              {card.specialOffer && (
                <div className="ds-offer-tag">
                  🎁 {card.specialOffer}
                </div>
              )}

              {/* Direct Action Button */}
              <div className="ds-type-card-footer">
                <Link
                  to={
                    card.farmhouseId
                      ? `/farmhouses/${card.farmhouseId}`
                      : card.typeKey === 'ALL'
                      ? '/farmhouses'
                      : `/farmhouses?type=${card.typeKey}`
                  }
                  state={{ appliedDiscount: card.rawDiscount }}
                  className="ds-type-book-btn"
                >
                  Explore {card.meta.label} ({card.discountPercent}% OFF) →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── OWNER / ADMIN QUICK DISCOUNT MODAL ── */}
      {showModal && (
        <div className="ds-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="ds-modal-content">
            <div className="ds-modal-header">
              <h3>
                {editingDiscount ? '✏️ Edit Farmhouse Type Discount' : '➕ Set % Discount for Farmhouse Type'}
              </h3>
              <button type="button" className="ds-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="ds-modal-form">
              {formMsg.text && (
                <div className={`ds-form-alert ${formMsg.type}`}>
                  {formMsg.text}
                </div>
              )}

              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>1. Farmhouse Type *</label>
                  <select
                    value={discountForm.farmhouseType}
                    onChange={(e) => setDiscountForm({ ...discountForm, farmhouseType: e.target.value })}
                    required
                  >
                    <option value="POOL_PARTY">🎉 Pool Party Farmhouse</option>
                    <option value="ZEN_RETREAT">🧘 Zen Retreat Farmhouse</option>
                    <option value="HERITAGE_PALACE">🏰 Heritage Palace Farmhouse</option>
                    <option value="ADVENTURE_WOODS">⛰️ Adventure Woods Farmhouse</option>
                    <option value="ALL">🏡 All Farmhouses</option>
                  </select>
                </div>

                <div className="ds-form-field">
                  <label>2. Discount % (Set 0 for No Discount) *</label>
                  <div className="ds-percent-input-wrap">
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={discountForm.discountPercent}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountPercent: e.target.value })}
                      placeholder="0"
                      required
                    />
                    <span className="ds-percent-symbol">
                      {Number(discountForm.discountPercent) === 0 ? 'NO DISC' : '% OFF'}
                    </span>
                  </div>

                  {/* Quick percentage selector presets */}
                  <div className="ds-presets-row">
                    <button
                      type="button"
                      className={`ds-preset-chip ${discountForm.discountPercent === '0' ? 'active zero' : ''}`}
                      onClick={() => setDiscountForm({ ...discountForm, discountPercent: '0' })}
                    >
                      🚫 0% (No Discount)
                    </button>
                    {['10', '15', '20', '25', '30'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`ds-preset-chip ${discountForm.discountPercent === p ? 'active' : ''}`}
                        onClick={() => setDiscountForm({ ...discountForm, discountPercent: p })}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>3. Valid From Date (Optional)</label>
                  <input
                    type="date"
                    value={discountForm.validFrom || ''}
                    onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                  />
                </div>

                <div className="ds-form-field">
                  <label>4. Valid To Date (Optional)</label>
                  <input
                    type="date"
                    value={discountForm.validTo || ''}
                    min={discountForm.validFrom || undefined}
                    onChange={(e) => setDiscountForm({ ...discountForm, validTo: e.target.value })}
                  />
                </div>
              </div>

              {userFarmhouses.length > 0 && (
                <div className="ds-form-field">
                  <label>Target Specific Farmhouse (Optional)</label>
                  <select
                    value={discountForm.farmhouseId}
                    onChange={(e) => setDiscountForm({ ...discountForm, farmhouseId: e.target.value })}
                  >
                    <option value="">Apply to all farmhouses in this type</option>
                    {userFarmhouses.map((fh) => (
                      <option key={fh.id} value={fh.id}>
                        🏡 {fh.name} ({fh.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="ds-form-field">
                <label>Special Bonus Offer (Optional)</label>
                <input
                  type="text"
                  value={discountForm.specialOffer}
                  onChange={(e) => setDiscountForm({ ...discountForm, specialOffer: e.target.value })}
                  placeholder={Number(discountForm.discountPercent) === 0 ? 'e.g. Standard rate booking' : 'e.g. Complimentary breakfast & BBQ kit'}
                />
              </div>

              <div className="ds-modal-actions">
                <button type="button" className="ds-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ds-btn-submit" disabled={formSaving}>
                  {formSaving ? 'Saving...' : editingDiscount ? 'Update % Discount' : 'Publish % Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
