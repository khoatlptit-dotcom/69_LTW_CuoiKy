require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ role: 'member' });
  const showtimes = await Showtime.find().limit(30);
  if (!user || showtimes.length === 0) throw new Error('Chạy npm run seed trước');
  await Booking.deleteMany({});

  const docs = [];
  showtimes.forEach((st, i) => {
    for (let b = 0; b < 1 + (i % 3); b++) {
      const seats = Array.from({ length: 1 + b }, (_, k) => `${String.fromCharCode(65 + b)}${k + 1}`);
      docs.push({
        user: user._id,
        showtime: st._id,
        seats,
        totalPrice: seats.length * st.priceNormal,
        status: (i + b) % 7 === 0 ? 'cancelled' : 'confirmed',
        createdAt: new Date(Date.now() - ((i + b * 5) % 14) * 86400000),
      });
    }
  });
  await Booking.create(docs);

  const cancelled = docs.filter((d) => d.status === 'cancelled').length;
  console.log(`Đã tạo ${docs.length} booking mẫu (${docs.length - cancelled} confirmed, ${cancelled} cancelled)`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});