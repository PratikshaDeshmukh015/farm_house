import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI, farmhouseAPI, paymentAPI, discountAPI } from '../api/axiosInstance';
import './BookingPage.css';
import InteractiveCalendar from '../components/InteractiveCalendar';

// Demo fallback farmhouses
const DEMO_FARMHOUSES = {
  1: { id: 1, name: 'Luxury Mountain Villa', location: 'Himachal Pradesh', pricePerDay: 5000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop' },
  2: { id: 2, name: 'Cozy Countryside Cottage', location: 'Goa', pricePerDay: 3500, maxGuests: 4, bedrooms: 2, bathrooms: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop' },
  3: { id: 3, name: 'Modern Farm Estate', location: 'Punjab', pricePerDay: 6000, maxGuests: 10, bedrooms: 5, bathrooms: 6, available: true, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop' },
  4: { id: 4, name: 'Riverside Farmhouse', location: 'Uttarakhand', pricePerDay: 4500, maxGuests: 8, bedrooms: 4, bathrooms: 5, available: true, imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop' },
  5: { id: 5, name: 'Heritage Farm Resort', location: 'Rajasthan', pricePerDay: 4000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop' },
};

const ADDON_LIST = [
  { key: 'chef',      icon: '👨‍🍳', label: 'Private Chef',       desc: 'Personalised meals all day',  price: 1800, perUnit: 'per guest/night' },
  { key: 'bonfire',   icon: '🪵', label: 'Bonfire Setup',        desc: 'Firewood & pit arrangement',  price: 1500, perUnit: 'flat' },
  { key: 'dj',        icon: '🎵', label: 'DJ Sound System',      desc: 'Pro audio + lights',          price: 4000, perUnit: 'flat' },
  { key: 'adventure', icon: '🛶', label: 'Adventure Tour',       desc: 'Guided trekking / kayaking',  price: 2500, perUnit: 'flat' },
  { key: 'decor',     icon: '🌸', label: 'Floral Decoration',    desc: 'Elegant garden arrangement',  price: 2000, perUnit: 'flat' },
  { key: 'spa',       icon: '💆', label: 'Spa & Wellness',       desc: '2-hour couple spa session',   price: 3500, perUnit: 'flat' },
];

const PAYMENT_METHODS = [
  { key: 'CARD',        icon: '💳', label: 'Credit / Debit Card',   desc: 'Visa, Mastercard, RuPay' },
  { key: 'UPI',         icon: '📱', label: 'UPI',                   desc: 'GPay, PhonePe, Paytm' },
  { key: 'NET_BANKING', icon: '🏦', label: 'Net Banking',           desc: 'All major banks supported' },
  { key: 'WALLET',      icon: '👝', label: 'Wallet',                desc: 'Paytm, Amazon Pay' },
];

const BOOKING_TYPES = [
  { key: 'AM', label: 'AM (Only Day)', hours: '06:00 AM - 06:00 PM' },
  { key: 'PM', label: 'PM (Only Night)', hours: '06:00 PM - 06:00 AM' },
  { key: 'FULL_DAY', label: 'AM + PM (Full Day)', hours: '06:00 AM - 06:00 AM next day' },
];
const normalizeBookingType = (slot) => slot === 'AM' ? 'DAY' : slot === 'PM' ? 'NIGHT' : slot;
const toUiBookingType = (slot) => slot === 'DAY' ? 'AM' : slot === 'NIGHT' ? 'PM' : slot;
const getBookingHours = (slot) => normalizeBookingType(slot) === 'NIGHT'
  ? { checkIn: '06:00 PM', checkOut: '06:00 AM (next day)' }
  : normalizeBookingType(slot) === 'FULL_DAY'
    ? { checkIn: '06:00 AM', checkOut: '06:00 AM (next day)' }
    : { checkIn: '06:00 AM', checkOut: '06:00 PM' };

const STEPS = ['📅 Dates & Guests', '✨ Add-ons', '💳 Payment'];

function BookingPage({ user }) {
  const { farmhouseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [farmhouse, setFarmhouse] = useState(null);
  const [farmhouseBookings, setFarmhouseBookings] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingDone, setBookingDone] = useState(false);

  // Prefill from FarmHouseDetail calculator (if user clicked Book Now there)
  const prefilled = location.state || {};

  const [startDate, setStartDate] = useState(prefilled.prefilledStartDate || '');
  const [endDate, setEndDate]     = useState(prefilled.prefilledEndDate   || '');
  const [timeSlot, setTimeSlot]   = useState(toUiBookingType(prefilled.prefilledTimeSlot) || '');
  const [guestGroupType, setGuestGroupType] = useState(prefilled.prefilledGuestGroupType || 'Couple');
  const [couplesCount, setCouplesCount]     = useState(1);
  const [guests, setGuests]                 = useState(prefilled.prefilledGuests    || 2);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [addons, setAddons] = useState(
    prefilled.prefilledAddons || { chef: false, bonfire: false, dj: false, adventure: false, decor: false, spa: false }
  );
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Discount offers & coupons state
  const [discountsList, setDiscountsList] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(
    prefilled.prefilledDiscount || prefilled.appliedDiscount || null
  );
  const [couponCode, setCouponCode] = useState(
    prefilled.prefilledDiscount?.specialOffer || prefilled.appliedDiscount?.specialOffer || ''
  );
  const [couponMsg, setCouponMsg] = useState(null);

  const maxGuests = Math.max(1, Number(farmhouse?.maxGuests) || 10);
  const maxCouples = Math.max(1, Math.floor(maxGuests / 2));
  const guestPresets = [4, 8, 15, 25, 50, 100, 150, maxGuests]
    .filter((count, index, counts) => count <= maxGuests && counts.indexOf(count) === index);
  const couplePresets = [1, 2, 3, 4, 5, 8, 10, maxCouples]
    .filter((count, index, counts) => count <= maxCouples && counts.indexOf(count) === index);

  useEffect(() => {
    fetchFarmhouseDetails();
    fetchFarmhouseBookings();
    fetchDiscounts();
  }, [farmhouseId]);

  const fetchFarmhouseDetails = async () => {
    try {
      const response = await farmhouseAPI.getFarmHouseById(farmhouseId);
      if (response.data.success) {
        setFarmhouse(response.data.farmhouse);
      } else {
        setFarmhouse(DEMO_FARMHOUSES[parseInt(farmhouseId)] || DEMO_FARMHOUSES[1]);
      }
    } catch {
      setFarmhouse(DEMO_FARMHOUSES[parseInt(farmhouseId)] || DEMO_FARMHOUSES[1]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmhouseBookings = async () => {
    try {
      const response = await bookingAPI.getFarmHouseBookings(farmhouseId);
      setFarmhouseBookings(response.data.bookings || []);
    } catch {
      setFarmhouseBookings([]);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await discountAPI.getActiveDiscounts();
      if (response.data && response.data.success && Array.isArray(response.data.discounts)) {
        setDiscountsList(response.data.discounts);
        // If not already selected, auto-select a discount that directly applies to this farmhouse or ALL
        if (!prefilled.prefilledDiscount && !prefilled.appliedDiscount) {
          const match = response.data.discounts.find(
            d => d && d.isActive !== false && Number(d.discountPercent) > 0 &&
            (String(d.farmhouseId) === String(farmhouseId) || d.farmhouseType === 'ALL')
          );
          if (match) {
            setAppliedDiscount(match);
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch discounts:', e);
    }
  };

  // Available curated offers (live from backend or verified seasonal defaults)
  const activeOffers = discountsList.filter(
    d => d && d.isActive !== false && Number(d.discountPercent) > 0 &&
         (!d.farmhouseId || String(d.farmhouseId) === String(farmhouseId))
  );

  const manifestPromoCode = `EST-${guestGroupType === 'Couple' ? `CPL-${couplesCount}X${guests}` : `${guestGroupType.toUpperCase()}-${guests}`}`;

  const manifestOffer = {
    id: 'demo-manifest',
    title: 'Official Reservation Manifest Offer',
    specialOffer: manifestPromoCode,
    discountPercent: 20,
    description: 'Exclusive 20% savings for verified guest manifest reservation',
  };

  const defaultOffers = [
    manifestOffer,
    {
      id: 'demo-estate20',
      title: 'Luxury Estate Special',
      specialOffer: 'ESTATE20',
      discountPercent: 20,
      description: '20% off whole estate buyout and multi-day vacations',
    },
    {
      id: 'demo-welcome10',
      title: 'Welcome First Stay Offer',
      specialOffer: 'WELCOME10',
      discountPercent: 10,
      description: '10% instant savings on your first farmhouse booking',
    },
    {
      id: 'demo-pool15',
      title: 'Pool & Weekend Celebration',
      specialOffer: 'WEEKEND15',
      discountPercent: 15,
      description: '15% savings on weekend & pool party bookings',
    }
  ];

  // Merge offers: if backend has an offer with the same discountPercent as the manifest,
  // combine them into one card so users see a single unified offer instead of duplicates.
  const buildMergedOffers = () => {
    if (activeOffers.length === 0) return defaultOffers;

    const merged = [];
    const usedIds = new Set();

    activeOffers.forEach(backendOffer => {
      const samePercent = Number(backendOffer.discountPercent) === Number(manifestOffer.discountPercent);
      if (samePercent && !usedIds.has('manifest-merged')) {
        // Combine the manifest offer with this backend offer into one card
        usedIds.add('manifest-merged');
        merged.push({
          id: 'manifest-merged',
          title: backendOffer.title || manifestOffer.title,
          // Show both codes so either one can be typed
          specialOffer: manifestPromoCode,
          altCode: backendOffer.specialOffer || null,
          discountPercent: Number(backendOffer.discountPercent),
          description: backendOffer.description || manifestOffer.description,
          // Keep original backend offer reference for applying
          _backendOffer: backendOffer,
        });
      } else {
        merged.push(backendOffer);
      }
    });

    // If no backend offer matched the manifest percent, prepend manifest separately
    if (!usedIds.has('manifest-merged')) {
      merged.unshift(manifestOffer);
    }

    return merged;
  };

  const availableOffers = buildMergedOffers();

  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateBooked = (date, slot = timeSlot) => {
    const dateKey = toDateKey(date);
    return farmhouseBookings.some(booking =>
      booking.status !== 'CANCELLED' &&
      (booking.startDate === booking.endDate
        ? dateKey === booking.startDate
        : dateKey >= booking.startDate && dateKey < booking.endDate) &&
      (!booking.timeSlot || normalizeBookingType(booking.timeSlot) === 'FULL_DAY' || normalizeBookingType(slot) === 'FULL_DAY' || normalizeBookingType(booking.timeSlot) === normalizeBookingType(slot))
    );
  };

  const calendarDays = (() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
    ];
  })();

  const selectCalendarDate = (date, slot) => {
    if (isDateBooked(date, slot) || toDateKey(date) < today) return;
    setTimeSlot(slot);
    const selectedDate = toDateKey(date);
    setStartDate(selectedDate);
    setEndDate(selectedDate);
  };

  // ── Financial Calculations (Discounts, Add-ons, Taxes) ──
  const nights = (() => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
    return diff >= 0 ? Math.max(1, diff) : 0;
  })();

  const baseCost   = (farmhouse?.pricePerDay || 0) * nights;
  const chefCost   = addons.chef ? 1800 * guests * Math.max(nights, 1) : 0;
  const flatCost   =
    (addons.bonfire   ? 1500 : 0) +
    (addons.dj        ? 4000 : 0) +
    (addons.adventure ? 2500 : 0) +
    (addons.decor     ? 2000 : 0) +
    (addons.spa       ? 3500 : 0);

  // Raw stay subtotal
  const rawSubtotal = baseCost + chefCost + flatCost;

  // Correct Discount calculation based on applied offer percentage
  const discountPercent = appliedDiscount ? Number(appliedDiscount.discountPercent || 0) : 0;
  const discountAmount = (nights > 0 && discountPercent > 0)
    ? Math.round((baseCost * discountPercent) / 100)
    : 0;

  // Net taxable subtotal after applying discount
  const subtotal   = Math.max(0, rawSubtotal - discountAmount);
  const gst        = Math.round(subtotal * 0.18);
  const serviceFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst + serviceFee;

  // Total savings compared to undiscounted rate
  const originalTotal = rawSubtotal + Math.round(rawSubtotal * 0.18) + Math.round(rawSubtotal * 0.05);
  const totalSavings  = Math.max(0, originalTotal - grandTotal);

  // ── Discount & Coupon Actions ──────────────────
  const handleApplyOffer = (offer) => {
    setAppliedDiscount(offer);
    const savingEst = nights > 0 ? Math.round((baseCost * Number(offer.discountPercent)) / 100) : 0;
    setCouponMsg({
      type: 'success',
      text: `🎉 ${offer.discountPercent}% Discount applied (${offer.title || offer.specialOffer || 'Offer'})!${savingEst > 0 ? ` Save ₹${savingEst.toLocaleString()} on stay` : ''}`
    });
  };

  const handleRemoveOffer = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    setCouponMsg({ type: 'info', text: 'Discount offer removed.' });
  };

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    if (!couponCode.trim()) {
      setCouponMsg({ type: 'error', text: 'Please enter a coupon or promo code.' });
      return;
    }
    const cleanRaw = couponCode.trim();
    const code = cleanRaw.toUpperCase().replace(/\s+/g, ' ');

    // Normalize check for manifest codes (e.g. EST-CPL-2X4, REF: EST-CPL-2X4, OFFICIAL RESERVATION MANIFEST ...)
    const strippedCode = code
      .replace(/^REF:\s*/i, '')
      .replace(/OFFICIAL RESERVATION MANIFEST\s*/i, '')
      .trim();
    const currentCode = manifestPromoCode.toUpperCase();

    const isManifestMatch =
      code === 'EST-CPL-2X4' ||
      code === currentCode ||
      strippedCode === 'EST-CPL-2X4' ||
      strippedCode === currentCode ||
      code.includes('EST-CPL') ||
      code.includes('OFFICIAL RESERVATION MANIFEST') ||
      (code.startsWith('EST-') && (code.includes('CPL') || code.includes('FRIENDS') || code.includes('FAMILY')));

    const match = availableOffers.find(
      o => (o.specialOffer && o.specialOffer.toUpperCase() === code) ||
           (o.specialOffer && strippedCode && o.specialOffer.toUpperCase() === strippedCode) ||
           (o.title && o.title.toUpperCase().includes(code))
    );

    if (match) {
      handleApplyOffer(match);
    } else if (isManifestMatch) {
      handleApplyOffer({
        id: 'manifest-applied',
        title: 'Official Reservation Manifest 20% OFF',
        specialOffer: strippedCode || (code.includes('EST-') ? code : manifestPromoCode),
        discountPercent: 20,
        description: 'Verified Official Reservation Manifest promo discount applied'
      });
    } else if (code === 'WELCOME10' || code === 'SAVE10') {
      handleApplyOffer({ title: 'Welcome 10% OFF', specialOffer: code, discountPercent: 10 });
    } else if (code === 'ESTATE20' || code === 'FARM20' || code === 'SAVE20') {
      handleApplyOffer({ title: 'Special 20% OFF', specialOffer: code, discountPercent: 20 });
    } else if (code === 'WEEKEND15' || code === 'SAVE15') {
      handleApplyOffer({ title: 'Weekend 15% OFF', specialOffer: code, discountPercent: 15 });
    } else if (code === 'SUPER30' || code === 'FARM30') {
      handleApplyOffer({ title: 'Mega 30% OFF', specialOffer: code, discountPercent: 30 });
    } else {
      setCouponMsg({ type: 'error', text: `Invalid promo code "${couponCode}". Try ${manifestPromoCode}, ESTATE20, WELCOME10, or WEEKEND15.` });
    }
  };

  // ── Step Validation ───────────────────────────
  const step0Valid = startDate && endDate && nights > 0 && guests >= 1 && guests <= maxGuests;

  const handleNext = () => {
    if (currentStep === 0 && (!step0Valid || !timeSlot)) {
      setError(!timeSlot ? 'Please select a time slot: AM or PM.' : 'Please select valid check-in and check-out dates.');
      return;
    }
    setError('');
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(s => s - 1);
  };

  const toggleAddon = (key) => setAddons(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Submit ────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setBookingLoading(true);
    try {
      const availability = await bookingAPI.checkAvailability(farmhouseId, startDate, endDate, timeSlot);
      if (!availability.data.available) {
        setError('This farmhouse is not available for the selected dates. Please try different dates.');
        setBookingLoading(false);
        return;
      }

      const addonsText = Object.entries(addons)
        .filter(([, v]) => v)
        .map(([k]) => ADDON_LIST.find(a => a.key === k)?.label)
        .filter(Boolean)
        .join(', ');

      let stayTypeDetail = guestGroupType;
      if (guestGroupType === 'Couple') {
        stayTypeDetail = `${couplesCount} Couple${couplesCount > 1 ? 's' : ''} (${guests} Guests)`;
      } else if (guestGroupType === 'Friends') {
        stayTypeDetail = `Friends (${guests} Members)`;
      } else if (guestGroupType === 'Family') {
        stayTypeDetail = `Family (${guests} Members)`;
      }

      const bookingReq = {
        farmHouseId: parseInt(farmhouseId),
        startDate,
        endDate,
        timeSlot,
        numberOfGuests: parseInt(guests),
        totalPrice: grandTotal, // Pass accurate discounted grand total!
        specialRequirements: [
          stayTypeDetail ? `Stay Type: ${stayTypeDetail}` : '',
          appliedDiscount ? `Discount Offer: ${appliedDiscount.title || `${discountPercent}% OFF`} (Saved ₹${totalSavings.toLocaleString()})` : '',
          specialRequirements,
          addonsText ? `Add-ons: ${addonsText}` : ''
        ].filter(Boolean).join(' | '),
      };

      const bookingRes = await bookingAPI.createBooking(bookingReq, user.id);
      if (bookingRes.data.success) {
        const bookingId = bookingRes.data.booking.id;
        const paymentRes = await paymentAPI.createPayment({ bookingId, paymentMethod });
        if (paymentRes.data.success) {
          await paymentAPI.processPayment(paymentRes.data.payment.id);
          setBookingDone(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────
  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const today = new Date().toISOString().split('T')[0];

  // ── Loading ───────────────────────────────────
  if (loading) {
    return (
      <div className="bk-loader">
        <div className="bk-spinner" />
        <p>Loading farmhouse details…</p>
      </div>
    );
  }

  if (!farmhouse) {
    return (
      <div className="bk-error-screen">
        <span>🏚️</span>
        <h2>Farmhouse not found</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  // ── Success Screen ────────────────────────────
  if (bookingDone) {
    return (
      <div className="bk-success-screen">
        <div className="bk-success-card">
          <div className="bk-success-icon">🎉</div>
          <h2>Booking Confirmed!</h2>
          <p>Your stay at <strong>{farmhouse.name}</strong> is all set.<br />Check your email for confirmation details.</p>
          <div className="bk-success-details">
            <div className="bk-succ-row"><span>📅 Check-in</span><strong>{fmt(startDate)}<small>{getBookingHours(timeSlot).checkIn}</small></strong></div>
            <div className="bk-succ-row"><span>📅 Check-out</span><strong>{fmt(endDate)}<small>{getBookingHours(timeSlot).checkOut}</small></strong></div>
            <div className="bk-succ-row"><span>🕒 Booking type</span><strong>{BOOKING_TYPES.find(type => type.key === toUiBookingType(normalizeBookingType(timeSlot)))?.label || '—'}</strong></div>
            <div className="bk-succ-row"><span>🌙 Nights</span><strong>{nights}</strong></div>
            <div className="bk-succ-row"><span>👥 Guests</span><strong>{guests} {guestGroupType ? `(${guestGroupType})` : ''}</strong></div>
            <div className="bk-succ-divider"/>
            <div className="bk-succ-row bk-succ-total"><span>💰 Total Paid</span><strong>₹{grandTotal.toLocaleString()}</strong></div>
            {appliedDiscount && totalSavings > 0 && (
              <div className="bk-succ-row" style={{ color: '#15803d', fontWeight: 700 }}>
                <span>🏷️ Offer Savings</span>
                <strong>-₹{totalSavings.toLocaleString()} ({discountPercent}% OFF applied)</strong>
              </div>
            )}
          </div>
          <div className="bk-success-btns">
            <button className="bk-btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
            <button className="bk-btn-outline" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────
  return (
    <div className="bk-page">

      {/* Hero */}
      <div className="bk-hero" style={{ backgroundImage: `url(${farmhouse.imageUrl || ''})` }}>
        <div className="bk-hero-overlay" />
        <div className="bk-hero-content">
          <button className="bk-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>Book Your Stay</h1>
          <p className="bk-hero-name">{farmhouse.name}</p>
          <p className="bk-hero-loc">📍 {farmhouse.location}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bk-steps-bar">
        {STEPS.map((label, i) => (
          <div key={i} className={`bk-step ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}>
            <div className="bk-step-circle">
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className="bk-step-label">{label}</span>
            {i < STEPS.length - 1 && <div className={`bk-step-line ${i < currentStep ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className={`bk-layout ${currentStep === 0 ? 'bk-layout--full' : ''}`}>

        {/* ── LEFT: Form ── */}
        <div className="bk-form-col">

          {error && (
            <div className="bk-error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* STEP 0 — Dates & Guests */}
          {currentStep === 0 && (
            <div className="bk-step0-grid">

              {/* ── LEFT COLUMN: Date / Time / Calendar ── */}
              <div className="bk-panel bk-step0-left">
                <div className="bk-panel-header">
                  <span className="bk-panel-icon">📅</span>
                  <div>
                    <h2>When are you going?</h2>
                    <p>Choose a date and book the farmhouse for the day, night, or both</p>
                  </div>
                </div>

                <div className="bk-booking-types" role="group" aria-label="Booking type">
                  {BOOKING_TYPES.map(type => (
                    <button
                      type="button"
                      key={type.key}
                      className={`bk-booking-type ${toUiBookingType(normalizeBookingType(timeSlot)) === type.key ? 'selected' : ''}`}
                      onClick={() => setTimeSlot(type.key)}
                    >
                      <strong>{type.label}</strong>
                      <span>{type.hours}</span>
                    </button>
                  ))}
                </div>

                <div className="bk-date-row">
                  <div className="bk-field">
                    <label>Check-in Date</label>
                    <div className="bk-date-input-wrap">
                      <span className="bk-field-icon">🛬</span>
                      <input
                        type="date"
                        value={startDate}
                        min={today}
                        onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(''); }}
                      />
                    </div>
                  </div>
                  <div className="bk-field">
                    <label>Check-out Date</label>
                    <div className="bk-date-input-wrap">
                      <span className="bk-field-icon">🛫</span>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || today}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bk-field bk-special-request-field">
                  <label>Special Requests <span className="bk-label-sub">(Optional)</span></label>
                  <textarea
                    value={specialRequirements}
                    onChange={e => setSpecialRequirements(e.target.value)}
                    placeholder="Early check-in, dietary preferences, baby cot, anniversary decoration…"
                    rows={3}
                  />
                </div>

                <InteractiveCalendar
                  startDate={startDate}
                  endDate={endDate}
                  timeSlot={timeSlot}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setTimeSlot={setTimeSlot}
                  today={today}
                />

                {nights > 0 && (
                  <div className="bk-nights-chip">
                    🌙 <strong>{nights} night{nights > 1 ? 's' : ''}</strong> — {fmt(startDate)} to {fmt(endDate)}
                  </div>
                )}

                <button className="bk-btn-next bk-btn-next--full" onClick={handleNext} disabled={!step0Valid}>
                  Continue to Add-ons →
                </button>
              </div>

              {/* ── RIGHT COLUMN: Estate Accommodation & Manifest ── */}
              <div className="bk-panel bk-step0-right">
                {/* Formal Farmhouse Stay Type & Guest Allocation Section */}
                <div className="bk-field bk-guest-field bk-formal-estate-card">
                  <div className="bk-formal-section-header">
                    <div className="bk-formal-title-group">
                      <span className="bk-formal-badge">ESTATE ACCOMMODATIONS</span>
                      <h3 className="bk-formal-title">Select Stay Category &amp; Guest Manifest</h3>
                      <p className="bk-formal-subtitle">Choose your preferred estate accommodation profile and configure room allocations</p>
                    </div>
                  </div>

                  <div className="bk-formal-group-options">
                    {[
                      { 
                        key: 'Couple', 
                        label: 'Couples & Duo Retreat', 
                        icon: '🗝️', 
                        tag: 'Private Suites',
                        desc: 'Dedicated En-Suite Master Bedrooms • 2 Guests per Suite' 
                      },
                      { 
                        key: 'Friends', 
                        label: 'Private Group & Friends', 
                        icon: '🌿', 
                        tag: 'Estate Buyout',
                        desc: `Up to ${maxGuests} Guests • Social Gathering & Lawn Access` 
                      },
                      { 
                        key: 'Family', 
                        label: 'Family & Heritage Stay', 
                        icon: '🏛️', 
                        tag: 'Multi-Gen Villa',
                        desc: `Up to ${maxGuests} Members • Children & Elderly Friendly` 
                      },
                    ].map((type) => (
                      <label
                        key={type.key}
                        className={`bk-formal-pill ${guestGroupType === type.key ? 'active' : ''}`}
                        onClick={() => {
                          setGuestGroupType(type.key);
                          if (type.key === 'Couple') {
                            setCouplesCount(1);
                            setGuests(2);
                          } else {
                            setGuests(Math.min(Math.max(guests, 1), maxGuests));
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="guestGroupType"
                          value={type.key}
                          checked={guestGroupType === type.key}
                          onChange={() => {
                            setGuestGroupType(type.key);
                            if (type.key === 'Couple') {
                              setCouplesCount(1);
                              setGuests(2);
                            } else {
                              setGuests(Math.min(Math.max(guests, 1), maxGuests));
                            }
                          }}
                          className="bk-group-type-radio"
                        />
                        <div className="bk-formal-pill-top">
                          <span className="bk-formal-pill-icon">{type.icon}</span>
                          <span className="bk-formal-pill-tag">{type.tag}</span>
                        </div>
                        <div className="bk-formal-pill-body">
                          <strong className="bk-formal-pill-label">{type.label}</strong>
                          <span className="bk-formal-pill-desc">{type.desc}</span>
                        </div>
                        <div className="bk-formal-pill-check">
                          {guestGroupType === type.key ? '✓ Selected' : 'Select'}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* FORMAL CONFIGURATION: COUPLES RETREAT */}
                  {guestGroupType === 'Couple' && (
                    <div className="bk-formal-config-box">
                      <div className="bk-formal-config-head">
                        <div>
                          <span className="bk-formal-subhead-badge">SUITE ARCHITECTURE</span>
                          <h4 className="bk-formal-subhead-title">Couples &amp; Master Suite Allocation</h4>
                          <p className="bk-formal-subhead-note">Each couple is allocated 1 Private En-Suite Bedroom (2 Adult Guests per Suite)</p>
                        </div>
                        <div className="bk-formal-occupancy-badge">
                          <span className="bk-fob-number">{couplesCount}</span>
                          <span className="bk-fob-text">
                            {couplesCount === 1 ? 'Suite / Couple' : 'Suites / Couples'}
                            <small>({guests} Guests Total)</small>
                          </span>
                        </div>
                      </div>

                      {/* Stepper + Direct Entry */}
                      <div className="bk-formal-stepper-container">
                        <div className="bk-formal-stepper-left">
                          <span className="bk-formal-stepper-lbl">Number of Couples:</span>
                          <div className="bk-formal-stepper-controls">
                            <button
                              type="button"
                              className="bk-formal-step-btn"
                              disabled={couplesCount <= 1}
                              onClick={() => {
                                const val = Math.max(1, couplesCount - 1);
                                setCouplesCount(val);
                                setGuests(val * 2);
                              }}
                              title="Decrease couples"
                            >−</button>

                            <div className="bk-formal-stepper-input-wrap">
                              <input
                                type="number"
                                min="1"
                                max={maxCouples}
                                value={couplesCount}
                                onChange={(e) => {
                                  const val = Math.min(maxCouples, Math.max(1, parseInt(e.target.value, 10) || 1));
                                  setCouplesCount(val);
                                  setGuests(val * 2);
                                }}
                                className="bk-formal-number-input"
                              />
                              <span className="bk-formal-unit-suffix">Couple{couplesCount > 1 ? 's' : ''}</span>
                            </div>

                            <button
                              type="button"
                              className="bk-formal-step-btn"
                              disabled={couplesCount >= maxCouples}
                              onClick={() => {
                                const val = Math.min(maxCouples, couplesCount + 1);
                                setCouplesCount(val);
                                setGuests(val * 2);
                              }}
                              title="Increase couples"
                            >+</button>
                          </div>
                        </div>

                        <div className="bk-formal-suite-breakdown-card">
                          <div className="bk-fsb-row">
                            <span className="bk-fsb-label">Allocated Bedrooms:</span>
                            <strong className="bk-fsb-val">{couplesCount} King En-Suite{couplesCount > 1 ? 's' : ''}</strong>
                          </div>
                          <div className="bk-fsb-row">
                            <span className="bk-fsb-label">Total Registered Guests:</span>
                            <strong className="bk-fsb-val">{guests} Adults (2 per room)</strong>
                          </div>
                          <div className="bk-fsb-row">
                            <span className="bk-fsb-label">Estate Privacy Status:</span>
                            <strong className="bk-fsb-val text-success">100% Exclusive Buyout</strong>
                          </div>
                        </div>
                      </div>

                      {/* Formal Quick Selection Tiers */}
                      <div className="bk-formal-tiers-block">
                        <span className="bk-formal-tiers-lbl">Quick Select Standard Allocations:</span>
                        <div className="bk-formal-tiers-list">
                          {couplePresets.map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`bk-formal-tier-btn ${couplesCount === num ? 'selected' : ''}`}
                              onClick={() => {
                                setCouplesCount(num);
                                setGuests(num * 2);
                              }}
                            >
                              <span className="bk-ft-num">{num} {num === 1 ? 'Couple' : 'Couples'}</span>
                              <span className="bk-ft-sub">{num} Suite{num > 1 ? 's' : ''} • {num * 2} Guests</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Estate Privileges Grid */}
                      <div className="bk-formal-privileges-grid">
                        <div className="bk-fp-item">
                          <span className="bk-fp-icon">🥂</span>
                          <div>
                            <strong>Private Check-in &amp; Host</strong>
                            <span>Direct concierge greeting on arrival</span>
                          </div>
                        </div>
                        <div className="bk-fp-item">
                          <span className="bk-fp-icon">🏊</span>
                          <div>
                            <strong>Exclusive Pool &amp; Lawn</strong>
                            <span>No shared access with outside guests</span>
                          </div>
                        </div>
                        <div className="bk-fp-item">
                          <span className="bk-fp-icon">☕</span>
                          <div>
                            <strong>Farmhouse Breakfast</strong>
                            <span>Fresh estate kitchen morning menu</span>
                          </div>
                        </div>
                      </div>

                      {/* Official Reservation Manifest Summary */}
                      <div className="bk-formal-manifest-box">
                        <div className="bk-fmb-header">
                          <span className="bk-fmb-tag">OFFICIAL RESERVATION MANIFEST</span>
                          <div className="bk-fmb-action-group">
                            <span className="bk-fmb-id">REF: EST-CPL-{couplesCount}X{guests}</span>
                            <button
                              type="button"
                              className="bk-fmb-apply-btn"
                              onClick={() => {
                                const code = `EST-CPL-${couplesCount}X${guests}`;
                                setCouponCode(code);
                                handleApplyOffer({
                                  id: 'manifest-applied',
                                  title: 'Official Reservation Manifest 20% OFF',
                                  specialOffer: code,
                                  discountPercent: 20,
                                  description: 'Verified Official Reservation Manifest promo discount applied'
                                });
                              }}
                              title="Click to apply this manifest code as 20% OFF promo code"
                            >
                              Apply 20% Promo
                            </button>
                          </div>
                        </div>
                        <div className="bk-fmb-grid">
                          <div className="bk-fmb-cell">
                            <span className="bk-fmb-lbl">Stay Profile</span>
                            <strong>Couples Luxury Sanctuary</strong>
                          </div>
                          <div className="bk-fmb-cell">
                            <span className="bk-fmb-lbl">Total Couples</span>
                            <strong>{couplesCount} {couplesCount === 1 ? 'Couple' : 'Couples'}</strong>
                          </div>
                          <div className="bk-fmb-cell">
                            <span className="bk-fmb-lbl">Total Guest Count</span>
                            <strong>{guests} Registered Adults</strong>
                          </div>
                          <div className="bk-fmb-cell">
                            <span className="bk-fmb-lbl">Accommodations</span>
                            <strong>{couplesCount} Private Master Suite{couplesCount > 1 ? 's' : ''}</strong>
                          </div>
                        </div>
                        <div className="bk-fmb-footer">
                          <span>🛡️ Verified Estate Standard: Guaranteed private premises, sanitized luxury linens, and dedicated caretaker.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORMAL CONFIGURATION: FRIENDS & GROUP STAY */}
                  {guestGroupType === 'Friends' && (
                    <div className="bk-formal-config-box">
                      <div className="bk-formal-config-head">
                        <div>
                          <span className="bk-formal-subhead-badge">GROUP OCCUPANCY</span>
                          <h4 className="bk-formal-subhead-title">Private Group &amp; Friends Allocation</h4>
                          <p className="bk-formal-subhead-note">Full farmhouse grounds reservation for get-togethers and private events</p>
                        </div>
                        <div className="bk-formal-occupancy-badge">
                          <span className="bk-fob-number">{guests}</span>
                          <span className="bk-fob-text">
                            Guests Total
                            <small>Estate Capacity: {maxGuests}</small>
                          </span>
                        </div>
                      </div>

                      <div className="bk-formal-stepper-container">
                        <div className="bk-formal-stepper-left">
                          <span className="bk-formal-stepper-lbl">Total Group Members:</span>
                          <div className="bk-formal-stepper-controls">
                            <button
                              type="button"
                              className="bk-formal-step-btn"
                              disabled={guests <= 1}
                              onClick={() => setGuests(Math.max(1, guests - 1))}
                            >−</button>
                            <div className="bk-formal-stepper-input-wrap">
                              <input
                                type="number"
                                min="1"
                                max={maxGuests}
                                value={guests}
                                onChange={(e) => {
                                  const val = Math.min(maxGuests, Math.max(1, parseInt(e.target.value, 10) || 1));
                                  setGuests(val);
                                }}
                                className="bk-formal-number-input"
                              />
                              <span className="bk-formal-unit-suffix">Guests</span>
                            </div>
                            <button
                              type="button"
                              className="bk-formal-step-btn"
                              disabled={guests >= maxGuests}
                              onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                            >+</button>
                          </div>
                        </div>

                        <div className="bk-formal-tiers-list">
                          {guestPresets.map((count) => (
                            <button
                              key={count}
                              type="button"
                              className={`bk-formal-tier-btn ${guests === count ? 'selected' : ''}`}
                              onClick={() => setGuests(count)}
                            >
                              <span className="bk-ft-num">{count} Guests</span>
                              <span className="bk-ft-sub">{count >= 50 ? 'Event / Large Gathering' : 'Standard Group'}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {guests >= 50 && (
                        <div className="bk-formal-event-notice">
                          🏛️ <strong>Grand Estate Event Booking:</strong> {guests} guests registered. Access to central party lawn, ambient outdoor lighting, and event housekeeping protocol.
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORMAL CONFIGURATION: FAMILY HERITAGE STAY */}
                  {guestGroupType === 'Family' && (
                    <div className="bk-formal-config-box">
                      <div className="bk-formal-config-head">
                        <div>
                          <span className="bk-formal-subhead-badge">FAMILY RESIDENCE</span>
                          <h4 className="bk-formal-subhead-title">Family &amp; Multi-Generation Accommodation</h4>
                          <p className="bk-formal-subhead-note">Peaceful family stay with full private kitchen, spacious lawn, and child-safe amenities</p>
                        </div>
                        <div className="bk-formal-occupancy-badge">
                          <span className="bk-fob-number">{guests}</span>
                          <span className="bk-fob-text">
                            Family Members
                            <small>Estate Capacity: {maxGuests}</small>
                          </span>
                        </div>
                      </div>

                      <div className="bk-formal-stepper-container">
                        <div className="bk-formal-stepper-left">
                          <span className="bk-formal-stepper-lbl">Total Family Members:</span>
                          <div className="bk-formal-stepper-controls">
                            <button
                              type="button"
                              className="bk-formal-step-btn"
                              disabled={guests <= 1}
                              onClick={() => setGuests(Math.max(1, guests - 1))}
                            >−</button>
                            <div className="bk-formal-stepper-input-wrap">
                              <input
                                type="number"
                                min="1"
                                max={maxGuests}
                                value={guests}
                                onChange={(e) => {
                                  const val = Math.min(maxGuests, Math.max(1, parseInt(e.target.value, 10) || 1));
                                  setGuests(val);
                                }}
                                className="bk-formal-number-input"
                              />
                              <span className="bk-formal-unit-suffix">Members</span>
                            </div>
                            <button
                              type="button"
                              className="bk-formal-step-btn"
                              disabled={guests >= maxGuests}
                              onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                            >+</button>
                          </div>
                        </div>

                        <div className="bk-formal-tiers-list">
                          {guestPresets.map((count) => (
                            <button
                              key={count}
                              type="button"
                              className={`bk-formal-tier-btn ${guests === count ? 'selected' : ''}`}
                              onClick={() => setGuests(count)}
                            >
                              <span className="bk-ft-num">{count} Members</span>
                              <span className="bk-ft-sub">{count >= 20 ? 'Family Reunion' : 'Family Vacation'}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {guests >= 50 && (
                        <div className="bk-formal-event-notice">
                          🏰 <strong>Grand Family Reunion:</strong> {guests} family members selected. Ideal for milestone anniversaries, birthday celebrations, and multi-family weekend stays.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* STEP 1 — Add-ons */}
          {currentStep === 1 && (
            <div className="bk-panel">
              <div className="bk-panel-header">
                <span className="bk-panel-icon">✨</span>
                <div>
                  <h2>Enhance Your Stay</h2>
                  <p>Select premium add-ons to make your visit unforgettable</p>
                </div>
              </div>

              <div className="bk-addons-grid">
                {ADDON_LIST.map(addon => (
                  <div
                    key={addon.key}
                    className={`bk-addon-card ${addons[addon.key] ? 'selected' : ''}`}
                    onClick={() => toggleAddon(addon.key)}
                  >
                    <div className="bk-addon-check">{addons[addon.key] ? '✓' : ''}</div>
                    <div className="bk-addon-icon">{addon.icon}</div>
                    <div className="bk-addon-info">
                      <strong>{addon.label}</strong>
                      <span>{addon.desc}</span>
                    </div>
                    <div className="bk-addon-price">
                      ₹{addon.price.toLocaleString()}
                      <small>{addon.perUnit}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* DISCOUNT OFFERS & PROMO SECTION */}
              <div className="bk-discount-offers-card">
                <div className="bk-doc-header">
                  <div className="bk-doc-title-group">
                    <span className="bk-doc-badge">🏷️ SPECIAL OFFERS & COUPONS</span>
                    <h3 className="bk-doc-title">Apply Discount Offer</h3>
                    <p className="bk-doc-sub">Choose a verified offer or enter your promo code to calculate your instant discount</p>
                  </div>
                  {appliedDiscount && (
                    <button type="button" className="bk-remove-discount-btn" onClick={handleRemoveOffer}>
                      ✕ Remove Offer ({discountPercent}% OFF)
                    </button>
                  )}
                </div>

                {couponMsg && (
                  <div className={`bk-coupon-alert ${couponMsg.type}`}>
                    <span>{couponMsg.text}</span>
                    {appliedDiscount && totalSavings > 0 && (
                      <strong>You save ₹{totalSavings.toLocaleString()}!</strong>
                    )}
                  </div>
                )}

                {/* Promo Code Input Form */}
                <form className="bk-coupon-input-form" onSubmit={handleApplyCoupon}>
                  <div className="bk-coupon-input-wrap">
                    <span className="bk-coupon-icon">🎟️</span>
                    <input
                      type="text"
                      placeholder={`Enter promo code (e.g. ${manifestPromoCode}, ESTATE20, WELCOME10)`}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bk-coupon-input"
                    />
                  </div>
                  <button type="submit" className="bk-coupon-apply-btn">
                    Apply Code
                  </button>
                </form>

                {/* Available Offers Grid */}
                <div className="bk-available-offers-grid">
                  {availableOffers.map(offer => {
                    const isMerged = offer.id === 'manifest-merged';
                    const isSelected = appliedDiscount && (
                      appliedDiscount.id === offer.id ||
                      (appliedDiscount.specialOffer && offer.specialOffer && appliedDiscount.specialOffer === offer.specialOffer) ||
                      (offer.altCode && appliedDiscount.specialOffer === offer.altCode) ||
                      (appliedDiscount.title === offer.title)
                    );
                    return (
                      <div
                        key={offer.id || offer.specialOffer || offer.title}
                        className={`bk-offer-chip-card ${isSelected ? 'selected' : ''} ${isMerged ? 'bk-offer-merged' : ''}`}
                        onClick={() => isSelected ? handleRemoveOffer() : handleApplyOffer(offer)}
                      >
                        <div className="bk-occ-top">
                          <span className="bk-occ-percent">{offer.discountPercent}% OFF</span>
                          <div className="bk-occ-codes">
                            {offer.specialOffer && <span className="bk-occ-code">{offer.specialOffer}</span>}
                            {isMerged && offer.altCode && (
                              <span className="bk-occ-code bk-occ-code-alt" title={`Also valid: ${offer.altCode}`}>{offer.altCode}</span>
                            )}
                          </div>
                        </div>
                        <h4 className="bk-occ-title">{offer.title}</h4>
                        {offer.description && <p className="bk-occ-desc">{offer.description}</p>}
                        {isMerged && offer._backendOffer?.description && offer._backendOffer.description !== offer.description && (
                          <p className="bk-occ-desc bk-occ-desc-alt">Also includes: {offer._backendOffer.description}</p>
                        )}
                        <div className="bk-occ-footer">
                          {isSelected ? (
                            <span className="bk-occ-status applied">✓ Applied ({offer.discountPercent}% OFF)</span>
                          ) : (
                            <span className="bk-occ-status apply">Apply Offer →</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bk-btn-row">
                <button className="bk-btn-back" onClick={handleBack}>← Back</button>
                <button className="bk-btn-next" onClick={handleNext}>Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* STEP 2 — Payment */}
          {currentStep === 2 && (
            <div className="bk-panel">
              <div className="bk-panel-header">
                <span className="bk-panel-icon">💳</span>
                <div>
                  <h2>Select Payment Method</h2>
                  <p>Your payment is secured with 256-bit SSL encryption 🔒</p>
                </div>
              </div>

              <div className="bk-payment-grid">
                {PAYMENT_METHODS.map(pm => (
                  <div
                    key={pm.key}
                    className={`bk-payment-card ${paymentMethod === pm.key ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pm.key)}
                  >
                    <div className="bk-pm-icon">{pm.icon}</div>
                    <div className="bk-pm-info">
                      <strong>{pm.label}</strong>
                      <span>{pm.desc}</span>
                    </div>
                    <div className="bk-pm-radio">{paymentMethod === pm.key ? '●' : '○'}</div>
                  </div>
                ))}
              </div>

              <div className="bk-security-strip">
                <span>🔒 Encrypted</span>
                <span>🛡️ PCI Compliant</span>
                <span>↩️ Easy Refunds</span>
                <span>✅ Instant Confirm</span>
              </div>

              <div className="bk-btn-row">
                <button className="bk-btn-back" onClick={handleBack}>← Back</button>
                <button
                  className="bk-btn-pay"
                  onClick={handleSubmit}
                  disabled={bookingLoading}
                >
                  {bookingLoading
                    ? <span className="bk-loading-dots"><span /><span /><span /></span>
                    : `🎉 Pay ₹${grandTotal.toLocaleString()} & Confirm Booking`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live Receipt ── */}
        <div className="bk-receipt-col">
          <div className="bk-receipt">
            {/* Property Info */}
            <div className="bk-receipt-property">
              <img
                src={farmhouse.imageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400'}
                alt={farmhouse.name}
              />
              <div className="bk-receipt-prop-info">
                <strong>{farmhouse.name}</strong>
                <span>📍 {farmhouse.location}</span>
                <span>₹{farmhouse.pricePerDay?.toLocaleString()} / night</span>
              </div>
            </div>

            <div className="bk-receipt-divider" />

            {/* Date Summary */}
            <div className="bk-receipt-section">
              <div className="bk-rcpt-row">
                <span>🛬 Check-in</span>
                <strong>{fmt(startDate)}<small>{getBookingHours(timeSlot).checkIn}</small></strong>
              </div>
              <div className="bk-rcpt-row">
                <span>🛫 Check-out</span>
                <strong>{fmt(endDate)}<small>{getBookingHours(timeSlot).checkOut}</small></strong>
              </div>
              <div className="bk-rcpt-row">
                <span>🕒 Time slot</span>
                <strong>{BOOKING_TYPES.find(type => type.key === toUiBookingType(normalizeBookingType(timeSlot)))?.label || '—'}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>🌙 Nights</span>
                <strong>{nights || '—'}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>👥 Guests</span>
                <strong>{guests} {guestGroupType ? `(${guestGroupType})` : ''}</strong>
              </div>
            </div>

            <div className="bk-receipt-divider" />

            <div className="bk-receipt-manifest">
              <div className="bk-receipt-manifest-header">
                <span>OFFICIAL RESERVATION MANIFEST</span>
                <strong>EST-{guestGroupType === 'Couple' ? `CPL-${couplesCount}X${guests}` : `${guestGroupType.toUpperCase()}-${guests}`}</strong>
              </div>
              <div className="bk-receipt-manifest-row">
                <span>Stay profile</span>
                <strong>{guestGroupType === 'Couple' ? 'Couples Luxury Sanctuary' : `${guestGroupType} Estate Stay`}</strong>
              </div>
              <div className="bk-receipt-manifest-row">
                <span>Accommodation</span>
                <strong>{guestGroupType === 'Couple' ? `${couplesCount} King En-Suite${couplesCount > 1 ? 's' : ''}` : 'Private estate allocation'}</strong>
              </div>
              <div className="bk-receipt-manifest-row">
                <span>Registered guests</span>
                <strong>{guests} {guestGroupType === 'Couple' ? 'Adults' : 'Guests'}</strong>
              </div>
              <div className="bk-receipt-manifest-note">🛡️ Private premises, sanitized linens, and dedicated caretaker.</div>
            </div>

            {specialRequirements.trim() && (
              <div className="bk-receipt-request">
                <span>Special requests</span>
                <p>{specialRequirements}</p>
              </div>
            )}

            <div className="bk-receipt-divider" />

            {/* Sidebar Promo Code Apply Box */}
            <div className="bk-sidebar-coupon-box">
              {appliedDiscount ? (
                <div className="bk-sc-applied">
                  <span>🏷️ {appliedDiscount.discountPercent}% OFF Applied</span>
                  <button type="button" className="bk-sc-remove" onClick={handleRemoveOffer}>Remove</button>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>🏷️ Promo Code / Offer</span>
                  <form className="bk-sc-form" onSubmit={handleApplyCoupon}>
                    <input
                      type="text"
                      className="bk-sc-input"
                      placeholder="e.g. ESTATE20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="submit" className="bk-sc-btn">Apply</button>
                  </form>
                  {availableOffers.length > 0 && (
                    <div className="bk-sc-quick-chips">
                      <span className="bk-sc-qc-label">Codes:</span>
                      {availableOffers.map(o => (
                        <button
                          key={o.id || o.specialOffer || o.title}
                          type="button"
                          className="bk-sc-chip"
                          onClick={() => handleApplyOffer(o)}
                          title={`Apply ${o.discountPercent}% OFF (${o.title})`}
                        >
                          {o.specialOffer || `${o.discountPercent}% OFF`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bk-receipt-section">
              <div className="bk-rcpt-row">
                <span>Base Cost{nights > 0 ? ` (${nights}n)` : ''}</span>
                <strong>₹{baseCost.toLocaleString()}</strong>
              </div>
              {chefCost > 0 && (
                <div className="bk-rcpt-row">
                  <span>👨‍🍳 Chef</span>
                  <strong>₹{chefCost.toLocaleString()}</strong>
                </div>
              )}
              {flatCost > 0 && (
                <div className="bk-rcpt-row">
                  <span>✨ Add-ons</span>
                  <strong>₹{flatCost.toLocaleString()}</strong>
                </div>
              )}
              {/* Active addons list */}
              {Object.entries(addons).filter(([,v]) => v).map(([k]) => {
                const a = ADDON_LIST.find(x => x.key === k);
                return a ? (
                  <div key={k} className="bk-rcpt-addon">
                    <span>{a.icon} {a.label}</span>
                  </div>
                ) : null;
              })}

              {/* Discount Offer Row */}
              {appliedDiscount && discountAmount > 0 && (
                <div className="bk-rcpt-row bk-rcpt-discount-row">
                  <span>🏷️ Discount ({discountPercent}% OFF)</span>
                  <strong>-₹{discountAmount.toLocaleString()}</strong>
                </div>
              )}
              {appliedDiscount && discountAmount > 0 && (
                <div className="bk-rcpt-row" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <span>Taxable Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
              )}

              <div className="bk-rcpt-row">
                <span>GST (18%)</span>
                <strong>₹{gst.toLocaleString()}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>Service Fee (5%)</span>
                <strong>₹{serviceFee.toLocaleString()}</strong>
              </div>
            </div>

            <div className="bk-receipt-divider dotted" />

            {/* Grand Total */}
            <div className="bk-rcpt-total">
              <span>Total Amount</span>
              <strong>₹{grandTotal.toLocaleString()}</strong>
            </div>

            {/* Savings Callout */}
            {appliedDiscount && totalSavings > 0 && (
              <div className="bk-savings-callout">
                <span>🎉</span>
                <div>
                  <strong>₹{totalSavings.toLocaleString()} Total Savings!</strong>
                  <small>{discountPercent}% OFF with {appliedDiscount.title || appliedDiscount.specialOffer || 'Offer'}</small>
                </div>
              </div>
            )}

            {/* Per person */}
            {grandTotal > 0 && nights > 0 && (
              <p className="bk-rcpt-per-person">
                ≈ ₹{Math.round(grandTotal / guests).toLocaleString()} per person
              </p>
            )}

            {/* Trust badges */}
            <div className="bk-trust-badges">
              <span>🔒 SSL Secure</span>
              <span>↩️ Free Cancel</span>
              <span>⚡ Instant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
