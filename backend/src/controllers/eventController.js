const Event = require('../models/Event');
const Seat = require('../models/Seat');

exports.getAllEvents = async (req, res) => {
  const events = await Event.find().sort({ date: 1 });

  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const available = await Seat.countDocuments({ eventId: event._id, status: 'available' });
      const reserved = await Seat.countDocuments({ eventId: event._id, status: 'reserved' });
      const booked = await Seat.countDocuments({ eventId: event._id, status: 'booked' });
      return { ...event.toObject(), availableSeats: available, reservedSeats: reserved, bookedSeats: booked };
    })
  );

  res.json({ events: eventsWithCounts });
};

exports.getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const seats = await Seat.find({ eventId: event._id }).sort({ seatNumber: 1 });

  res.json({ event, seats });
};
