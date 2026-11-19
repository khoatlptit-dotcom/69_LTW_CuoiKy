const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  priceNormal: { type: Number, default: 80000 },
  priceVip: { type: Number, default: 120000 },
});
showtimeSchema.index({ room: 1, startTime: 1, endTime: 1 });
module.exports = mongoose.model('Showtime', showtimeSchema);
