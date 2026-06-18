import React, { useState, useEffect } from 'react';
import './ReservationTimer.css';

export default function ReservationTimer({ reservation, onExpire, onConfirm, confirming }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.floor((new Date(reservation.expiresAt) - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const fraction = secondsLeft / 600;
  const urgent = secondsLeft <= 60;

  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference * (1 - fraction);

  return (
    <div className={`reservation-timer card ${urgent ? 'urgent' : ''}`}>
      <div className="timer-left">
        <svg className="timer-ring" width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--gray-200)" strokeWidth="4" />
          <circle
            cx="28" cy="28" r="22"
            fill="none"
            stroke={urgent ? 'var(--danger)' : 'var(--primary)'}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
          <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700"
            fill={urgent ? 'var(--danger)' : 'var(--primary)'}>
            {`${minutes}:${String(seconds).padStart(2, '0')}`}
          </text>
        </svg>
      </div>

      <div className="timer-info">
        <p className="timer-title">Seats reserved!</p>
        <p className="timer-seats">
          {reservation.seatNumbers.join(', ')}
        </p>
        <p className={`timer-countdown ${urgent ? 'urgent-text' : ''}`}>
          {urgent
            ? `Hurry! Only ${secondsLeft}s left`
            : `Reservation expires in ${minutes}m ${seconds}s`}
        </p>
      </div>

      <button
        className="btn btn-success btn-lg"
        onClick={onConfirm}
        disabled={confirming || secondsLeft === 0}
      >
        {confirming ? <><span className="spinner-sm" /> Processing...</> : 'Confirm Booking'}
      </button>
    </div>
  );
}
