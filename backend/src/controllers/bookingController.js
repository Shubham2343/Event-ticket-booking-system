const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const Booking = require('../models/Booking');
const HttpError = require('../utils/HttpError');
const { withTransaction } = require('../utils/withTransaction');

exports.createBooking = async (req, res, next) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ message: 'reservationId is required' });
  }

  const reservation = await Reservation.findOne({
    _id: reservationId,
    userId: req.user._id,
    status: 'active',
  });

  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found or does not belong to you' });
  }

  if (reservation.expiresAt < new Date()) {
    await Reservation.findByIdAndUpdate(reservationId, { status: 'expired' });
    return res.status(410).json({ message: 'Reservation has expired. Please reserve again.' });
  }

  try {
    const booking = await withTransaction(async (session) => {
      // Confirm all reserved seats still belong to this user's reservation
      const seats = await Seat.find({
        eventId: reservation.eventId,
        seatNumber: { $in: reservation.seatNumbers },
        status: 'reserved',
        reservedBy: req.user._id,
      }).session(session);

      if (seats.length !== reservation.seatNumbers.length) {
        throw new HttpError(409, 'Seat reservation mismatch — please try again');
      }

      await Seat.updateMany(
        { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, reservedBy: req.user._id },
        { $set: { status: 'booked', reservationExpiry: null } },
        { session }
      );

      await Reservation.findByIdAndUpdate(reservationId, { status: 'converted' }, { session });

      const created = await Booking.create(
        [
          {
            userId: req.user._id,
            eventId: reservation.eventId,
            reservationId: reservation._id,
            seatNumbers: reservation.seatNumbers,
          },
        ],
        { session }
      );

      return created[0];
    });

    const populated = await Booking.findById(booking._id).populate('eventId');
    res.status(201).json({ booking: populated });
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message, ...err.extra });
    }
    next(err);
  }
};

exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('eventId')
    .sort({ createdAt: -1 });

  res.json({ bookings });
};
