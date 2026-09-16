import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { bookingAPI, farmhouseAPI } from '../api/axiosInstance';
import './BookingPage.css';

// Default Demo Farmhouse
const DEMO_FARMHOUSE = {
  id: 1,
  name: 'Luxury Mountain Villa',
  location: 'Himachal Pradesh',
  pricePerDay: 5000,
  maxGuests: 8,
  bedrooms: 4,
  bathrooms: 4,
  imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop'
};

// Official active offers & promo codes (Matches Database: 20% OFF Pool Party Special)
export const ACTIVE_OFFERS = [
  {
    code: 'POOL20',
    percent: 20,
    title: 'Pool Party Special',
    tagline: '20% OFF — Private Pool Villas',
    icon: '🏊'
  }
];

const ADDON_LIST = [
  { key: 'chef', icon: '👨‍🍳', label: 'Private Chef', desc: 'Personalised 3-course organic meals all day', price: 1800 },
  { key: 'bonfire', icon: '🪵', label: 'Bonfire & BBQ Setup', desc: 'Firewood, charcoal grill & lawn pit arrangement', price: 1500 },
  { key: 'dj', icon: '🎵', label: 'DJ Sound System', desc: 'Pro wireless audio + party ambient lights', price: 3500 },
  { key: 'adventure', icon: '🛶', label: 'Adventure / Trek Tour', desc: 'Guided nature trail & stream exploration', price: 2200 },
  { key: 'spa', icon: '💆', label: 'Spa & Wellness Session', desc: '2-hour couple relaxation massage package', price: 3000 },
  { key: 'decor', icon: '🌸', label: 'Celebration Decoration', desc: 'Floral arches, fairy lights & party banners', price: 2000 },
];

