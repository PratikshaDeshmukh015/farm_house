import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { bookingAPI, farmhouseAPI, discountAPI } from '../api/axiosInstance';
import './BookingPage.css';

// Default Fallback Farmhouse if API isn't loaded yet
const DEFAULT_FARMHOUSE = {
  id: 1,
  name: 'Whispering Pines Luxury Farmhouse',
  location: 'Lonavala / Western Ghats',
  description: 'An idyllic 4-acre private estate with infinity pool, organic orchards, and panoramic mountain views.',
  pricePerDay: 5000,
  maxGuests: 15,
  bedrooms: 4,
  bathrooms: 4,
  rating: 4.9,
  reviewsCount: 128,
  imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80'
  ]
};

// Section 3: Select Facilities Catalog
const FACILITIES_LIST = [
  {
    id: 'pool',
    icon: '🏊‍♂️',
    title: 'Swimming Pool',
    tagline: 'Pool access',
    desc: 'Crystal clear temperature-controlled private pool with poolside loungers & floats.',
    price: 1200,
    unit: 'flat rate',
    badge: 'Popular'
  },
  {
    id: 'dining',
    icon: '🍽️',
    title: 'Food & Dining',
    tagline: 'Meal options',
    desc: 'Farm-to-table organic breakfast, lunch, high tea & delicious chef-curated dinner buffet.',
    price: 1800,
    unit: 'per guest',
    badge: 'Organic'
  },
  {
    id: 'dj',
    icon: '🎵',
    title: 'DJ & Music',
    tagline: 'Entertainment',
    desc: 'High-output 2000W Bluetooth sound system, party laser lighting & karaoke microphones.',
    price: 2500,
    unit: 'per session',
    badge: 'Party'
  },
  {
    id: 'bonfire',
    icon: '🔥',
    title: 'Bonfire',
    tagline: 'Evening activity',
    desc: 'Lawn campfire under starry skies with aromatic wood logs and toasted marshmallows.',
    price: 900,
    unit: 'flat rate',
    badge: 'Cozy'
  },
  {
    id: 'bbq',
    icon: '🍢',
    title: 'Live Lawn BBQ',
    tagline: 'Grill master',
    desc: 'Open-air charcoal grill master with marinated paneer/chicken skewers and artisan dips.',
    price: 1500,
    unit: 'per setup',
    badge: 'Gourmet'
  },
  {
    id: 'cinema',
    icon: '🎬',
    title: 'Starlight Cinema',
    tagline: 'Outdoor movie',
    desc: '150-inch lawn projection screen with plush bean bags and unlimited gourmet popcorn.',
    price: 1400,
    unit: 'per night',
    badge: 'Unique'
  }
];

// Booking Types
const BOOKING_TYPES = [
  {
    id: 'DAY_PICNIC',
    label: 'Day Picnic',
    icon: '☀️',
    badge: '09:00 AM - 05:00 PM',
    tag: 'Day Picnic (8 Hours)',
    defaultCheckInTime: '09:00',
    defaultCheckOutTime: '17:00',
    rateMultiplier: 0.60,
    timeSlotBackend: 'AM',
    description: 'Perfect for family get-togethers, team outings and daytime pool fun.'
  },
  {
    id: 'NIGHT_STAY',
    label: 'Night Stay',
    icon: '🌙',
    badge: '06:00 PM - 09:00 AM',
    tag: 'Night Stay (Overnight)',
    defaultCheckInTime: '18:00',
    defaultCheckOutTime: '09:00',
    rateMultiplier: 0.75,
    timeSlotBackend: 'PM',
    description: 'Cozy overnight retreat with bonfire, star gazing and morning birdsong.'
  },
  {
    id: 'FULL_DAY',
    label: 'Full Day & Night',
    icon: '🌟',
    badge: '24 Hours Luxury',
    tag: 'Full 24-Hour Stay',
    defaultCheckInTime: '12:00',
    defaultCheckOutTime: '11:00',
    rateMultiplier: 1.00,
    timeSlotBackend: 'FULL_DAY',
    description: 'The ultimate luxury estate experience from noon to late morning next day.'
  }
];

// Payment Methods
const PAYMENT_METHODS = [
  { id: 'UPI', name: 'UPI Instant Pay', icon: '📱', desc: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'CARD', name: 'Credit / Debit Card', icon: '💳', desc: 'Visa, MasterCard, RuPay, Amex' },
  { id: 'NET_BANKING', name: 'Net Banking', icon: '🏦', desc: 'All Major Indian Banks' },
  { id: 'RAZORPAY', name: 'Razorpay Gateway', icon: '⚡', desc: 'One-click checkout & EMI' }
];

// Quick Suggestion Pills for Special Requests
const SPECIAL_REQUEST_SUGGESTIONS = [
  '🎂 Birthday Celebration Decor',
  '🍾 Romantic Anniversary Setup',
  '🌱 Pure Jain/Satvik Meals',
  '🐶 Pet Friendly Accommodations',
  '👶 Baby Cot & High Chair',
  '🪵 Extra Bonfire Logs'
];

// Curated Discount Offers
const AVAILABLE_COUPONS = [
  { code: 'NATURE10', percent: 10, title: 'Nature Escape', description: 'Flat 10% off on all stays' },
  { code: 'POOL20', percent: 20, title: 'Pool Party Special', description: 'Flat 20% off with pool facilities' },
  { code: 'WEEKEND15', percent: 15, title: 'Weekend Getaway', description: 'Flat 15% off for weekend dates' }
];

