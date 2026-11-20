const { getIO } = require('../socket');

exports.emitSeatEvent = (showtimeId, event, payload = {}) => {
  try {
    getIO().to(`showtime:${showtimeId}`).emit(event, { showtimeId: String(showtimeId), ...payload });
  } catch (err) {
    console.error('Phát sự kiện thất bại:', err.message);
  }
};