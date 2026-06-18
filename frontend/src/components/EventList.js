import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './EventList.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

const categoryColors = {
  Music: 'badge-primary',
  Comedy: 'badge-warning',
  Conference: 'badge-success',
  General: 'badge-primary',
};

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data.events))
      .catch(() => setError('Failed to load events. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  const totalEvents = events.length;
  const totalAvailable = events.reduce((sum, e) => sum + (e.availableSeats || 0), 0);
  const totalVenues = new Set(events.map((e) => e.venue)).size;

  const scrollToEvents = () => {
    document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-blob hero-blob-1" />
          <span className="hero-blob hero-blob-2" />

          {/* 3D Animated Cubes */}
          <div className="hero-3d-container">
            <div className="cube cube-1" />
            <div className="cube cube-2" />
            <div className="cube cube-3" />
            <div className="cube cube-4" />
          </div>
        </div>
        <div className="container hero-inner">
          <span className="hero-badge">🎉 Live events near you</span>
          <h1 className="hero-title">
            Book your seat to the<br />
            <span className="hero-highlight">moments that matter</span>
          </h1>
          <p className="hero-subtitle">
            Concerts, comedy, conferences and more — pick your perfect seat,
            reserve it instantly, and skip the queue.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={scrollToEvents}>
              Browse Events
            </button>
            <a href="#how-it-works" className="btn btn-outline btn-lg hero-secondary">
              How it works
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{totalEvents}</span>
              <span className="hero-stat-label">Live Events</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{totalAvailable}</span>
              <span className="hero-stat-label">Seats Available</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{totalVenues}</span>
              <span className="hero-stat-label">Venues</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="events-header" id="events-grid">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="page-subtitle">Reserve your seats before they sell out</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

      <div className="events-grid">
        {events.map((event) => {
          const soldOut = event.availableSeats === 0;
          return (
            <div key={event._id} className={`event-card card ${soldOut ? 'sold-out' : ''}`}>
              <div className="event-card-body">
                <div className="event-card-top">
                  <span className={`badge ${categoryColors[event.category] || 'badge-primary'}`}>
                    {event.category}
                  </span>
                  {soldOut && <span className="badge badge-danger">Sold Out</span>}
                </div>

                <h2 className="event-name">{event.name}</h2>
                <p className="event-description">{event.description}</p>

                <div className="event-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">⏰</span>
                    <span>{formatTime(event.date)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="seat-bar">
                  <div className="seat-bar-track">
                    <div
                      className="seat-bar-booked"
                      style={{ width: `${(event.bookedSeats / event.totalSeats) * 100}%` }}
                    />
                    <div
                      className="seat-bar-reserved"
                      style={{ width: `${(event.reservedSeats / event.totalSeats) * 100}%` }}
                    />
                  </div>
                  <span className="seat-count">
                    {event.availableSeats} / {event.totalSeats} available
                  </span>
                </div>
              </div>

              <div className="event-card-footer">
                <Link
                  to={`/events/${event._id}/`}
                  className={`btn btn-primary ${soldOut ? 'disabled-link' : ''}`}
                  style={soldOut ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                >
                  {soldOut ? 'Sold Out' : 'Select Seats →'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && !error && (
        <div className="empty-state">
          <p>No events available at the moment.</p>
        </div>
      )}
      </div>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="how-header">
            <span className="how-eyebrow">Simple &amp; secure</span>
            <h2 className="how-title">How it works</h2>
            <p className="how-subtitle">From browsing to booking in three easy steps</p>
          </div>

          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-icon">🎫</div>
              <span className="how-step-num">01</span>
              <h3 className="how-step-title">Pick an event</h3>
              <p className="how-step-text">
                Browse concerts, comedy, and conferences. Open any event to see a
                live, color-coded seat map.
              </p>
            </div>

            <div className="how-step">
              <div className="how-step-icon">⏱️</div>
              <span className="how-step-num">02</span>
              <h3 className="how-step-title">Reserve your seats</h3>
              <p className="how-step-text">
                Select the seats you want and lock them in. They're held just for
                you with a 10-minute countdown.
              </p>
            </div>

            <div className="how-step">
              <div className="how-step-icon">✅</div>
              <span className="how-step-num">03</span>
              <h3 className="how-step-title">Confirm &amp; go</h3>
              <p className="how-step-text">
                Confirm your booking before the timer runs out. No double-bookings,
                no surprises — your seats are guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
