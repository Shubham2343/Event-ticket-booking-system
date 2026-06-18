import React from 'react';
import './SeatGrid.css';

export default function SeatGrid({ seats, selectedSeats, onSeatToggle, reservedByMe, disabled }) {
  const rows = {};
  seats.forEach((seat) => {
    const row = seat.seatNumber.replace(/[0-9]/g, '');
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });

  Object.values(rows).forEach((r) =>
    r.sort((a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1)))
  );

  const getSeatState = (seat) => {
    if (reservedByMe.includes(seat.seatNumber)) return 'my-reservation';
    if (selectedSeats.includes(seat.seatNumber)) return 'selected';
    return seat.status;
  };

  const getSeatTitle = (seat) => {
    const state = getSeatState(seat);
    const labels = {
      available: 'Available',
      selected: 'Selected — click to deselect',
      reserved: 'Reserved by someone',
      booked: 'Already booked',
      'my-reservation': 'Your reservation',
    };
    return `${seat.seatNumber} — ${labels[state] || state}`;
  };

  return (
    <div className="seat-grid">
      {Object.entries(rows).map(([rowLabel, rowSeats]) => (
        <div key={rowLabel} className="seat-row">
          <span className="row-label">{rowLabel}</span>
          <div className="row-seats">
            {rowSeats.map((seat) => {
              const state = getSeatState(seat);
              const clickable = !disabled && (state === 'available' || state === 'selected');
              return (
                <button
                  key={seat._id}
                  className={`seat seat-${state}`}
                  onClick={() => clickable && onSeatToggle(seat)}
                  title={getSeatTitle(seat)}
                  disabled={!clickable}
                  aria-label={getSeatTitle(seat)}
                >
                  <span className="seat-num">{seat.seatNumber.slice(1)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
