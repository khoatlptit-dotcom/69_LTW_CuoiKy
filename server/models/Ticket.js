const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]+[0-9]+$/, 'Mã ghế không hợp lệ (ví dụ: A1, B12)'],
    },
    seatType: {
      type: String,
      enum: ['normal', 'vip'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['valid', 'cancelled'],
      default: 'valid',
    },
  },
  { timestamps: true }
);

// Mỗi ghế của một suất chiếu chỉ có tối đa một vé còn hiệu lực.
// Vé đã hủy không bị khóa nên ghế đó bán lại được.
ticketSchema.index(
  { showtime: 1, seatNumber: 1 },
  { unique: true, partialFilterExpression: { status: 'valid' } }
);

module.exports = mongoose.model('Ticket', ticketSchema);