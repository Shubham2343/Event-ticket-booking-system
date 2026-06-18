import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MyBookings.css';

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookings/my')
      .then((res) => setBookings(res.data.bookings))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">All your confirmed event tickets</p>

      {error && <div className="alert alert-error">{error}</div>}

      {bookings.length === 0 && !error ? (
        <div className="empty-bookings card">
          <div className="empty-icon">🎟</div>
          <p className="empty-text">You haven't booked any tickets yet.</p>
          <a href="/events/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Events</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-item card">
              <div className="booking-header">
                <div>
                  <h2 className="booking-event-name">{booking.eventId?.name}</h2>
                  <p className="booking-venue">{booking.eventId?.venue}</p>
                </div>
                <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'danger'}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-meta">
                <div className="booking-meta-item">
                  <span className="meta-label">Event Date</span>
                  <span className="meta-val">{formatDateTime(booking.eventId?.date)}</span>
                </div>
                <div className="booking-meta-item">
                  <span className="meta-label">Seats</span>
                  <span className="meta-val seats-highlight">{booking.seatNumbers.join(', ')}</span>
                </div>
                <div className="booking-meta-item">
                  <span className="meta-label">Booked On</span>
                  <span className="meta-val">{formatDateTime(booking.createdAt)}</span>
                </div>
                <div className="booking-meta-item">
                  <span className="meta-label">Booking ID</span>
                  <span className="meta-val booking-id">{booking._id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
