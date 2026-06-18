const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const Event = require('../models/Event');
const HttpError = require('../utils/HttpError');
const { withTransaction } = require('../utils/withTransaction');

exports.createReservation = async (req, res, next) => {
  const { eventId, seatNumbers } = req.body;

  if (!eventId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ message: 'eventId and seatNumbers are required' });
  }

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (new Date(event.date) < new Date()) {
    return res.status(400).json({ message: 'Cannot reserve seats for past events' });
  }

  try {
    const result = await withTransaction(async (session) => {
      const now = new Date();

      // Release any expired reservations for these seats first
      await Seat.updateMany(
        { eventId, seatNumber: { $in: seatNumbers }, status: 'reserved', reservationExpiry: { $lt: now } },
        { $set: { status: 'available', reservedBy: null, reservationExpiry: null } },
        { session }
      );

      const seats = await Seat.find({ eventId, seatNumber: { $in: seatNumbers } }).session(session);

      if (seats.length !== seatNumbers.length) {
        throw new HttpError(404, 'One or more seats not found for this event');
      }

      const unavailable = seats.filter((s) => s.status !== 'available');
      if (unavailable.length > 0) {
        throw new HttpError(409, 'Some seats are no longer available', {
          unavailableSeats: unavailable.map((s) => s.seatNumber),
        });
      }

      const expiryMinutes = parseInt(process.env.RESERVATION_EXPIRY_MINUTES || '10', 10);
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Atomic conditional update — only seats still 'available' are updated.
      // This is the core double-booking guard: concurrent requests cannot both
      // win because the second one's modifiedCount will fall short.
      const updateResult = await Seat.updateMany(
        { eventId, seatNumber: { $in: seatNumbers }, status: 'available' },
        { $set: { status: 'reserved', reservedBy: req.user._id, reservationExpiry: expiresAt } },
        { session }
      );

      if (updateResult.modifiedCount !== seatNumbers.length) {
        throw new HttpError(409, 'Failed to reserve all seats — some were taken concurrently');
      }

      const created = await Reservation.create(
        [{ userId: req.user._id, eventId, seatNumbers, expiresAt }],
        { session }
      );

      return { reservation: created[0], expiresAt };
    });

    res.status(201).json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message, ...err.extra });
    }
    next(err);
  }
};

exports.getMyReservations = async (req, res) => {
  const reservations = await Reservation.find({ userId: req.user._id, status: 'active' })
    .populate('eventId')
    .sort({ expiresAt: 1 });

  const now = new Date();
  const active = reservations.filter((r) => r.expiresAt > now);
  res.json({ reservations: active });
};