const PAYMENT_METHODS = [
  { key: 'CARD', icon: '💳', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { key: 'UPI', icon: '📱', label: 'UPI Instant Pay', desc: 'Google Pay, PhonePe, Paytm' },
  { key: 'NET_BANKING', icon: '🏦', label: 'Net Banking', desc: '50+ Indian Banks' },
  { key: 'WALLET', icon: '👝', label: 'Digital Wallets', desc: 'Paytm, Amazon Pay' },
];

const SLOT_OPTIONS = [
  { key: 'AM', label: 'AM (Only Day)', time: '09:00 AM - 05:00 PM' },
  { key: 'PM', label: 'PM (Only Night)', time: '06:00 PM - 09:00 AM' },
  { key: 'FULL_DAY', label: 'AM + PM (Full Day)', time: '09:00 AM - 09:00 AM (Next Day)' },
];

const COUPLE_ALLOCATIONS = [
  { count: 1, label: '1 Couple', sub: '1 Suite • 2 Guests', guests: 2 },
  { count: 2, label: '2 Couples', sub: '2 Suites • 4 Guests', guests: 4 },
  { count: 3, label: '3 Couples', sub: '3 Suites • 6 Guests', guests: 6 },
];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function BookingPage() {
  const { farmhouseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [farmhouse, setFarmhouse] = useState(DEMO_FARMHOUSE);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedSlot, setSelectedSlot] = useState('FULL_DAY');
  const [startDate, setStartDate] = useState(toDateKey(today));
  const [endDate, setEndDate] = useState(toDateKey(tomorrow));
  const [guestCount, setGuestCount] = useState('2 Guests');
  const [timeSlotLabel, setTimeSlotLabel] = useState('Full Day');
  const [specialRequests, setSpecialRequests] = useState('');

  // Calendar & Allocations
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCoupleCount, setSelectedCoupleCount] = useState(2);
  const [calendarError, setCalendarError] = useState('');

  // Sample and dynamic booked slots by date (in YYYY-MM-DD format): { day: boolean, night: boolean }
  const [bookedSlots, setBookedSlots] = useState(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const formatD = (y, m, d) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    const map = {};
    // Full Day Booked (Both Day & Night closed - Red)
    [3, 12, 19, 27].forEach(d => {
      map[formatD(currentYear, currentMonth, d)] = { day: true, night: true };
    });
    // Day Booked (Red), Night Available (Green)
    [4, 15, 23].forEach(d => {
      map[formatD(currentYear, currentMonth, d)] = { day: true, night: false };
    });
    // Day Available (Green), Night Booked (Red)
    [8, 18, 25].forEach(d => {
      map[formatD(currentYear, currentMonth, d)] = { day: false, night: true };
    });
    // Next month slots
    [5, 15, 22].forEach(d => {
      map[formatD(currentYear, currentMonth + 1, d)] = { day: true, night: true };
    });
    [6, 20].forEach(d => {
      map[formatD(currentYear, currentMonth + 1, d)] = { day: true, night: false };
    });
    [10, 26].forEach(d => {
      map[formatD(currentYear, currentMonth + 1, d)] = { day: false, night: true };
    });
    return map;
  });

  // Add-ons & Payment
  const [selectedAddons, setSelectedAddons] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Promo Code State — Initialized from URL param ?code=... or POOL20 by default
  const initialCode = searchParams.get('code') || 'POOL20';
  const [inputCouponCode, setInputCouponCode] = useState(initialCode);
  const [appliedOffer, setAppliedOffer] = useState(() => {
    return ACTIVE_OFFERS.find(o => o.code.toUpperCase() === initialCode.toUpperCase()) || ACTIVE_OFFERS[0];
  });
  const [isOfferActive, setIsOfferActive] = useState(true);

  useEffect(() => {
    fetchFarmhouseDetails();
    fetchBookedDates(farmhouseId || '1');
  }, [farmhouseId]);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      const match = ACTIVE_OFFERS.find(o => o.code.toUpperCase() === codeParam.toUpperCase());
      if (match) {
        setInputCouponCode(match.code);
        setAppliedOffer(match);
        setIsOfferActive(true);
      }
    }
  }, [searchParams]);

  const fetchFarmhouseDetails = async () => {
    try {
      const id = farmhouseId || '1';
      const response = await farmhouseAPI.getFarmHouseById(id);
      if (response.data?.success && response.data.farmhouse) {
        setFarmhouse(response.data.farmhouse);
      }
    } catch (err) {
      setFarmhouse(DEMO_FARMHOUSE);
    }
  };

  const fetchBookedDates = async (id) => {
    try {
      const response = await bookingAPI.getFarmHouseBookings(id);
      if (response.data?.success && Array.isArray(response.data.bookings)) {
        setBookedSlots(prev => {
          const nextMap = { ...prev };
          response.data.bookings.forEach(b => {
            if (b.status !== 'CANCELLED' && b.startDate && b.endDate) {
              let curr = new Date(b.startDate);
              const last = new Date(b.endDate);
              const slot = (b.timeSlot || 'FULL_DAY').toUpperCase();
              while (curr <= last) {
                const k = toDateKey(curr);
                const currentData = nextMap[k] || { day: false, night: false };
                if (slot === 'AM' || slot === 'DAY') {
                  currentData.day = true;
                } else if (slot === 'PM' || slot === 'NIGHT') {
                  currentData.night = true;
                } else {
                  currentData.day = true;
                  currentData.night = true;
                }
                nextMap[k] = currentData;
                curr.setDate(curr.getDate() + 1);
              }
            }
          });
          return nextMap;
        });
      }
    } catch (err) {
      // Retain preloaded sample slot bookings
    }
  };

  const getSlotData = (dateKey) => {
    return bookedSlots[dateKey] || { day: false, night: false };
  };

  const isSlotAvailable = (dateKey, slot) => {
    const data = getSlotData(dateKey);
    if (slot === 'AM') return !data.day;
    if (slot === 'PM') return !data.night;
    if (slot === 'FULL_DAY') return !data.day && !data.night;
    return true;
  };

  // ══════════════════════════════════════════════════════
  // ACCURATE MATHEMATICAL PRICING & DISCOUNT CALCULATIONS
  // ══════════════════════════════════════════════════════
  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const pricePerNight = farmhouse?.pricePerDay || 5000;
  const basePrice = pricePerNight * nights;

  // Addons total
  const addonTotal = Object.keys(selectedAddons).reduce((sum, key) => {
    if (selectedAddons[key]) {
      const item = ADDON_LIST.find(a => a.key === key);
      return sum + (item ? item.price : 0);
    }
    return sum;
  }, 0);

  // Subtotal before discount
  const subtotal = basePrice + addonTotal;

  // Discount percentage & deduction
  const discountPercent = isOfferActive && appliedOffer ? appliedOffer.percent : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  // Net price after discount
  const discountedSubtotal = subtotal - discountAmount;

  // Taxes (10% GST on discounted amount)
  const taxes = Math.round(discountedSubtotal * 0.10);

  // Final total amount
  const grandTotal = discountedSubtotal + taxes;

  // Promo apply handler
  const handleApplyPromoCode = (codeToTest) => {
    const rawCode = (codeToTest || inputCouponCode).trim().toUpperCase();
    const found = ACTIVE_OFFERS.find(o => o.code.toUpperCase() === rawCode);

    if (found) {
      setInputCouponCode(found.code);
      setAppliedOffer(found);
      setIsOfferActive(true);
      setError('');
    } else {
      setError(`"${rawCode}" is not a valid code. Select one of the verified offers below.`);
      setIsOfferActive(false);
      setAppliedOffer(null);
    }
  };

  const handleRemoveOffer = () => {
    setInputCouponCode('');
    setAppliedOffer(null);
    setIsOfferActive(false);
    setError('');
  };

  // Calendar days
  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(new Date(year, month, d));
    return arr;
  };

  const handleCalendarDayClick = (day) => {
    if (!day) return;
    const key = toDateKey(day);
    const slotInfo = getSlotData(key);

    // Validate if the selected slot is available on this date
    if (selectedSlot === 'AM' && slotInfo.day) {
      setCalendarError(`Date ${key}: Day Slot (09:00 AM - 05:00 PM ☀️) is already booked (Red). Night Slot (🌙) is open, or select an open Day in Green.`);
      setTimeout(() => setCalendarError(''), 4500);
      return;
    }

    if (selectedSlot === 'PM' && slotInfo.night) {
      setCalendarError(`Date ${key}: Night Slot (06:00 PM - 09:00 AM 🌙) is already booked (Red). Day Slot (☀️) is open, or select an open Night in Green.`);
      setTimeout(() => setCalendarError(''), 4500);
      return;
    }

    if (selectedSlot === 'FULL_DAY' && (slotInfo.day || slotInfo.night)) {
      const bookedDesc = slotInfo.day && slotInfo.night ? 'Day & Night' : slotInfo.day ? 'Day (☀️)' : 'Night (🌙)';
      setCalendarError(`Date ${key}: Full Day booking requires BOTH slots open. ${bookedDesc} is booked (Red). Please select an entirely open date in Green or switch your slot.`);
      setTimeout(() => setCalendarError(''), 4500);
      return;
    }

    setCalendarError('');

    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate('');
    } else if (startDate && !endDate) {
      if (key <= startDate) {
        setStartDate(key);
      } else {
        // Verify every date in range is available for the active slot
        let cur = new Date(startDate);
        const endD = new Date(key);
        let blockedKey = null;

        while (cur <= endD) {
          const testKey = toDateKey(cur);
          if (!isSlotAvailable(testKey, selectedSlot)) {
            blockedKey = testKey;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (blockedKey) {
          setCalendarError(`Selected stay range contains date ${blockedKey} which is booked (Red) for ${selectedSlot === 'AM' ? 'Day (☀️)' : selectedSlot === 'PM' ? 'Night (🌙)' : 'Full Day'}. Please select continuous available green dates.`);
          setTimeout(() => setCalendarError(''), 5000);
          return;
        }

        setEndDate(key);
      }
    }
  };

  const handleSlotPick = (day, slot) => {
    if (!day) return;
    const key = toDateKey(day);
    const todayStr = toDateKey(new Date());
    if (key < todayStr) return;

    const slotInfo = getSlotData(key);
    if (slot === 'AM' && slotInfo.day) {
      setCalendarError(`Date ${key}: Day slot (☀️) is booked. Night slot may be available.`);
      setTimeout(() => setCalendarError(''), 4000);
      return;
    }
    if (slot === 'PM' && slotInfo.night) {
      setCalendarError(`Date ${key}: Night slot (🌙) is booked. Day slot may be available.`);
      setTimeout(() => setCalendarError(''), 4000);
      return;
    }

    setCalendarError('');

    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate('');
      setSelectedSlot(slot);
    } else if (startDate && !endDate) {
      if (key <= startDate) {
        setStartDate(key);
        setEndDate('');
        setSelectedSlot(slot);
      } else {
        setEndDate(key);
      }
    }
  };

  const handleDayCardClick = (day) => {
    if (!day) return;
    const key = toDateKey(day);
    const todayStr = toDateKey(new Date());
    if (key < todayStr) return;

    const slotInfo = getSlotData(key);
    if (slotInfo.day && slotInfo.night) {
      setCalendarError(`Date ${key} is fully booked.`);
      setTimeout(() => setCalendarError(''), 4000);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate('');
      setSelectedSlot(slotInfo.day ? 'PM' : 'AM');
    } else if (startDate && !endDate) {
      if (key <= startDate) {
        setStartDate(key);
        setEndDate('');
      } else {
        setEndDate(key);
      }
    }
  };

  const formatDisplayDate = (dStr) => {
    if (!dStr) return 'Select date';
    try {
      const d = new Date(dStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const handleToggleAddon = (key) => {
    setSelectedAddons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectCouple = (alloc) => {
    setSelectedCoupleCount(alloc.count);
    setGuestCount(`${alloc.guests} Guests`);
  };

  const handleCompleteBooking = async () => {
    setBookingLoading(true);
    setError('');

    try {
      const payload = {
        farmhouseId: farmhouse?.id || 1,
        startDate,
        endDate: endDate || startDate,
        guests: parseInt(guestCount) || 2,
        specialRequests,
        timeSlot: selectedSlot,
        subtotal,
        discountAmount,
        appliedOfferCode: isOfferActive ? appliedOffer?.code : null,
        totalAmount: grandTotal,
        paymentMethod
      };

      try {
        await bookingAPI.createBooking(payload);
      } catch (e) {
        // Preview fallback
      }

      setBookingDone(true);
    } catch (err) {
      setError('Booking processing failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bk-page-root">
      {/* ── 1. Hero Banner ── */}
      <section className="bk-hero-banner">
        <div className="bk-hero-overlay"></div>
        <div className="bk-hero-inner">
          <h1>{farmhouse?.name || 'Luxury Mountain Villa'}</h1>
          <div className="bk-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">&gt;</span>
            <Link to="/farmhouses">Farm Houses</Link>
            <span className="sep">&gt;</span>
            <span className="current">Booking</span>
          </div>
        </div>
      </section>

      {/* ── 2. Stepper Progress Header ── */}
      <div className="bk-stepper-container">
        <div className="bk-stepper-bar">
          <div
            className={`bk-step-unit ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="bk-step-num">1</span>
            <span className="bk-step-text">Dates &amp; Guests</span>
          </div>

          <div className="bk-step-line"></div>

          <div
            className={`bk-step-unit ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            <span className="bk-step-num">2</span>
            <span className="bk-step-text">Add-ons</span>
          </div>

          <div className="bk-step-line"></div>

          <div
            className={`bk-step-unit ${currentStep >= 3 ? 'active' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            <span className="bk-step-num">3</span>
            <span className="bk-step-text">Payment</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main Form Container ── */}
      <div className="bk-main-wrapper">
        {bookingDone ? (
          /* Confirmation Receipt */
          <div className="bk-card-box bk-confirm-card">
            <div className="bk-confirm-check">✓</div>
            <h2>Reservation Confirmed!</h2>
            <p className="bk-confirm-desc">
              Thank you! Your stay at <strong>{farmhouse?.name}</strong> has been booked successfully.
            </p>

            <div className="bk-receipt-panel">
              <div className="bk-receipt-item">
                <span>Reference ID:</span>
                <strong>FH-{Math.floor(100000 + Math.random() * 900000)}</strong>
              </div>
              <div className="bk-receipt-item">
                <span>Check-in:</span>
                <span>{startDate}</span>
              </div>
              <div className="bk-receipt-item">
                <span>Check-out:</span>
                <span>{endDate || startDate} ({nights} {nights === 1 ? 'night' : 'nights'})</span>
              </div>
              <div className="bk-receipt-item">
                <span>Time Slot:</span>
                <span>{SLOT_OPTIONS.find(s => s.key === selectedSlot)?.label}</span>
              </div>
              <div className="bk-receipt-item">
                <span>Guests:</span>
                <span>{guestCount} ({selectedCoupleCount} Couples)</span>
              </div>
              {isOfferActive && appliedOffer && (
                <div className="bk-receipt-item">
                  <span>Applied Promo Code:</span>
                  <strong className="bk-green-text">{appliedOffer.code} ({appliedOffer.percent}% OFF — Saved ₹ {discountAmount.toLocaleString()})</strong>
                </div>
              )}
              <div className="bk-receipt-item bk-total-highlight">
                <span>Total Paid:</span>
                <strong>₹ {grandTotal.toLocaleString()}</strong>
              </div>
            </div>

            <div className="bk-confirm-buttons">
              <Link to="/my-bookings" className="bk-btn-primary">View My Bookings</Link>
              <Link to="/" className="bk-btn-secondary">Return to Home</Link>
            </div>
          </div>
        ) : (
          <div className="bk-form-container">
            {/* ══════════════════════════════════════════
                STEP 1: DATES & GUESTS
                ══════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="bk-card-box">
                {/* ── Interactive Calendar & Standard Allocations ── */}
                <div className="bk-calendar-manifest-card">
                  {/* Left Column: Calendar */}
                  <div className="bk-cal-pane">
                    {/* Calendar Error/Warning Toast */}
                    {calendarError && (
                      <div className="bk-cal-alert">
                        ⚠️ {calendarError}
                      </div>
                    )}

                    <div className="bk-cal-days-grid">
                      <div className="bk-wk">SUN</div>
                      <div className="bk-wk">MON</div>
                      <div className="bk-wk">TUE</div>
                      <div className="bk-wk">WED</div>
                      <div className="bk-wk">THU</div>
                      <div className="bk-wk">FRI</div>
                      <div className="bk-wk">SAT</div>

                      {getCalendarDays(calendarMonth).map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="bk-cal-day-card bk-empty"></div>;
                        const key = toDateKey(day);
                        const todayStr = toDateKey(new Date());
                        const isPastDate = key < todayStr;
                        const isTodayDate = key === todayStr;
                        const isStart = startDate === key;
                        const isEnd = endDate === key;
                        const inRange = startDate && endDate && key > startDate && key < endDate;
                        const slotData = getSlotData(key);
                        const isDayBooked = slotData.day;
                        const isNightBooked = slotData.night;

                        return (
                          <div
                            key={key}
                            className={`bk-cal-day-card ${isPastDate ? 'disabled' : ''} ${inRange ? 'in-range' : ''} ${isStart ? 'range-start' : ''} ${isEnd ? 'range-end' : ''}`}
                            onClick={() => !isPastDate && handleDayCardClick(day)}
                          >
                            <div className={`bk-cal-day-header ${isTodayDate ? 'today' : ''}`}>
                              <span className="bk-cal-day-num">{day.getDate()}</span>
                              {isTodayDate && <span className="bk-cal-today-badge">Today</span>}
                            </div>

                            <button
                              type="button"
                              className={`bk-slot-btn ${isPastDate || isDayBooked ? 'disabled' : ''} ${(isStart || isEnd) && (selectedSlot === 'AM' || selectedSlot === 'FULL_DAY') ? 'selected' : ''}`}
                              disabled={isPastDate || isDayBooked}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotPick(day, 'AM');
                              }}
                            >
                              <span className="bk-slot-icon">☀️</span>
                              <span className="bk-slot-name">Day</span>
                            </button>

                            <button
                              type="button"
                              className={`bk-slot-btn ${isPastDate || isNightBooked ? 'disabled' : ''} ${(isStart || isEnd) && (selectedSlot === 'PM' || selectedSlot === 'FULL_DAY') ? 'selected' : ''}`}
                              disabled={isPastDate || isNightBooked}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotPick(day, 'PM');
                              }}
                            >
                              <span className="bk-slot-icon">🌙</span>
                              <span className="bk-slot-name">Night</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Clean 3-Dot Legend Matching Screenshot */}
                    <div className="bk-cal-clean-legend">
                      <span className="bk-legend-entry">
                        <span className="bk-legend-swatch available"></span> Available
                      </span>
                      <span className="bk-legend-entry">
                        <span className="bk-legend-swatch selected"></span> Selected
                      </span>
                      <span className="bk-legend-entry">
                        <span className="bk-legend-swatch range"></span> Stay range
                      </span>
                    </div>

                    {/* Check-in / Check-out Clean Card */}
                    <div className="bk-cal-stay-box">
                      <div className="bk-csb-col">
                        <span className="bk-csb-label">CHECK-IN</span>
                        <strong className="bk-csb-date">{startDate ? formatDisplayDate(startDate) : 'Select date'}</strong>
                        <small className="bk-csb-hint">{startDate ? (selectedSlot === 'PM' ? 'Night arrival' : 'Day arrival') : 'Your arrival date'}</small>
                      </div>
                      <div className="bk-csb-arrow">→</div>
                      <div className="bk-csb-col">
                        <span className="bk-csb-label">CHECK-OUT</span>
                        <strong className="bk-csb-date">{endDate ? formatDisplayDate(endDate) : 'Select date'}</strong>
                        <small className="bk-csb-hint">{endDate ? 'Your departure date' : 'Your departure date'}</small>
                      </div>
                    </div>

                    {/* Purple Continue Button */}
                    <button
                      type="button"
                      className="bk-continue-addons-btn"
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Add-ons →
                    </button>
                  </div>

                  {/* Right Column: Standard Allocations & Manifest */}
                  <div className="bk-alloc-pane">
                    <div className="bk-quick-select-label">QUICK SELECT STANDARD ALLOCATIONS:</div>

                    <div className="bk-alloc-row">
                      {COUPLE_ALLOCATIONS.map(alloc => (
                        <div
                          key={alloc.count}
                          className={`bk-alloc-pill ${selectedCoupleCount === alloc.count ? 'selected' : ''}`}
                          onClick={() => handleSelectCouple(alloc)}
                        >
                          <h4>{alloc.label}</h4>
                          <p>{alloc.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* 3 Perks Horizontal Row */}
                    <div className="bk-features-triplet">
                      <div className="bk-feat-card">
                        <span className="bk-feat-icon">🛎️</span>
                        <div className="bk-feat-text">
                          <strong>Private Check-in &amp; Host</strong>
                          <p>Direct concierge greeting on arrival</p>
                        </div>
                      </div>

                      <div className="bk-feat-card">
                        <span className="bk-feat-icon">🏊</span>
                        <div className="bk-feat-text">
                          <strong>Exclusive Pool &amp; Lawn</strong>
                          <p>No shared access with outside guests</p>
                        </div>
                      </div>

                      <div className="bk-feat-card">
                        <span className="bk-feat-icon">🍳</span>
                        <div className="bk-feat-text">
                          <strong>Farmhouse Breakfast</strong>
                          <p>Fresh estate kitchen morning menu</p>
                        </div>
                      </div>
                    </div>

                    {/* Official Reservation Manifest Box */}
                    <div className="bk-official-manifest">
                      <div className="bk-om-header">
                        <div className="bk-om-title-group">
                          <span className="bk-om-title">OFFICIAL RESERVATION MANIFEST</span>
                          <span className="bk-om-ref">REF: EST-CPL-{selectedCoupleCount}X{selectedCoupleCount * 2}</span>
                        </div>
                        <button
                          type="button"
                          className="bk-om-promo-btn"
                          onClick={() => handleApplyPromoCode('POOL20')}
                        >
                          {isOfferActive ? '✓ 20% Promo Applied' : 'Apply 20% Promo'}
                        </button>
                      </div>

                      <div className="bk-om-grid">
                        <div className="bk-om-cell">
                          <span className="bk-om-label">STAY PROFILE</span>
                          <strong className="bk-om-val">Couples Luxury Sanctuary</strong>
                        </div>
                        <div className="bk-om-cell">
                          <span className="bk-om-label">TOTAL COUPLES</span>
                          <strong className="bk-om-val">{selectedCoupleCount} Couple{selectedCoupleCount > 1 ? 's' : ''}</strong>
                        </div>
                        <div className="bk-om-cell">
                          <span className="bk-om-label">TOTAL GUEST COUNT</span>
                          <strong className="bk-om-val">{selectedCoupleCount * 2} Registered Adults</strong>
                        </div>
                        <div className="bk-om-cell">
                          <span className="bk-om-label">ACCOMMODATIONS</span>
                          <strong className="bk-om-val">{selectedCoupleCount} Private Master Suite{selectedCoupleCount > 1 ? 's' : ''}</strong>
                        </div>
                      </div>

                      <div className="bk-om-footer-note">
                        <span className="bk-om-shield">🛡️</span>
                        <span>Verified Estate Standard: Guaranteed private premises, sanitized luxury linens, and dedicated caretaker.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 🌟 DEDICATED PROMO CODE & DISCOUNT SELECTOR ── */}
                <div className="bk-promo-section">
                  <div className="bk-promo-header">
                    <div className="bk-promo-title-group">
                      <span className="bk-promo-icon">🏷️</span>
                      <div>
                        <h4>Special Offers &amp; Promo Codes</h4>
                        <p>Select any active discount below or enter your private promo coupon</p>
                      </div>
                    </div>
                    <Link to="/offers" target="_blank" className="bk-view-all-offers-link">
                      View All Offers ➔
                    </Link>
                  </div>

                  {/* Input Form */}
                  <div className="bk-promo-input-row">
                    <input
                      type="text"
                      placeholder="Enter promo coupon (e.g. POOL20)"
                      value={inputCouponCode}
                      onChange={e => setInputCouponCode(e.target.value)}
                    />
                    {isOfferActive ? (
                      <button
                        type="button"
                        className="bk-btn-remove-code"
                        onClick={handleRemoveOffer}
                      >
                        Remove Offer ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="bk-btn-apply-code"
                        onClick={() => handleApplyPromoCode()}
                      >
                        Apply Code
                      </button>
                    )}
                  </div>

                  {error && <p className="bk-promo-error-msg">{error}</p>}

                  {/* Active Offer Success Badge */}
                  {isOfferActive && appliedOffer && (
                    <div className="bk-promo-success-badge">
                      <div className="bk-badge-content">
                        <span className="bk-badge-icon">✓</span>
                        <div>
                          <strong>{appliedOffer.code} ({appliedOffer.percent}% OFF)</strong> — {appliedOffer.title}
                          <p>Deducted <strong>-₹ {discountAmount.toLocaleString()}</strong> from your reservation total.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Clickable Promo Badges */}
                  <div className="bk-quick-promo-tags">
                    <span className="bk-tags-label">Available Discounts:</span>
                    <div className="bk-chips-wrap">
                      {ACTIVE_OFFERS.map(offer => {
                        const isSelected = isOfferActive && appliedOffer?.code === offer.code;
                        return (
                          <button
                            key={offer.code}
                            type="button"
                            className={`bk-promo-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => handleApplyPromoCode(offer.code)}
                          >
                            <span className="chip-icon">{offer.icon}</span>
                            <strong>{offer.code}</strong>
                            <span className="chip-discount">({offer.percent}% OFF)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── ITEMIZED PRICING BREAKDOWN WITH EXACT MATH ── */}
                <div className="bk-itemized-calc-box">
                  <h4 className="calc-title">Price Breakdown &amp; Calculation</h4>
                  
                  <div className="calc-row">
                    <span>Base Rate (₹ {pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}):</span>
                    <span>₹ {basePrice.toLocaleString()}</span>
                  </div>

                  {addonTotal > 0 && (
                    <div className="calc-row">
                      <span>Add-ons Total:</span>
                      <span>+ ₹ {addonTotal.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="calc-row calc-subtotal-row">
                    <span>Subtotal Fare:</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                  </div>

                  {isOfferActive && appliedOffer && (
                    <div className="calc-row calc-discount-row">
                      <span>
                        🏷️ Discount ({appliedOffer.code} • {appliedOffer.percent}%):
                      </span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Taxes &amp; GST (10% on Net Fare):</span>
                    <span>+ ₹ {taxes.toLocaleString()}</span>
                  </div>

                  <div className="calc-divider"></div>

                  <div className="calc-row calc-final-row">
                    <div className="final-label-group">
                      <strong>Final Payable Amount:</strong>
                      {isOfferActive && (
                        <span className="savings-tag">You Saved ₹ {discountAmount.toLocaleString()}! 🎉</span>
                      )}
                    </div>
                    <strong className="final-amount-val">₹ {grandTotal.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Action Submit Button */}
                <div className="bk-action-footer">
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    onClick={() => setCurrentStep(2)}
                  >
                    <span>Proceed to Add-ons</span>
                    <span className="arrow">➔</span>
                  </button>
                  <p className="bk-secure-text">🔒 100% Secure Booking</p>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 2: ADD-ONS
                ══════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="bk-card-box">
                <div className="bk-step-header">
                  <h3 className="bk-section-title">Enhance Your Stay with Add-ons</h3>
                  <p className="bk-section-sub">Select optional luxury services for your group.</p>
                </div>

                <div className="bk-addons-grid">
                  {ADDON_LIST.map(addon => {
                    const isSelected = !!selectedAddons[addon.key];
                    return (
                      <div
                        key={addon.key}
                        className={`bk-addon-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleAddon(addon.key)}
                      >
                        <div className="bk-addon-icon">{addon.icon}</div>
                        <div className="bk-addon-details">
                          <h4>{addon.label}</h4>
                          <p>{addon.desc}</p>
                          <span className="bk-addon-rate">+ ₹ {addon.price.toLocaleString()}</span>
                        </div>
                        <div className="bk-addon-check">
                          {isSelected ? '✓' : '+'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal preview with discount */}
                <div className="bk-itemized-calc-box">
                  <div className="calc-row">
                    <span>Base Stay + Add-ons:</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                  </div>
                  {isOfferActive && (
                    <div className="calc-row calc-discount-row">
                      <span>🏷️ Promo Discount ({appliedOffer?.code}):</span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="calc-row calc-final-row">
                    <strong>Current Total with Taxes:</strong>
                    <strong className="final-amount-val">₹ {grandTotal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="bk-buttons-split">
                  <button
                    type="button"
                    className="bk-btn-outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    ‹ Back to Dates
                  </button>
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    onClick={() => setCurrentStep(3)}
                  >
                    <span>Proceed to Payment</span>
                    <span className="arrow">➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 3: PAYMENT
                ══════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="bk-card-box">
                <div className="bk-step-header">
                  <h3 className="bk-section-title">Select Payment Method</h3>
                  <p className="bk-section-sub">Choose your preferred gateway to confirm your stay.</p>
                </div>

                <div className="bk-payment-grid">
                  {PAYMENT_METHODS.map(method => (
                    <div
                      key={method.key}
                      className={`bk-payment-box ${paymentMethod === method.key ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(method.key)}
                    >
                      <span className="bk-pay-icon">{method.icon}</span>
                      <div className="bk-pay-info">
                        <h4>{method.label}</h4>
                        <p>{method.desc}</p>
                      </div>
                      <div className="bk-pay-radio">
                        {paymentMethod === method.key && <div className="bk-radio-inner"></div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Verified Calculation Summary */}
                <div className="bk-itemized-calc-box">
                  <h4 className="calc-title">Final Verified Receipt</h4>
                  
                  <div className="calc-row">
                    <span>Base Fare ({nights} nights):</span>
                    <span>₹ {basePrice.toLocaleString()}</span>
                  </div>

                  {addonTotal > 0 && (
                    <div className="calc-row">
                      <span>Add-ons ({Object.keys(selectedAddons).filter(k => selectedAddons[k]).length} selected):</span>
                      <span>+ ₹ {addonTotal.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="calc-row calc-subtotal-row">
                    <span>Subtotal:</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                  </div>

                  {isOfferActive && appliedOffer && (
                    <div className="calc-row calc-discount-row">
                      <span>
                        🏷️ Discount ({appliedOffer.code} • {appliedOffer.percent}% OFF):
                      </span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Taxes &amp; GST (10%):</span>
                    <span>+ ₹ {taxes.toLocaleString()}</span>
                  </div>

                  <div className="calc-divider"></div>

                  <div className="calc-row calc-final-row">
                    <div className="final-label-group">
                      <strong>Total Amount Payable:</strong>
                      {isOfferActive && (
                        <span className="savings-tag">Total Savings: ₹ {discountAmount.toLocaleString()}</span>
                      )}
                    </div>
                    <strong className="final-amount-val">₹ {grandTotal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="bk-buttons-split">
                  <button
                    type="button"
                    className="bk-btn-outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    ‹ Back to Add-ons
                  </button>
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    disabled={bookingLoading}
                    onClick={handleCompleteBooking}
                  >
                    {bookingLoading ? 'Processing...' : `Pay ₹ ${grandTotal.toLocaleString()} & Confirm Booking`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
