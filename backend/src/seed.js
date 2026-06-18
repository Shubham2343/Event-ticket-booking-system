require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Seat = require('./models/Seat');

const events = [
  {
    name: 'Rock Night Live',
    description: 'An electrifying evening of rock music featuring top bands from across the country.',
    date: new Date('2026-08-15T20:00:00'),
    venue: 'Madison Square Garden, New York',
    totalSeats: 40,
    category: 'Music',
  },
  {
    name: 'Comedy Gala 2026',
    description: 'A night full of laughs with stand-up comedians from around the world.',
    date: new Date('2026-09-05T19:00:00'),
    venue: 'The Comedy Store, Los Angeles',
    totalSeats: 30,
    category: 'Comedy',
  },
  {
    name: 'Tech Summit 2026',
    description: 'Explore the future of technology with industry leaders and innovators.',
    date: new Date('2026-07-20T09:00:00'),
    venue: 'Moscone Center, San Francisco',
    totalSeats: 50,
    category: 'Conference',
  },
  {
    name: 'Jazz Under the Stars',
    description: 'A serene outdoor jazz concert perfect for a summer evening.',
    date: new Date('2026-08-28T18:30:00'),
    venue: 'Central Park, New York',
    totalSeats: 36,
    category: 'Music',
  },
];

function generateSeats(eventId, totalSeats) {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let count = 0;

  for (const row of rows) {
    for (let num = 1; num <= 10 && count < totalSeats; num++) {
      seats.push({ eventId, seatNumber: `${row}${num}`, status: 'available' });
      count++;
    }
  }
  return seats;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Event.deleteMany({});
  await Seat.deleteMany({});

  for (const eventData of events) {
    const event = await Event.create(eventData);
    const seats = generateSeats(event._id, event.totalSeats);
    await Seat.insertMany(seats);
    console.log(`Created event "${event.name}" with ${seats.length} seats`);
  }

  console.log('Seeding complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
