const mongoose = require('mongoose');

const MAX_SEATS = 8;

const seatLockSchema = new mongoose.Schema(
  {
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seatNumbers: {
      type: [String],
      validate: {
        validator: (seats) => seats.length >= 1 && seats.length <= MAX_SEATS,
        message: `Phải giữ từ 1 đến ${MAX_SEATS} ghế`,
      },
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB tự xóa phiên hết hạn, nhưng chỉ quét khoảng mỗi 60 giây.
// Vì vậy mọi truy vấn nghiệp vụ vẫn phải lọc expiresAt > thời gian hiện tại.
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mỗi người chỉ có một phiên giữ ghế trên mỗi suất chiếu.
seatLockSchema.index({ showtime: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('SeatLock', seatLockSchema);
module.exports.MAX_SEATS = MAX_SEATS;