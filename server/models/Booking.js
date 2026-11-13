const mongoose = require('mongoose');
const { MAX_SEATS_PER_BOOKING } = require('../utils/seatMap');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    seats: {
      type: [String], // Ví dụ ["A1", "A2"]
      validate: {
        validator: (list) => list.length >= 1 && list.length <= MAX_SEATS_PER_BOOKING,
        message: `Mỗi lần đặt từ 1 đến ${MAX_SEATS_PER_BOOKING} ghế`,
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Tổng tiền không hợp lệ'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ showtime: 1 });

// Chống đặt trùng ghế do collection Ticket đảm nhiệm
// (unique index { showtime, seatNumber } trên vé còn hiệu lực).

module.exports = mongoose.model('Booking', bookingSchema);