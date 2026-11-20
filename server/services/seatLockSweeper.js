const SeatLock = require('../models/SeatLock');
const { emitSeatEvent } = require('../utils/realtime');

const SWEEP_INTERVAL_MS = 10 * 1000;

// Xóa các phiên giữ ghế đã hết hạn và báo cho các trình duyệt đang xem suất chiếu đó.
// Truyền showtimeId để chỉ dọn một suất chiếu.
const sweepExpiredLocks = async (showtimeId) => {
  const filter = { expiresAt: { $lte: new Date() } };
  if (showtimeId) filter.showtime = showtimeId;

  const expired = await SeatLock.find(filter);
  if (expired.length === 0) return 0;

  await SeatLock.deleteMany({ _id: { $in: expired.map((lock) => lock._id) } });

  const seatsByShowtime = new Map();
  expired.forEach((lock) => {
    const key = String(lock.showtime);
    seatsByShowtime.set(key, [...(seatsByShowtime.get(key) || []), ...lock.seatNumbers]);
  });
  seatsByShowtime.forEach((seatNumbers, key) => {
    emitSeatEvent(key, 'seat:released', { seatNumbers, reason: 'expired' });
  });

  return expired.length;
};

const startSeatLockSweeper = () => {
  const timer = setInterval(() => {
    sweepExpiredLocks().catch((err) => console.error('Dọn ghế hết hạn thất bại:', err.message));
  }, SWEEP_INTERVAL_MS);
  timer.unref();
  return timer;
};

module.exports = { sweepExpiredLocks, startSeatLockSweeper };