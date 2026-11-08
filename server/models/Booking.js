const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [String], // VD ["A1","A2"]
    totalPrice: Number,
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);
// TODO: chống đặt trùng ghế (kiểm tra ở controller + trả 409)

module.exports = mongoose.model('Booking', bookingSchema);
