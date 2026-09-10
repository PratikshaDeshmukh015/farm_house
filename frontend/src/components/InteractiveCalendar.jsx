import React from 'react';
import './InteractiveCalendar.css';

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function InteractiveCalendar({
  startDate,
  endDate,
  timeSlot,
  setStartDate,
  setEndDate,
  setTimeSlot,
  today,
}) {
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());

  React.useEffect(() => {
    const selectedDate = startDate || endDate;
    if (selectedDate) {
      const date = new Date(`${selectedDate}T00:00:00`);
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [startDate, endDate]);

  const days = React.useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [calendarMonth]);

  const handleSlotClick = (date, slot) => {
    const dateKey = toDateKey(date);
    if (!startDate) {
      setStartDate(dateKey);
      setTimeSlot(slot);
      setEndDate('');
    } else if (startDate && !endDate) {
      if (dateKey <= startDate) {
        alert('Check‑out must be after check‑in');
        return;
      }
      setEndDate(dateKey);
    } else {
      setStartDate(dateKey);
      setTimeSlot(slot);
      setEndDate('');
    }
  };

  const isPast = (date) => toDateKey(date) < today;
  const isStart = (date) => startDate === toDateKey(date);
  const isEnd = (date) => endDate === toDateKey(date);
  const isBetween = (date) => startDate && endDate && toDateKey(date) > startDate && toDateKey(date) < endDate;
  const isToday = (date) => toDateKey(date) === today;

  return (
    <div className="interactive-calendar">
      <div className="calendar-heading">
        <div>
          <span className="calendar-eyebrow">Availability calendar</span>
          <h3>Select your dates</h3>
        </div>
        <span className="calendar-step">{startDate && !endDate ? 'Step 2 of 2' : 'Step 1 of 2'}</span>
      </div>
      <div className="calendar-toolbar">
        <button type="button" className="nav" aria-label="Previous month" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</button>
        <strong>{calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className="nav" aria-label="Next month" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
      </div>
      <p className="calendar-instruction">
        {startDate && !endDate ? 'Now choose your check-out date' : 'Choose a check-in date to begin'}
      </p>
      <div className="calendar-grid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="weekday">{d}</div>)}
        {days.map((date, idx) => (
          <div key={idx} className={`day-cell ${date && isBetween(date) ? 'in-range' : ''} ${date && isStart(date) ? 'range-start' : ''} ${date && isEnd(date) ? 'range-end' : ''}`}>
            {date && (
              <>
                <div className={`day-number ${isToday(date) ? 'today' : ''}`}>
                  <span>{date.getDate()}</span>{isToday(date) && <small>Today</small>}
                </div>
                <button
                  type="button"
                  className={`slot ${isPast(date) ? 'disabled' : ''} ${isStart(date) && timeSlot === 'AM' ? 'selected' : ''}`}
                  disabled={isPast(date)}
                  onClick={() => handleSlotClick(date, 'AM')}
                >
                  <span>☀</span> Day
                </button>
                <button
                  type="button"
                  className={`slot ${isPast(date) ? 'disabled' : ''} ${isStart(date) && timeSlot === 'PM' ? 'selected' : ''}`}
                  disabled={isPast(date)}
                  onClick={() => handleSlotClick(date, 'PM')}
                >
                  <span>☾</span> Night
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <span><i className="legend-swatch available" /> Available</span>
        <span><i className="legend-swatch selected" /> Selected</span>
        <span><i className="legend-swatch range" /> Stay range</span>
      </div>
      <div className="selected-info">
        <div className={`selected-date ${startDate ? 'filled' : ''}`}>
          <span>Check-in</span>
          <strong>{startDate || 'Select date'}</strong>
          <small>{startDate ? (timeSlot === 'PM' ? 'Night arrival' : 'Day arrival') : 'Your arrival date'}</small>
        </div>
        <span className="selected-arrow">→</span>
        <div className={`selected-date ${endDate ? 'filled' : ''}`}>
          <span>Check-out</span>
          <strong>{endDate || 'Select date'}</strong>
          <small>{endDate ? 'Departure date' : 'Your departure date'}</small>
        </div>
      </div>
    </div>
  );
}
