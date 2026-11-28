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
  ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  : null;

/** Returns true if the discount's validTo date has already passed today */
const isOfferExpired = (discount) => {
  if (!discount.validTo) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${discount.validTo}T00:00:00`);
  return expiry < today;
};

/** Returns true if the discount has not started yet */
const isOfferNotStarted = (discount) => {
  if (!discount.validFrom) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${discount.validFrom}T00:00:00`);
  return start > today;
};

/** Compute a human-readable status for owner/admin management view */
const getOfferStatus = (discount) => {
  if (discount.status) return discount.status;
  if (discount.isActive === false) return 'INACTIVE';
  if (isOfferExpired(discount)) return 'EXPIRED';
  if (isOfferNotStarted(discount)) return 'UPCOMING';
  return 'ACTIVE';
};

// Status badge styling config
const STATUS_CONFIG = {
  ACTIVE:   { label: '🟢 Active',   color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  EXPIRED:  { label: '🔴 Expired',  color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  INACTIVE: { label: '⏸ Inactive', color: '#9ca3af', bg: '#f3f4f6', border: '#e5e7eb' },
  UPCOMING: { label: '🕐 Upcoming', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
};

export default function DiscountsSection({ onOffersCount }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userFarmhouses, setUserFarmhouses] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Owner/Admin Discount Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [discountForm, setDiscountForm] = useState({
    title: '',
    description: '',
    discountCode: '',
    discountType: 'PERCENTAGE',
    discountPercent: '20',
    discountValue: '',
    maxDiscountAmount: '',
    minBookingAmount: '',
    farmhouseType: 'POOL_PARTY',
    farmhouseId: '',
    specialOffer: '',
    validFrom: '',
    validTo: '',
    isActive: true,
  });

  const navigate = useNavigate();

  const isOwnerOrAdmin = user && (user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN');

  // ── Load discounts ────────────────────────────────────────────────────────
  const loadDiscounts = useCallback(async (currentUser) => {
    try {
      let res;
      if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN')) {
        res = await discountAPI.getAllDiscounts(currentUser.id);
      } else if (currentUser && currentUser.role === 'OWNER') {
        res = await discountAPI.getDiscountsByOwner(currentUser.id, currentUser.id);
      } else {
        res = await discountAPI.getActiveDiscounts();
      }
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
    let currentUser = null;
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        setUser(currentUser);
        if (currentUser.role === 'OWNER') {
          farmhouseAPI.getFarmHousesByOwner(currentUser.id)
            .then((r) => r.data?.success && setUserFarmhouses(r.data.farmhouses || []))
            .catch(() => {});
        } else if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') {
          farmhouseAPI.getAllFarmHouses(0, 50)
            .then((r) => r.data?.success && setUserFarmhouses(r.data.farmhouses || []))
            .catch(() => {});
        }
      } catch (e) {
        currentUser = null;
        setUser(null);
      }
    }
    loadDiscounts(currentUser);
  }, [loadDiscounts]);

  // ── Copy Code to Clipboard ───────────────────────────────────────────────
  const handleCopyCode = (code, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // ── Toggle Active / Inactive ──────────────────────────────────────────────
  const handleToggleActive = async (discount) => {
    if (!user) return;
    setTogglingId(discount.id);
    try {
      await discountAPI.updateDiscount(
        discount.id,
        { isActive: !discount.isActive },
        user.id
      );
      // Optimistic local update
      setDiscounts((prev) =>
        prev.map((d) => d.id === discount.id ? { ...d, isActive: !d.isActive } : d)
      );
      loadDiscounts(user);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update discount status.');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreateModal = (defaultCategory = 'POOL_PARTY') => {
    setEditingDiscount(null);
    setDiscountForm({
      title: '',
      description: '',
      discountCode: '',
      discountType: 'PERCENTAGE',
      discountPercent: '20',
      discountValue: '',
      maxDiscountAmount: '',
      minBookingAmount: '',
      farmhouseType: defaultCategory,
      farmhouseId: '',
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
      discountCode: d.discountCode || '',
      discountType: d.discountType || 'PERCENTAGE',
      discountPercent: d.discountPercent != null ? String(d.discountPercent) : '20',
      discountValue: d.discountValue != null ? String(d.discountValue) : '',
      maxDiscountAmount: d.maxDiscountAmount != null ? String(d.maxDiscountAmount) : '',
      minBookingAmount: d.minBookingAmount != null ? String(d.minBookingAmount) : '',
      farmhouseType: d.farmhouseType || 'ALL',
      farmhouseId: d.farmhouseId ? String(d.farmhouseId) : '',
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
        title: discountForm.title || `${discountForm.discountType === 'FIXED' ? `₹${discountForm.discountValue}` : `${discountForm.discountPercent}%`} OFF on ${discountForm.farmhouseType.replace('_', ' ')}`,
        description: discountForm.description,
        discountCode: discountForm.discountCode ? discountForm.discountCode.trim().toUpperCase() : null,
        discountType: discountForm.discountType,
        discountPercent: parseFloat(discountForm.discountPercent || 0),
        discountValue: discountForm.discountValue ? parseFloat(discountForm.discountValue) : null,
        maxDiscountAmount: discountForm.maxDiscountAmount ? parseFloat(discountForm.maxDiscountAmount) : null,
        minBookingAmount: discountForm.minBookingAmount ? parseFloat(discountForm.minBookingAmount) : null,
        farmhouseType: discountForm.farmhouseType,
        farmhouseId: discountForm.farmhouseId ? parseInt(discountForm.farmhouseId, 10) : null,
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
      await loadDiscounts(user);
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
      loadDiscounts(user);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete discount');
    }
  };

  // ── Compute display data ──────────────────────────────────────────────────

  // PUBLIC view: only active + within date window + valid discount value
  const publicActiveOffers = discounts.filter((d) =>
    d &&
    d.isActive !== false &&
    ((d.discountType === 'FIXED' && Number(d.discountValue) > 0) || Number(d.discountPercent) > 0) &&
    !isOfferExpired(d) &&
    !isOfferNotStarted(d)
  );

  // OWNER/ADMIN management view: all their discounts
  const managedDiscounts = isOwnerOrAdmin ? discounts : [];

  useEffect(() => {
    if (typeof onOffersCount === 'function') {
      onOffersCount(publicActiveOffers.length);
    }
  }, [publicActiveOffers.length, onOffersCount]);

  // Build display cards for public user view
  const displayCards = publicActiveOffers.map((activeDiscount) => {
    const typeKey = activeDiscount.farmhouseType || 'ALL';
    const meta = TYPE_META[typeKey] || TYPE_META.ALL;
    const isFixed = activeDiscount.discountType === 'FIXED';
    const discountLabel = isFixed ? `₹${activeDiscount.discountValue}` : `${activeDiscount.discountPercent}%`;

    return {
      typeKey,
      meta,
      discountLabel,
      isFixed,
      discountPercent: Number(activeDiscount.discountPercent || 0),
      discountValue: Number(activeDiscount.discountValue || 0),
      discountCode: activeDiscount.discountCode || null,
      minBookingAmount: activeDiscount.minBookingAmount || null,
      maxDiscountAmount: activeDiscount.maxDiscountAmount || null,
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

  // If not loading, no active offers, and user is not admin/owner -> hide section
  if (!loading && displayCards.length === 0 && !isOwnerOrAdmin) {
    return null;
  }

  return (
    <section className="discounts-section" id="discounts">
      {/* Decorative background blobs */}
      <div className="ds-blob ds-blob-1" />
      <div className="ds-blob ds-blob-2" />

      {/* Header */}
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
                ➕ Create Discount Offer ({user.role})
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
        <p>Explore exclusive promotional deals and discounts currently active for farmhouse stays.</p>
      </div>

      {/* ── OWNER / ADMIN MANAGEMENT TABLE ── */}
      {isOwnerOrAdmin && managedDiscounts.length > 0 && (
        <div className="ds-manage-panel">
          <h3 className="ds-manage-title">📋 Your Discount Offers</h3>
          <div className="ds-manage-table-wrap">
            <table className="ds-manage-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th>Min Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managedDiscounts.map((d) => {
                  const status = getOfferStatus(d);
                  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
                  const meta = TYPE_META[d.farmhouseType] || TYPE_META.ALL;
                  const isToggling = togglingId === d.id;
                  const isFixed = d.discountType === 'FIXED';
                  return (
                    <tr
                      key={d.id}
                      className={`ds-manage-row${status === 'EXPIRED' ? ' expired-row' : status === 'INACTIVE' ? ' inactive-row' : ''}`}
                    >
                      <td>
                        {d.discountCode ? (
                          <code className="ds-table-code">{d.discountCode}</code>
                        ) : (
                          <span className="ds-null-cell">—</span>
                        )}
                      </td>
                      <td className="ds-col-title">
                        <span className="ds-col-emoji">{meta.emoji}</span>
                        <span>{d.title}</span>
                      </td>
                      <td><span className="ds-type-chip">{meta.label}</span></td>
                      <td>
                        <strong>{isFixed ? `₹${d.discountValue}` : `${d.discountPercent}%`}</strong>
                      </td>
                      <td>{formatDiscountDate(d.validFrom) || <span className="ds-null-cell">Immediate</span>}</td>
                      <td>
                        {formatDiscountDate(d.validTo) || <span className="ds-null-cell">Ongoing</span>}
                        {status === 'EXPIRED' && <span className="ds-expired-tag"> Ended</span>}
                      </td>
                      <td>
                        {d.minBookingAmount ? `₹${d.minBookingAmount}` : <span className="ds-null-cell">None</span>}
                      </td>
                      <td>
                        <span
                          className="ds-status-badge"
                          style={{
                            color: statusCfg.color,
                            background: statusCfg.bg,
                            border: `1px solid ${statusCfg.border}`,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="ds-col-actions">
                        <button
                          type="button"
                          className={`ds-toggle-btn${d.isActive ? ' active' : ' inactive'}`}
                          title={d.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                          onClick={() => handleToggleActive(d)}
                          disabled={isToggling}
                        >
                          {isToggling ? '⏳' : d.isActive ? '⏸ Deactivate' : '▶ Activate'}
                        </button>
                        <button
                          type="button"
                          className="ds-mini-btn edit"
                          title="Edit Discount"
                          onClick={() => openEditModal(d)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="ds-mini-btn delete"
                          title="Delete discount"
                          onClick={() => handleDeleteDiscount(d.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="ds-manage-hint">
            💡 Only <strong>Active</strong> offers within their validity dates are visible to guests.
            Expired or inactive offers are automatically hidden from users.
          </p>
        </div>
      )}

      {/* Label for guest view when admin/owner is logged in */}
      {isOwnerOrAdmin && (
        <h3 className="ds-manage-title" style={{ marginBottom: '1rem', marginTop: '2rem' }}>
          👥 Guest View (Active Offers Only)
        </h3>
      )}

      {/* ── PUBLIC ACTIVE OFFER CARDS ── */}
      {displayCards.length === 0 ? (
        <div className="ds-no-deals">
          <span>🏷️</span>
          <h3>No Active Discount Offers</h3>
          <p>
            {isOwnerOrAdmin
              ? 'No active offers are visible to guests right now. Activate an offer above or create a new one.'
              : 'There are currently no active offers. Check back soon!'}
          </p>
          {isOwnerOrAdmin && (
            <button
              type="button"
              className="ds-create-discount-btn"
              style={{ margin: '0 auto', display: 'inline-flex' }}
              onClick={() => openCreateModal('POOL_PARTY')}
            >
              ➕ Create First Discount
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
              {/* Percentage / Fixed Discount Badge */}
              <div className="ds-badge">
                <span className="ds-badge-percent">{card.discountLabel}</span>
                <span className="ds-badge-off">OFF</span>
              </div>

              {/* Owner/Admin Quick Edit / Delete */}
              {isOwnerOrAdmin && (
                <div className="ds-card-admin-actions">
                  <button
                    type="button"
                    className="ds-mini-btn edit"
                    title="Edit Discount"
                    onClick={() => openEditModal(card.rawDiscount)}
                  >
                    ✏️ Edit
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

              {/* Coupon Code Pill */}
              {card.discountCode && (
                <div className="ds-code-box">
                  <span className="ds-code-label">PROMO CODE:</span>
                  <code className="ds-code-val">{card.discountCode}</code>
                  <button
                    type="button"
                    className={`ds-copy-btn ${copiedCode === card.discountCode ? 'copied' : ''}`}
                    onClick={(e) => handleCopyCode(card.discountCode, e)}
                  >
                    {copiedCode === card.discountCode ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              )}

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

              {card.minBookingAmount && (
                <div className="ds-min-order-tag">
                  💳 Min. booking: ₹{card.minBookingAmount}
                </div>
              )}

              {card.specialOffer && (
                <div className="ds-offer-tag">
                  🎁 {card.specialOffer}
                </div>
              )}

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
                  Explore {card.meta.label} ({card.discountLabel} OFF) →
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
                {editingDiscount ? '✏️ Edit Discount Offer' : '➕ Create Discount Offer'}
              </h3>
              <button type="button" className="ds-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="ds-modal-form">
              {formMsg.text && (
                <div className={`ds-form-alert ${formMsg.type}`}>
                  {formMsg.text}
                </div>
              )}

              {/* Title & Code */}
              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>1. Discount Title *</label>
                  <input
                    type="text"
                    value={discountForm.title}
                    onChange={(e) => setDiscountForm({ ...discountForm, title: e.target.value })}
                    placeholder="e.g. Summer Pool Fiesta"
                    required
                  />
                </div>
                <div className="ds-form-field">
                  <label>2. Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={discountForm.discountCode}
                    onChange={(e) => setDiscountForm({ ...discountForm, discountCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20, POOL500"
                  />
                </div>
              </div>

              {/* Type & Discount Value */}
              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>3. Discount Type *</label>
                  <select
                    value={discountForm.discountType}
                    onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}
                    required
                  >
                    <option value="PERCENTAGE">Percentage (% OFF)</option>
                    <option value="FIXED">Fixed Amount (₹ Flat OFF)</option>
                  </select>
                </div>

                <div className="ds-form-field">
                  <label>
                    {discountForm.discountType === 'FIXED' ? '4. Flat Amount (₹) *' : '4. Discount % *'}
                  </label>
                  {discountForm.discountType === 'FIXED' ? (
                    <input
                      type="number"
                      min="1"
                      value={discountForm.discountValue}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountValue: e.target.value })}
                      placeholder="e.g. 500"
                      required
                    />
                  ) : (
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
                      <span className="ds-percent-symbol">% OFF</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Farmhouse Category & Specific Farmhouse */}
              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>5. Farmhouse Category *</label>
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

                {userFarmhouses.length > 0 && (
                  <div className="ds-form-field">
                    <label>Target Farmhouse (Optional)</label>
                    <select
                      value={discountForm.farmhouseId}
                      onChange={(e) => setDiscountForm({ ...discountForm, farmhouseId: e.target.value })}
                    >
                      <option value="">Apply to all in category</option>
                      {userFarmhouses.map((fh) => (
                        <option key={fh.id} value={fh.id}>
                          🏡 {fh.name} ({fh.location})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Min Order & Max Discount */}
              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>6. Min. Booking Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountForm.minBookingAmount}
                    onChange={(e) => setDiscountForm({ ...discountForm, minBookingAmount: e.target.value })}
                    placeholder="e.g. 3000 (0 for none)"
                  />
                </div>
                <div className="ds-form-field">
                  <label>7. Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountForm.maxDiscountAmount}
                    onChange={(e) => setDiscountForm({ ...discountForm, maxDiscountAmount: e.target.value })}
                    placeholder="e.g. 2000 (0 for none)"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="ds-form-row">
                <div className="ds-form-field">
                  <label>8. Start Date (Valid From)</label>
                  <input
                    type="date"
                    value={discountForm.validFrom || ''}
                    onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                  />
                </div>
                <div className="ds-form-field">
                  <label>9. End Date (Valid To)</label>
                  <input
                    type="date"
                    value={discountForm.validTo || ''}
                    min={discountForm.validFrom || undefined}
                    onChange={(e) => setDiscountForm({ ...discountForm, validTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Active/Inactive toggle inside modal */}
              <div className="ds-form-field ds-active-toggle-field">
                <label>10. Offer Status</label>
                <button
                  type="button"
                  className={`ds-status-toggle-btn${discountForm.isActive ? ' on' : ''}`}
                  onClick={() => setDiscountForm({ ...discountForm, isActive: !discountForm.isActive })}
                >
                  {discountForm.isActive ? '🟢 Active — Visible to guests during valid dates' : '⏸ Inactive — Manually disabled'}
                </button>
              </div>

              <div className="ds-form-field">
                <label>Special Bonus Offer (Optional)</label>
                <input
                  type="text"
                  value={discountForm.specialOffer}
                  onChange={(e) => setDiscountForm({ ...discountForm, specialOffer: e.target.value })}
                  placeholder="e.g. Complimentary BBQ kit & Breakfast"
                />
              </div>

              <div className="ds-modal-actions">
                <button type="button" className="ds-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ds-btn-submit" disabled={formSaving}>
                  {formSaving ? 'Saving...' : editingDiscount ? 'Update Discount' : 'Publish Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
