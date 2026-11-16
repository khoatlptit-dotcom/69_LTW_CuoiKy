require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const moviesData = require('./movies.json');

const placeholder = (title) =>
  `https://placehold.co/300x450?text=${encodeURIComponent(title)}`;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Movie, Room, Showtime, Booking].map((M) => M.deleteMany({})));

  const password = await bcrypt.hash('123456', 10);
  await User.create([
    { name: 'Admin', email: 'admin@cinema.com', password, role: 'admin' },
    { name: 'Thành viên', email: 'user@cinema.com', password, role: 'member' },
  ]);

  const movies = await Movie.insertMany(
    moviesData.map((m) => ({ ...m, poster: m.poster || placeholder(m.title), trailerUrl: m.trailerUrl || '' }))
  );

  const rooms = await Room.insertMany([
    { name: 'Phòng 1', rows: 8, seatsPerRow: 10, vipRows: [5, 6] },
    { name: 'Phòng 2', rows: 6, seatsPerRow: 8, vipRows: [4] },
  ]);

  const nowMovies = movies.filter((m) => m.status === 'now');
  const showtimes = [];
  let i = 0;
  for (let day = 0; day < 7; day++) {
    for (const room of rooms) {
      for (const hour of [9, 13, 17, 21]) {
        const movie = nowMovies[i++ % nowMovies.length];
        const start = new Date();
        start.setDate(start.getDate() + day);
        start.setHours(hour, 0, 0, 0);
        showtimes.push({
          movie: movie._id,
          room: room._id,
          startTime: start,
          endTime: new Date(start.getTime() + movie.duration * 60000),
        });
      }
    }
  }
  await Showtime.insertMany(showtimes);

  console.log(`Seed xong: ${movies.length} phim, ${rooms.length} phòng, ${showtimes.length} suất chiếu`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});