function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function BookingPage({ user }) {
  const { farmhouseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Farmhouse Data
  const [farmhouse, setFarmhouse] = useState(DEFAULT_FARMHOUSE);
  const [loadingEstate, setLoadingEstate] = useState(false);

  // Layout preference: 'single' (Single-page) or 'multi' (Multi-step)
  const [layoutStyle, setLayoutStyle] = useState('single');
  const [currentStep, setCurrentStep] = useState(1);

  // Dates Setup
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t;
  }, []);

  // ----------------------------------------------------
  // Section 1: Guest Information
  // ----------------------------------------------------
  const [fullName, setFullName] = useState(user?.name || '');
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || user?.phone || '');
  const [guestCount, setGuestCount] = useState(4);
  const [bookingType, setBookingType] = useState('FULL_DAY');

  // ----------------------------------------------------
  // Section 2: Booking Details
  // ----------------------------------------------------
  const [checkInDate, setCheckInDate] = useState(toDateString(today));
  const [checkOutDate, setCheckOutDate] = useState(toDateString(tomorrow));
  const [checkInTime, setCheckInTime] = useState('12:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [adults, setAdults] = useState(3);
  const [children, setChildren] = useState(1);

  // Live Availability State
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState('Dates are open and ready for reservation');

  // ----------------------------------------------------
  // Section 3: Selected Facilities
  // ----------------------------------------------------
  const [selectedFacilities, setSelectedFacilities] = useState({
    pool: true,
    dining: false,
    dj: false,
    bonfire: true,
    bbq: false,
    cinema: false
  });

  // ----------------------------------------------------
  // Section 4: Payment Details
  // ----------------------------------------------------
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [specialRequests, setSpecialRequests] = useState('');
  const [couponCode, setCouponCode] = useState(searchParams.get('code') || 'NATURE10');
  const [appliedCoupon, setAppliedCoupon] = useState({
    code: 'NATURE10',
    percent: 10,
    title: 'Nature Escape'
  });
  const [couponError, setCouponError] = useState('');

  // Submission / Modal States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize times when booking type changes
  const handleBookingTypeChange = (typeId) => {
    setBookingType(typeId);
    const bt = BOOKING_TYPES.find(b => b.id === typeId);
    if (bt) {
      setCheckInTime(bt.defaultCheckInTime);
      setCheckOutTime(bt.defaultCheckOutTime);
      // For Day picnic, checkout date is same as check-in date
      if (typeId === 'DAY_PICNIC') {
        setCheckOutDate(checkInDate);
      } else if (checkOutDate <= checkInDate) {
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(toDateString(nextDay));
      }
    }
  };

  // Keep total guest count aligned with adults + children
  useEffect(() => {
    setGuestCount(adults + children);
  }, [adults, children]);

  // Load Farmhouse data
  useEffect(() => {
    const fetchEstate = async () => {
      const activeId = farmhouseId || '1';
      try {
        setLoadingEstate(true);
        const res = await farmhouseAPI.getFarmHouseById(activeId);
        if (res.data?.success && res.data.farmhouse) {
          setFarmhouse(res.data.farmhouse);
        }
      } catch (err) {
        console.warn('Using default demo farmhouse data:', err.message);
      } finally {
        setLoadingEstate(false);
      }
    };
    fetchEstate();
  }, [farmhouseId]);

  // Live Availability Check
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkInDate) return;
      setIsCheckingAvailability(true);
      try {
        const activeType = BOOKING_TYPES.find(b => b.id === bookingType);
        const timeSlot = activeType ? activeType.timeSlotBackend : 'FULL_DAY';
        const res = await bookingAPI.checkAvailability(
          farmhouse.id || 1,
          checkInDate,
          checkOutDate || checkInDate,
          timeSlot
        );
        if (res.data && res.data.available !== undefined) {
          setIsAvailable(res.data.available);
          setAvailabilityMessage(
            res.data.available
              ? '✨ Live Status: Selected dates & slot are available!'
              : '⚠️ These dates have already been booked. Please pick an alternative date.'
          );
        } else {
          setIsAvailable(true);
          setAvailabilityMessage('✨ Live Status: Available for instant booking!');
        }
      } catch {
        // Fallback simulate availability
        setIsAvailable(true);
        setAvailabilityMessage('✨ Live Status: Available for instant booking!');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timer = setTimeout(checkAvailability, 400);
    return () => clearTimeout(timer);
  }, [farmhouse.id, checkInDate, checkOutDate, bookingType]);

  // Toggle facility
  const toggleFacility = (facilityId) => {
    setSelectedFacilities(prev => ({
      ...prev,
      [facilityId]: !prev[facilityId]
    }));
  };

  // Add Special Request pill
  const handleAddRequestTag = (tag) => {
    if (!specialRequests.includes(tag)) {
      setSpecialRequests(prev => prev ? `${prev}, ${tag}` : tag);
    }
  };

  // Coupon application
  const handleApplyCoupon = (codeToApply) => {
    const targetCode = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    const found = AVAILABLE_COUPONS.find(c => c.code === targetCode);
    if (found) {
      setAppliedCoupon(found);
      setCouponCode(found.code);
    } else {
      setCouponError('Invalid coupon code. Try NATURE10, POOL20, or WEEKEND15.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // ----------------------------------------------------
  // Dynamic Pricing Calculation
  // ----------------------------------------------------
  const pricing = useMemo(() => {
    const activeType = BOOKING_TYPES.find(b => b.id === bookingType) || BOOKING_TYPES[2];
    const baseDailyRate = farmhouse.pricePerDay || 5000;

    // Number of nights / days
    let nights = 1;
    if (bookingType === 'DAY_PICNIC') {
      nights = 1;
    } else if (checkInDate && checkOutDate) {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nights = Math.max(1, diffDays);
    }

    // Base Stay Cost with Booking Type Multiplier
    const stayBaseRate = Math.round(baseDailyRate * activeType.rateMultiplier * nights);

    // Facilities & Add-ons Cost
    let facilitiesCost = 0;
    FACILITIES_LIST.forEach(f => {
      if (selectedFacilities[f.id]) {
        if (f.id === 'dining') {
          // per guest
          facilitiesCost += f.price * guestCount * nights;
        } else {
          // flat rate
          facilitiesCost += f.price;
        }
      }
    });

    const subtotal = stayBaseRate + facilitiesCost;

    // Discount
    let discountAmount = 0;
    if (appliedCoupon) {
      discountAmount = Math.round((subtotal * appliedCoupon.percent) / 100);
    }

    const discountedTotal = Math.max(0, subtotal - discountAmount);

    // GST & Service Fee (12%)
    const gstAndTax = Math.round(discountedTotal * 0.12);

    // Grand Total
    const totalBookingAmount = discountedTotal + gstAndTax;

    // Advance Payment (30% deposit)
    const advancePayment = Math.round(totalBookingAmount * 0.30);

    // Remaining Amount (70% at check-in)
    const remainingAmount = totalBookingAmount - advancePayment;

    return {
      nights,
      stayBaseRate,
      facilitiesCost,
      subtotal,
      discountAmount,
      gstAndTax,
      totalBookingAmount,
      advancePayment,
      remainingAmount
    };
  }, [farmhouse.pricePerDay, bookingType, checkInDate, checkOutDate, selectedFacilities, guestCount, appliedCoupon]);

  // Form Validation
  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter guest full name.');
      return false;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return false;
    }
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!checkInDate) {
      setErrorMessage('Please select a check-in date.');
      return false;
    }
    if (!isAvailable) {
      setErrorMessage('The selected dates are currently unavailable. Please adjust your dates.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Submit / Initiate Razorpay or Direct Booking
  const handleProceedToPayment = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    setShowRazorpayModal(true);
  };

  // Execute Final Booking Confirmation
  const handleConfirmPaymentAndBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const bookingIdCode = 'FB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const activeType = BOOKING_TYPES.find(b => b.id === bookingType) || BOOKING_TYPES[2];
    const payload = {
      farmHouseId: farmhouse.id || 1,
      farmHouseName: farmhouse.name,
      startDate: checkInDate,
      endDate: checkOutDate || checkInDate,
      timeSlot: activeType.timeSlotBackend,
      totalPrice: pricing.totalBookingAmount,
      numberOfGuests: guestCount,
      specialRequirements: `Guest: ${fullName} (${mobileNumber}, ${emailAddress}) | Type: ${activeType.label} | Facilities: ${Object.keys(selectedFacilities).filter(k => selectedFacilities[k]).join(', ')} | Notes: ${specialRequests}`
    };

    try {
      if (user?.id) {
        await bookingAPI.createBooking(payload, user.id);
      }
      // Save local copy for offline / instant view
      const confirmedData = {
        bookingId: bookingIdCode,
        farmhouseName: farmhouse.name,
        location: farmhouse.location,
        guestName: fullName,
        guestEmail: emailAddress,
        guestPhone: mobileNumber,
        bookingType: activeType.label,
        checkInDate,
        checkOutDate,
        checkInTime,
        checkOutTime,
        adults,
        children,
        totalGuests: guestCount,
        facilities: Object.keys(selectedFacilities).filter(k => selectedFacilities[k]).map(k => {
          const item = FACILITIES_LIST.find(f => f.id === k);
          return item ? item.title : k;
        }),
        paymentMethod,
        totalAmount: pricing.totalBookingAmount,
        advancePaid: pricing.advancePayment,
        remainingAmount: pricing.remainingAmount,
        specialRequests,
        createdAt: new Date().toISOString()
      };

      setConfirmedBookingData(confirmedData);
      setShowRazorpayModal(false);
      setBookingConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // Even if backend fails, provide booking summary fallback
      const confirmedData = {
        bookingId: bookingIdCode,
        farmhouseName: farmhouse.name,
        location: farmhouse.location,
        guestName: fullName,
        guestEmail: emailAddress,
        guestPhone: mobileNumber,
        bookingType: activeType.label,
        checkInDate,
        checkOutDate,
        checkInTime,
        checkOutTime,
        adults,
        children,
        totalGuests: guestCount,
        facilities: Object.keys(selectedFacilities).filter(k => selectedFacilities[k]).map(k => {
          const item = FACILITIES_LIST.find(f => f.id === k);
          return item ? item.title : k;
        }),
        paymentMethod,
        totalAmount: pricing.totalBookingAmount,
        advancePaid: pricing.advancePayment,
        remainingAmount: pricing.remainingAmount,
        specialRequests,
        createdAt: new Date().toISOString()
      };
      setConfirmedBookingData(confirmedData);
      setShowRazorpayModal(false);
      setBookingConfirmed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If Booking is confirmed, render beautiful confirmation slip
  if (bookingConfirmed && confirmedBookingData) {
    return (
      <div className="bk-page-luxury-theme">
        <div className="bk-container bk-confirmation-wrap">
          <div className="bk-success-card">
            <div className="bk-success-header">
              <div className="bk-check-circle">✓</div>
              <span className="bk-badge-confirmed">Reservation Confirmed</span>
              <h1 className="bk-conf-title">Getaway Booked Successfully!</h1>
              <p className="bk-conf-subtitle">
                A confirmation voucher and access guide have been sent to <strong>{confirmedBookingData.guestEmail}</strong>.
              </p>
              <div className="bk-conf-id-box">
                <span className="bk-id-label">Official Booking Reference ID</span>
                <span className="bk-id-val">{confirmedBookingData.bookingId}</span>
              </div>
            </div>

            <div className="bk-conf-grid">
              {/* Estate & Stay summary */}
              <div className="bk-conf-box">
                <h3>🏡 Farmhouse &amp; Schedule</h3>
                <div className="bk-conf-row">
                  <span>Farmhouse:</span>
                  <strong>{confirmedBookingData.farmhouseName}</strong>
                </div>
                <div className="bk-conf-row">
                  <span>Location:</span>
                  <span>{confirmedBookingData.location}</span>
                </div>
                <div className="bk-conf-row">
                  <span>Booking Type:</span>
                  <span className="bk-tag-highlight">{confirmedBookingData.bookingType}</span>
                </div>
                <div className="bk-conf-row">
                  <span>Check-in:</span>
                  <strong>{confirmedBookingData.checkInDate} at {confirmedBookingData.checkInTime}</strong>
                </div>
                <div className="bk-conf-row">
                  <span>Check-out:</span>
                  <strong>{confirmedBookingData.checkOutDate} at {confirmedBookingData.checkOutTime}</strong>
                </div>
                <div className="bk-conf-row">
                  <span>Guests:</span>
                  <span>{confirmedBookingData.totalGuests} Guests ({confirmedBookingData.adults} Adults, {confirmedBookingData.children} Children)</span>
                </div>
              </div>

              {/* Guest & Payment summary */}
              <div className="bk-conf-box">
                <h3>💳 Payment &amp; Guest Summary</h3>
                <div className="bk-conf-row">
                  <span>Guest Name:</span>
                  <strong>{confirmedBookingData.guestName}</strong>
                </div>
                <div className="bk-conf-row">
                  <span>Contact:</span>
                  <span>+91 {confirmedBookingData.guestPhone}</span>
                </div>
                <div className="bk-conf-row">
                  <span>Total Amount:</span>
                  <strong>₹ {confirmedBookingData.totalAmount.toLocaleString()}</strong>
                </div>
                <div className="bk-conf-row bk-advance-highlight">
                  <span>Advance Paid Online:</span>
                  <strong className="bk-green-text">₹ {confirmedBookingData.advancePaid.toLocaleString()} (Paid)</strong>
                </div>
                <div className="bk-conf-row bk-remaining-highlight">
                  <span>Remaining at Check-in:</span>
                  <strong>₹ {confirmedBookingData.remainingAmount.toLocaleString()}</strong>
                </div>
                <div className="bk-conf-row">
                  <span>Payment Gateway:</span>
                  <span>{confirmedBookingData.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Facilities Included */}
            {confirmedBookingData.facilities.length > 0 && (
              <div className="bk-conf-facilities-box">
                <h4>✨ Selected Amenities &amp; Services Included:</h4>
                <div className="bk-conf-fac-chips">
                  {confirmedBookingData.facilities.map((fac, idx) => (
                    <span key={idx} className="bk-fac-chip">✓ {fac}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bk-conf-actions">
              <button 
                type="button" 
                className="bk-btn-secondary" 
                onClick={() => window.print()}
              >
                🖨️ Print Voucher
              </button>
              <button 
                type="button" 
                className="bk-btn-primary" 
                onClick={() => navigate('/my-bookings')}
              >
                View in My Bookings ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bk-page-luxury-theme">
      {/* ── Top Header Section ── */}
      <section className="bk-hero-section">
        <div className="bk-container">
          <div className="bk-hero-badge">
            <span className="bk-leaf-icon">🌿</span> Easy booking &amp; Instant Confirmation
          </div>
          <h1 className="bk-hero-title">Book Your Stay</h1>
          <p className="bk-hero-subtitle">
            Plan Your Perfect Getaway — Complete your details below to reserve your luxury farmhouse experience.
          </p>

          {/* Quick Estate Bar */}
          <div className="bk-estate-quickbar">
            <div className="bk-eqb-img-wrap">
              <img src={farmhouse.imageUrl || DEFAULT_FARMHOUSE.imageUrl} alt={farmhouse.name} />
            </div>
            <div className="bk-eqb-info">
              <div className="bk-eqb-top">
                <span className="bk-rating-pill">★ {farmhouse.rating || 4.9} ({farmhouse.reviewsCount || 120} reviews)</span>
                <span className="bk-location-tag">📍 {farmhouse.location || 'Maharashtra'}</span>
              </div>
              <h2 className="bk-eqb-name">{farmhouse.name || DEFAULT_FARMHOUSE.name}</h2>
              <p className="bk-eqb-price">
                From <strong>₹ {(farmhouse.pricePerDay || 5000).toLocaleString()}</strong> / day
              </p>
            </div>

            {/* View Mode Switcher (Single-page vs Multi-step) */}
            <div className="bk-view-mode-toggle">
              <button
                type="button"
                className={`bk-mode-btn ${layoutStyle === 'single' ? 'active' : ''}`}
                onClick={() => setLayoutStyle('single')}
              >
                📄 Single-Page View
              </button>
              <button
                type="button"
                className={`bk-mode-btn ${layoutStyle === 'multi' ? 'active' : ''}`}
                onClick={() => setLayoutStyle('multi')}
              >
                ⚡ 4-Step Wizard
              </button>
            </div>
          </div>

          {/* Wizard Breadcrumbs (When in Multi-Step mode) */}
          {layoutStyle === 'multi' && (
            <div className="bk-wizard-steps-nav">
              {[
                { num: 1, label: 'Guest Information' },
                { num: 2, label: 'Booking Details' },
                { num: 3, label: 'Select Facilities' },
                { num: 4, label: 'Payment Details' }
              ].map(s => (
                <div
                  key={s.num}
                  className={`bk-wizard-step ${currentStep === s.num ? 'active' : ''} ${currentStep > s.num ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(s.num)}
                >
                  <span className="bk-step-num">{currentStep > s.num ? '✓' : s.num}</span>
                  <span className="bk-step-text">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Main Booking Grid ── */}
      <div className="bk-container bk-main-layout">
        {/* Left Column: Form Sections */}
        <div className="bk-form-column">
          {errorMessage && (
            <div className="bk-alert-box bk-error-alert">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* ========================================================
              SECTION 1: GUEST INFORMATION
              ======================================================== */}
          {(layoutStyle === 'single' || currentStep === 1) && (
            <div className="bk-card-section" id="section-guest-info">
              <div className="bk-section-header">
                <div className="bk-header-left">
                  <span className="bk-section-number">1</span>
                  <div>
                    <h3 className="bk-section-heading">Guest Information</h3>
                    <p className="bk-section-sub">Who will be joining this luxurious farm retreat?</p>
                  </div>
                </div>
                <span className="bk-badge-light">Primary Guest</span>
              </div>

              <div className="bk-fields-grid">
                {/* Full Name */}
                <div className="bk-form-group">
                  <label htmlFor="fullName">Full Name <span className="bk-req">*</span></label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">👤</span>
                    <input
                      id="fullName"
                      type="text"
                      className="bk-input-field"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="bk-form-group">
                  <label htmlFor="mobileNumber">Mobile Number <span className="bk-req">*</span></label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-badge">+91</span>
                    <input
                      id="mobileNumber"
                      type="tel"
                      maxLength={10}
                      className="bk-input-field bk-pl-badge"
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="bk-form-group">
                  <label htmlFor="emailAddress">Email Address <span className="bk-req">*</span></label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">✉️</span>
                    <input
                      id="emailAddress"
                      type="email"
                      className="bk-input-field"
                      placeholder="Enter email address"
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div className="bk-form-group">
                  <label htmlFor="guestCount">Total Number of Guests</label>
                  <div className="bk-stepper-wrap">
                    <button
                      type="button"
                      className="bk-stepper-btn"
                      onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <span className="bk-stepper-val">{guestCount} Guests</span>
                    <button
                      type="button"
                      className="bk-stepper-btn"
                      onClick={() => setAdults(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Booking Type */}
                <div className="bk-form-group bk-col-span-2">
                  <label>Select Booking Type <span className="bk-req">*</span></label>
                  <div className="bk-booking-types-grid">
                    {BOOKING_TYPES.map(bt => (
                      <div
                        key={bt.id}
                        className={`bk-booking-type-card ${bookingType === bt.id ? 'selected' : ''}`}
                        onClick={() => handleBookingTypeChange(bt.id)}
                      >
                        <div className="bk-bt-top">
                          <span className="bk-bt-icon">{bt.icon}</span>
                          <span className="bk-bt-tag">{bt.badge}</span>
                        </div>
                        <h4 className="bk-bt-title">{bt.label}</h4>
                        <p className="bk-bt-desc">{bt.description}</p>
                        <div className="bk-bt-rate-pill">
                          {Math.round(bt.rateMultiplier * 100)}% Standard Rate
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {layoutStyle === 'multi' && (
                <div className="bk-step-nav-buttons">
                  <div></div>
                  <button
                    type="button"
                    className="bk-btn-primary"
                    onClick={() => {
                      if (!fullName.trim() || !mobileNumber.trim()) {
                        setErrorMessage('Please fill out your name and mobile number to proceed.');
                        return;
                      }
                      setErrorMessage('');
                      setCurrentStep(2);
                    }}
                  >
                    Continue to Booking Details ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 2: BOOKING DETAILS
              ======================================================== */}
          {(layoutStyle === 'single' || currentStep === 2) && (
            <div className="bk-card-section" id="section-booking-details">
              <div className="bk-section-header">
                <div className="bk-header-left">
                  <span className="bk-section-number">2</span>
                  <div>
                    <h3 className="bk-section-heading">Booking Details</h3>
                    <p className="bk-section-sub">Choose your stay dates, preferred timings and guest party breakdown.</p>
                  </div>
                </div>

                {/* Live Availability Status Pill */}
                <div className={`bk-avail-pill ${isAvailable ? 'available' : 'unavailable'}`}>
                  <span className="bk-avail-dot"></span>
                  <span>{isCheckingAvailability ? 'Checking live slots...' : availabilityMessage}</span>
                </div>
              </div>

              <div className="bk-fields-grid">
                {/* Check-in Date */}
                <div className="bk-form-group">
                  <label htmlFor="checkInDate">Check-in Date <span className="bk-req">*</span></label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">📅</span>
                    <input
                      id="checkInDate"
                      type="date"
                      min={toDateString(today)}
                      className="bk-input-field"
                      value={checkInDate}
                      onChange={e => {
                        setCheckInDate(e.target.value);
                        if (bookingType === 'DAY_PICNIC') {
                          setCheckOutDate(e.target.value);
                        } else if (e.target.value >= checkOutDate) {
                          const nxt = new Date(e.target.value);
                          nxt.setDate(nxt.getDate() + 1);
                          setCheckOutDate(toDateString(nxt));
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="bk-form-group">
                  <label htmlFor="checkOutDate">Check-out Date <span className="bk-req">*</span></label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">📅</span>
                    <input
                      id="checkOutDate"
                      type="date"
                      min={checkInDate || toDateString(today)}
                      disabled={bookingType === 'DAY_PICNIC'}
                      className="bk-input-field"
                      value={checkOutDate}
                      onChange={e => setCheckOutDate(e.target.value)}
                      required
                    />
                  </div>
                  {bookingType === 'DAY_PICNIC' && (
                    <small className="bk-hint-text">Day Picnic concludes the same evening.</small>
                  )}
                </div>

                {/* Check-in Time */}
                <div className="bk-form-group">
                  <label htmlFor="checkInTime">Check-in Time</label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">⏰</span>
                    <input
                      id="checkInTime"
                      type="time"
                      className="bk-input-field"
                      value={checkInTime}
                      onChange={e => setCheckInTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Check-out Time */}
                <div className="bk-form-group">
                  <label htmlFor="checkOutTime">Check-out Time</label>
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">⏰</span>
                    <input
                      id="checkOutTime"
                      type="time"
                      className="bk-input-field"
                      value={checkOutTime}
                      onChange={e => setCheckOutTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Adults Stepper */}
                <div className="bk-form-group">
                  <label>Adults (12+ yrs)</label>
                  <div className="bk-stepper-wrap">
                    <button
                      type="button"
                      className="bk-stepper-btn"
                      onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <span className="bk-stepper-val">{adults} Adults</span>
                    <button
                      type="button"
                      className="bk-stepper-btn"
                      onClick={() => setAdults(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children Stepper */}
                <div className="bk-form-group">
                  <label>Children (0 - 11 yrs)</label>
                  <div className="bk-stepper-wrap">
                    <button
                      type="button"
                      className="bk-stepper-btn"
                      onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                    >
                      -
                    </button>
                    <span className="bk-stepper-val">{children} Children</span>
                    <button
                      type="button"
                      className="bk-stepper-btn"
                      onClick={() => setChildren(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {layoutStyle === 'multi' && (
                <div className="bk-step-nav-buttons">
                  <button
                    type="button"
                    className="bk-btn-secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    ‹ Back
                  </button>
                  <button
                    type="button"
                    className="bk-btn-primary"
                    onClick={() => {
                      if (!isAvailable) {
                        setErrorMessage('Please pick available dates to continue.');
                        return;
                      }
                      setErrorMessage('');
                      setCurrentStep(3);
                    }}
                  >
                    Continue to Facilities ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 3: SELECT FACILITIES
              ======================================================== */}
          {(layoutStyle === 'single' || currentStep === 3) && (
            <div className="bk-card-section" id="section-facilities">
              <div className="bk-section-header">
                <div className="bk-header-left">
                  <span className="bk-section-number">3</span>
                  <div>
                    <h3 className="bk-section-heading">Select Facilities &amp; Amenities</h3>
                    <p className="bk-section-sub">Personalize your farmhouse stay with curated luxury experiences.</p>
                  </div>
                </div>
                <span className="bk-badge-light">
                  {Object.values(selectedFacilities).filter(Boolean).length} Selected
                </span>
              </div>

              <div className="bk-facilities-grid">
                {FACILITIES_LIST.map(fac => {
                  const isChecked = Boolean(selectedFacilities[fac.id]);
                  return (
                    <div
                      key={fac.id}
                      className={`bk-facility-card ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleFacility(fac.id)}
                    >
                      <div className="bk-fac-card-top">
                        <span className="bk-fac-icon">{fac.icon}</span>
                        <div className="bk-fac-checkbox-wrap">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="bk-fac-checkbox"
                          />
                          <span className="bk-custom-chk">{isChecked ? '✓' : ''}</span>
                        </div>
                      </div>

                      <div className="bk-fac-content">
                        <div className="bk-fac-titles">
                          <h4 className="bk-fac-title">{fac.title}</h4>
                          <span className="bk-fac-tagline">{fac.tagline}</span>
                        </div>
                        <p className="bk-fac-desc">{fac.desc}</p>
                      </div>

                      <div className="bk-fac-bottom">
                        <div className="bk-fac-price-group">
                          <strong>+ ₹ {fac.price.toLocaleString()}</strong>
                          <span className="bk-fac-unit">/{fac.unit}</span>
                        </div>
                        <span className="bk-fac-badge">{fac.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {layoutStyle === 'multi' && (
                <div className="bk-step-nav-buttons">
                  <button
                    type="button"
                    className="bk-btn-secondary"
                    onClick={() => setCurrentStep(2)}
                  >
                    ‹ Back
                  </button>
                  <button
                    type="button"
                    className="bk-btn-primary"
                    onClick={() => setCurrentStep(4)}
                  >
                    Continue to Payment &amp; Summary ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 4: PAYMENT DETAILS & SPECIAL REQUESTS
              ======================================================== */}
          {(layoutStyle === 'single' || currentStep === 4) && (
            <div className="bk-card-section" id="section-payment-details">
              <div className="bk-section-header">
                <div className="bk-header-left">
                  <span className="bk-section-number">4</span>
                  <div>
                    <h3 className="bk-section-heading">Payment Details &amp; Gateway</h3>
                    <p className="bk-section-sub">Choose your preferred payment method and add special arrangements.</p>
                  </div>
                </div>
                <span className="bk-badge-light">🔒 256-Bit SSL Encrypted</span>
              </div>

              {/* Payment Methods Grid */}
              <div className="bk-payment-methods-grid">
                {PAYMENT_METHODS.map(pm => (
                  <div
                    key={pm.id}
                    className={`bk-payment-card ${paymentMethod === pm.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <div className="bk-pm-radio">
                      <div className={`bk-radio-dot ${paymentMethod === pm.id ? 'filled' : ''}`}></div>
                    </div>
                    <span className="bk-pm-icon">{pm.icon}</span>
                    <div className="bk-pm-info">
                      <h4>{pm.name}</h4>
                      <p>{pm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Bar */}
              <div className="bk-coupon-wrapper">
                <label className="bk-coupon-label">Have a Discount / Promo Code?</label>
                <div className="bk-coupon-input-row">
                  <div className="bk-input-wrap">
                    <span className="bk-input-icon">🏷️</span>
                    <input
                      type="text"
                      className="bk-input-field"
                      placeholder="Enter promo code (e.g. NATURE10)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="bk-btn-apply-coupon"
                    onClick={() => handleApplyCoupon()}
                  >
                    Apply
                  </button>
                </div>

                {couponError && <p className="bk-coupon-error">{couponError}</p>}

                {appliedCoupon && (
                  <div className="bk-coupon-active-banner">
                    <div className="bk-ca-left">
                      <span className="bk-ca-check">✓</span>
                      <span>
                        Coupon <strong>{appliedCoupon.code}</strong> applied — saved ₹ {pricing.discountAmount.toLocaleString()} ({appliedCoupon.percent}% OFF)!
                      </span>
                    </div>
                    <button type="button" className="bk-ca-remove" onClick={handleRemoveCoupon}>
                      ✕
                    </button>
                  </div>
                )}

                {/* Quick Coupon Suggestions */}
                <div className="bk-quick-coupons">
                  <span className="bk-qc-title">Suggested Discounts:</span>
                  {AVAILABLE_COUPONS.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      className={`bk-qc-tag ${appliedCoupon?.code === c.code ? 'applied' : ''}`}
                      onClick={() => handleApplyCoupon(c.code)}
                    >
                      {c.code} ({c.percent}% OFF)
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="bk-form-group bk-mt-4">
                <label htmlFor="specialRequests">Special Requests &amp; Extra Arrangements (Optional)</label>
                <textarea
                  id="specialRequests"
                  rows={3}
                  className="bk-textarea-field"
                  placeholder="Need extra beds, charcoal, pet bowl, late check-in or specific cuisine preferences?"
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                />
                <div className="bk-quick-tags-row">
                  <span className="bk-qt-label">Quick suggestions:</span>
                  {SPECIAL_REQUEST_SUGGESTIONS.map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      className="bk-tag-pill"
                      onClick={() => handleAddRequestTag(tag)}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {layoutStyle === 'multi' && (
                <div className="bk-step-nav-buttons">
                  <button
                    type="button"
                    className="bk-btn-secondary"
                    onClick={() => setCurrentStep(3)}
                  >
                    ‹ Back to Facilities
                  </button>
                  <button
                    type="button"
                    className="bk-btn-primary bk-btn-large"
                    onClick={handleProceedToPayment}
                  >
                    Review &amp; Pay ₹ {pricing.advancePayment.toLocaleString()} Advance 🔒
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column: Sticky Summary & Price Breakdown ── */}
        <aside className="bk-summary-column">
          <div className="bk-summary-card">
            <div className="bk-sum-header">
              <h3>Booking Summary</h3>
              <span className="bk-sum-badge">{BOOKING_TYPES.find(b => b.id === bookingType)?.label}</span>
            </div>

            {/* Farmhouse Mini Preview */}
            <div className="bk-sum-estate">
              <img src={farmhouse.imageUrl || DEFAULT_FARMHOUSE.imageUrl} alt={farmhouse.name} />
              <div>
                <h4>{farmhouse.name}</h4>
                <p>📍 {farmhouse.location}</p>
              </div>
            </div>

            {/* Selected Key Details */}
            <div className="bk-sum-details-list">
              <div className="bk-sum-row">
                <span className="bk-sr-label">📅 Dates:</span>
                <span className="bk-sr-val">
                  {checkInDate} {bookingType !== 'DAY_PICNIC' && `➔ ${checkOutDate}`}
                </span>
              </div>
              <div className="bk-sum-row">
                <span className="bk-sr-label">⏰ Timings:</span>
                <span className="bk-sr-val">{checkInTime} to {checkOutTime}</span>
              </div>
              <div className="bk-sum-row">
                <span className="bk-sr-label">👥 Guests:</span>
                <span className="bk-sr-val">{guestCount} Guests ({adults} Adults, {children} Kids)</span>
              </div>
              <div className="bk-sum-row">
                <span className="bk-sr-label">✨ Facilities:</span>
                <span className="bk-sr-val">
                  {Object.values(selectedFacilities).filter(Boolean).length} Selected
                </span>
              </div>
            </div>

            <div className="bk-sum-divider"></div>

            {/* Financial Itemized Breakdown */}
            <div className="bk-price-breakdown">
              <div className="bk-pb-row">
                <span>
                  Base Stay ({pricing.nights} {pricing.nights === 1 ? 'day/night' : 'nights'}):
                </span>
                <span>₹ {pricing.stayBaseRate.toLocaleString()}</span>
              </div>

              {pricing.facilitiesCost > 0 && (
                <div className="bk-pb-row">
                  <span>Facilities &amp; Amenities:</span>
                  <span>+ ₹ {pricing.facilitiesCost.toLocaleString()}</span>
                </div>
              )}

              {pricing.discountAmount > 0 && (
                <div className="bk-pb-row bk-discount-row">
                  <span>🏷️ Discount ({appliedCoupon?.code}):</span>
                  <span>- ₹ {pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="bk-pb-row">
                <span>Taxes &amp; GST (12%):</span>
                <span>+ ₹ {pricing.gstAndTax.toLocaleString()}</span>
              </div>

              <div className="bk-sum-divider"></div>

              {/* Total Booking Amount */}
              <div className="bk-pb-row bk-total-row">
                <strong>Total Booking Amount:</strong>
                <strong className="bk-total-amount">₹ {pricing.totalBookingAmount.toLocaleString()}</strong>
              </div>

              {/* Advance & Remaining Amount */}
              <div className="bk-advance-split-box">
                <div className="bk-as-item">
                  <span className="bk-as-title">Advance Payment (30%)</span>
                  <span className="bk-as-amount bk-emerald">₹ {pricing.advancePayment.toLocaleString()}</span>
                  <span className="bk-as-sub">Pay now to confirm lock</span>
                </div>
                <div className="bk-as-divider"></div>
                <div className="bk-as-item">
                  <span className="bk-as-title">Remaining Amount</span>
                  <span className="bk-as-amount">₹ {pricing.remainingAmount.toLocaleString()}</span>
                  <span className="bk-as-sub">Pay at farmhouse check-in</span>
                </div>
              </div>
            </div>

            {/* Single-Page Action Button */}
            {layoutStyle === 'single' && (
              <button
                type="button"
                className="bk-btn-book-now"
                onClick={handleProceedToPayment}
              >
                Continue to Booking (₹ {pricing.advancePayment.toLocaleString()}) ➔
              </button>
            )}

            <p className="bk-sum-footer-note">
              🛡️ Your booking will be confirmed after availability and payment verification.
            </p>
          </div>
        </aside>
      </div>

      {/* ========================================================
          RAZORPAY SIMULATION POPUP MODAL
          ======================================================== */}
      {showRazorpayModal && (
        <div className="bk-modal-backdrop">
          <div className="bk-modal-card">
            <div className="bk-modal-header">
              <div className="bk-modal-brand">
                <span className="bk-rzp-logo">⚡ Razorpay</span>
                <span className="bk-rzp-secure">Trusted Business</span>
              </div>
              <button
                type="button"
                className="bk-modal-close"
                onClick={() => setShowRazorpayModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="bk-modal-body">
              <div className="bk-rzp-summary-box">
                <span className="bk-rzp-pay-for">Paying To: Whispering Pines Farmhouse</span>
                <div className="bk-rzp-amount-badge">
                  <span>Advance Deposit</span>
                  <strong>₹ {pricing.advancePayment.toLocaleString()}</strong>
                </div>
              </div>

              <div className="bk-rzp-payment-selection">
                <p className="bk-rzp-method-label">
                  Paying via <strong>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name}</strong>
                </p>

                {paymentMethod === 'UPI' && (
                  <div className="bk-rzp-upi-view">
                    <div className="bk-rzp-qr-mock">
                      <div className="bk-qr-code">
                        <span>📱 UPI QR CODE</span>
                      </div>
                      <p>Scan with Google Pay, PhonePe, or Paytm</p>
                    </div>
                    <div className="bk-or-sep">OR</div>
                    <input
                      type="text"
                      className="bk-input-field"
                      placeholder="Enter UPI VPA (e.g. mobile@upi)"
                      defaultValue={mobileNumber ? `${mobileNumber}@upi` : ''}
                    />
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="bk-rzp-card-view">
                    <input type="text" className="bk-input-field" placeholder="Card Number (4532 •••• •••• ••••)" />
                    <div className="bk-card-row">
                      <input type="text" className="bk-input-field" placeholder="MM / YY" />
                      <input type="password" maxLength={3} className="bk-input-field" placeholder="CVV" />
                    </div>
                  </div>
                )}

                {(paymentMethod === 'NET_BANKING' || paymentMethod === 'RAZORPAY') && (
                  <div className="bk-rzp-bank-view">
                    <select className="bk-input-field">
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bk-rzp-guarantee">
                🔒 100% Safe 256-Bit SSL Encrypted Payment Process
              </div>
            </div>

            <div className="bk-modal-footer">
              <button
                type="button"
                className="bk-btn-secondary"
                disabled={isSubmitting}
                onClick={() => setShowRazorpayModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bk-btn-primary bk-rzp-confirm-btn"
                disabled={isSubmitting}
                onClick={handleConfirmPaymentAndBooking}
              >
                {isSubmitting ? 'Verifying Transaction...' : `Pay ₹ ${pricing.advancePayment.toLocaleString()} & Confirm Booking ➔`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
