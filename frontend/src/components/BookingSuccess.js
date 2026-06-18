import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './BookingSuccess.css';

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="page-center">
        <div className="text-center">
          <p>No booking details found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/events/')} style={{ marginTop: '1rem' }}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="success-wrapper">
        <div className="success-card card">
          <div className="success-icon-wrap">
            <div className="success-circle">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M8 20L16 28L32 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <h1 className="success-title">Booking Confirmed!</h1>
          <p className="success-subtitle">Your tickets have been reserved. Enjoy the event!</p>

          <div className="booking-details">
            <h2 className="details-title">Booking Details</h2>

            <div className="detail-row">
              <span className="detail-label">Event</span>
              <span className="detail-value">{booking.eventId?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date & Time</span>
              <span className="detail-value">{formatDateTime(booking.eventId?.date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Venue</span>
              <span className="detail-value">{booking.eventId?.venue}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Seats</span>
              <span className="detail-value seats-value">{booking.seatNumbers.join(', ')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Booking ID</span>
              <span className="detail-value booking-id">{booking._id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="badge badge-success">Confirmed</span>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/my-bookings/" className="btn btn-outline">View All Bookings</Link>
            <Link to="/events/" className="btn btn-primary">Browse More Events</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
