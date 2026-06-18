import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SeatGrid from './SeatGrid';
import ReservationTimer from './ReservationTimer';
import './EventDetail.css';

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  const fetchEvent = useCallback(async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
      setSeats(res.data.seats);
    } catch {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Refresh seat statuses every 15 seconds
  useEffect(() => {
    if (!event) return;
    const interval = setInterval(fetchEvent, 15000);
    return () => clearInterval(interval);
  }, [event, fetchEvent]);

  const handleSeatToggle = (seat) => {
    if (reservation) return;
    if (seat.status !== 'available') return;

    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((s) => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) return;
    setError('');
    setReserving(true);
    try {
      const res = await api.post('/reserve', { eventId: id, seatNumbers: selectedSeats });
      setReservation(res.data.reservation);
      await fetchEvent();
      setSelectedSeats([]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reserve seats.';
      const unavailable = err.response?.data?.unavailableSeats;
      setError(unavailable
        ? `${msg} Unavailable: ${unavailable.join(', ')}`
        : msg
      );
      await fetchEvent();
      setSelectedSeats([]);
    } finally {
      setReserving(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!reservation) return;
    setError('');
    setBooking(true);
    try {
      const res = await api.post('/bookings', { reservationId: reservation._id });
      navigate('/booking-success/', { state: { booking: res.data.booking } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setReservation(null);
      await fetchEvent();
    } finally {
      setBooking(false);
    }
  };

  const handleReservationExpire = () => {
    setReservation(null);
    setError('Your reservation has expired. Please select seats again.');
    fetchEvent();
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!event) return <div className="page-center"><p>Event not found.</p></div>;

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate('/events/')}>← Back to events</button>

      <div className="event-detail-header card">
        <div className="event-detail-info">
          <h1 className="event-detail-title">{event.name}</h1>
          <p className="event-detail-desc">{event.description}</p>
          <div className="event-detail-meta">
            <span>📅 {formatDateTime(event.date)}</span>
            <span>📍 {event.venue}</span>
            <span>💺 {event.totalSeats} total seats</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '1rem 0' }}>{error}</div>}

      {reservation && (
        <ReservationTimer
          reservation={reservation}
          onExpire={handleReservationExpire}
          onConfirm={handleConfirmBooking}
          confirming={booking}
        />
      )}

      <div className="seat-section card">
        <div className="seat-section-header">
          <h2>Select Seats</h2>
          <div className="seat-legend">
            <span className="legend-item"><span className="legend-dot available" />Available</span>
            <span className="legend-item"><span className="legend-dot selected" />Selected</span>
            <span className="legend-item"><span className="legend-dot reserved" />Reserved</span>
            <span className="legend-item"><span className="legend-dot booked" />Booked</span>
          </div>
        </div>

        <div className="screen-indicator">
          <div className="screen-bar" />
          <span>STAGE / SCREEN</span>
        </div>

        <SeatGrid
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatToggle={handleSeatToggle}
          reservedByMe={reservation?.seatNumbers || []}
          disabled={!!reservation}
        />

        {!reservation && (
          <div className="reserve-bar">
            <p className="selected-label">
              {selectedSeats.length === 0
                ? 'Click on available seats to select them'
                : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected: ${selectedSeats.join(', ')}`}
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleReserve}
              disabled={selectedSeats.length === 0 || reserving}
            >
              {reserving ? <><span className="spinner-sm" /> Reserving...</> : 'Reserve Seats'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
