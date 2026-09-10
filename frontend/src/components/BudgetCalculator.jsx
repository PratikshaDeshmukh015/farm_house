import React, { useState, useEffect } from 'react';
import { farmhouseAPI } from '../api/axiosInstance';

function BudgetCalculator() {
  const [farmhouses, setFarmhouses] = useState([]);
  const [selectedFhId, setSelectedFhId] = useState('');
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [budgetCap, setBudgetCap] = useState(25000);
  const [addons, setAddons] = useState({
    bbq: false,
    bonfire: false,
    catering: false,
    guide: false,
    dj: false,
  });

  const addonPrices = {
    bbq: 1000,
    bonfire: 1500,
    catering: 1800, // per guest per day
    guide: 2500,
    dj: 4000,
  };

  useEffect(() => {
    const fetchFhs = async () => {
      try {
        const response = await farmhouseAPI.getAllFarmHouses(0, 100);
        if (response.data.success && response.data.farmhouses.length > 0) {
          setFarmhouses(response.data.farmhouses);
          setSelectedFhId(response.data.farmhouses[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching farmhouses for calculator:', err);
      }
    };
    fetchFhs();
  }, []);

  const handleAddonChange = (key) => {
    setAddons((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [discountPercent, setDiscountPercent] = useState(0);

  const selectedFh = farmhouses.find((f) => f.id.toString() === selectedFhId);
  const pricePerDay = selectedFh ? selectedFh.pricePerDay : 0;
  const maxGuests = selectedFh ? selectedFh.maxGuests : 10;

  // Calculate costs
  const baseCost = pricePerDay * nights;
  
  let cateringCost = 0;
  if (addons.catering) {
    cateringCost = addonPrices.catering * guests * nights;
  }

  const flatAddonsCost = 
    (addons.bbq ? addonPrices.bbq : 0) +
    (addons.bonfire ? addonPrices.bonfire : 0) +
    (addons.guide ? addonPrices.guide : 0) +
    (addons.dj ? addonPrices.dj : 0);

  const rawSubtotal = baseCost + cateringCost + flatAddonsCost;
  const discountAmount = discountPercent > 0 ? Math.round((baseCost * discountPercent) / 100) : 0;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const taxes = Math.round(subtotal * 0.18); // 18% GST
  const serviceFee = Math.round(subtotal * 0.05); // 5% booking fee
  const grandTotal = subtotal + taxes + serviceFee;

  const budgetPercent = Math.min((grandTotal / budgetCap) * 100, 100);
  const isOverBudget = grandTotal > budgetCap;

  return (
    <div className="budget-calculator-card">
      <div className="calc-header">
        <h3>💰 Live Budget Planner & Estimator</h3>
        <p>Customize your stay and calculate real-time estimated rates.</p>
      </div>

      <div className="calc-grid">
        {/* Settings Column */}
        <div className="calc-settings">
          <div className="form-group">
            <label htmlFor="farmhouse-select">Select Farmhouse</label>
            <select
              id="farmhouse-select"
              value={selectedFhId}
              onChange={(e) => setSelectedFhId(e.target.value)}
            >
              {farmhouses.map((fh) => (
                <option key={fh.id} value={fh.id}>
                  {fh.name} (₹{fh.pricePerDay}/night) - {fh.location}
                </option>
              ))}
            </select>
          </div>

          <div className="calc-sliders">
            <div className="slider-group">
              <div className="slider-label">
                <span>Nights: {nights}</span>
                <span>(Max 15)</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value))}
                className="calc-range-input"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Guests: {guests}</span>
                <span>(Max: {maxGuests})</span>
              </div>
              <input
                type="range"
                min="1"
                max={maxGuests}
                value={guests > maxGuests ? maxGuests : guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="calc-range-input"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Your Budget Target: ₹{budgetCap.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={budgetCap}
                onChange={(e) => setBudgetCap(parseInt(e.target.value))}
                className="calc-range-input budget-cap-slider"
              />
            </div>
          </div>

          {/* Add-ons List */}
          <div className="calc-addons">
            <h4>Select Extra Vibe Packages:</h4>
            <div className="addons-grid">
              <label className={`addon-item ${addons.bbq ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.bbq}
                  onChange={() => handleAddonChange('bbq')}
                />
                <div className="addon-info">
                  <span>🍖 BBQ Grill setup</span>
                  <small>+ ₹{addonPrices.bbq}</small>
                </div>
              </label>

              <label className={`addon-item ${addons.bonfire ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.bonfire}
                  onChange={() => handleAddonChange('bonfire')}
                />
                <div className="addon-info">
                  <span>🔥 Bonfire night</span>
                  <small>+ ₹{addonPrices.bonfire}</small>
                </div>
              </label>

              <label className={`addon-item ${addons.catering ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.catering}
                  onChange={() => handleAddonChange('catering')}
                />
                <div className="addon-info">
                  <span>🍳 Private Chef & Catering</span>
                  <small>+ ₹{addonPrices.catering}/day/guest</small>
                </div>
              </label>

              <label className={`addon-item ${addons.guide ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.guide}
                  onChange={() => handleAddonChange('guide')}
                />
                <div className="addon-info">
                  <span>🗺️ Local Guide & Trekking</span>
                  <small>+ ₹{addonPrices.guide}</small>
                </div>
              </label>

              <label className={`addon-item ${addons.dj ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.dj}
                  onChange={() => handleAddonChange('dj')}
                />
                <div className="addon-info">
                  <span>🎵 Party DJ & Sound Set</span>
                  <small>+ ₹{addonPrices.dj}</small>
                </div>
              </label>
            </div>
          </div>

          {/* Discount Offer Selector */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#14532d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>🏷️</span> Apply Discount Offer
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
              {[0, 10, 15, 20, 25].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: discountPercent === pct ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: discountPercent === pct ? '#dcfce7' : '#ffffff',
                    color: discountPercent === pct ? '#15803d' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pct === 0 ? 'No Discount' : `${pct}% OFF`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Summary Column */}
        <div className="calc-invoice glass-morphism">
          <h4>Estimate Receipt</h4>
          
          <div className="invoice-details">
            <div className="invoice-row">
              <span>Base Stay ({nights} nights)</span>
              <span>₹{(pricePerDay * nights).toLocaleString()}</span>
            </div>
            {addons.catering && (
              <div className="invoice-row">
                <span>Catering ({guests} guests × {nights} nights)</span>
                <span>₹{cateringCost.toLocaleString()}</span>
              </div>
            )}
            {flatAddonsCost > 0 && (
              <div className="invoice-row">
                <span>Experience Addons</span>
                <span>₹{flatAddonsCost.toLocaleString()}</span>
              </div>
            )}
            
            {discountPercent > 0 && discountAmount > 0 && (
              <div className="invoice-row" style={{ color: '#16a34a', fontWeight: 700 }}>
                <span>🏷️ Offer ({discountPercent}% OFF)</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <hr />

            <div className="invoice-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="invoice-row text-muted">
              <span>GST / Luxury Tax (18%)</span>
              <span>₹{taxes.toLocaleString()}</span>
            </div>
            <div className="invoice-row text-muted">
              <span>Booking Service Fee (5%)</span>
              <span>₹{serviceFee.toLocaleString()}</span>
            </div>

            <hr />

            <div className="invoice-row grand-total">
              <span>Estimated Total</span>
              <span className="price-tag">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="budget-progress-container">
            <div className="progress-labels">
              <span>Budget Usage</span>
              <span className={isOverBudget ? 'text-danger' : 'text-success'}>
                {Math.round((grandTotal / budgetCap) * 100)}%
              </span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${isOverBudget ? 'over' : ''}`}
                style={{ width: `${budgetPercent}%` }}
              ></div>
            </div>
            {isOverBudget ? (
              <div className="budget-alert warn">
                ⚠️ Over your budget cap by ₹{(grandTotal - budgetCap).toLocaleString()}! Consider opting out of some premium addons or reducing stay duration.
              </div>
            ) : (
              <div className="budget-alert success">
                ✅ Looking good! Stay is within your target budget.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetCalculator;
