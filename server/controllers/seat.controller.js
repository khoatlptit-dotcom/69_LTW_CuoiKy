const seatService = require('../services/seatService');

const formatHold = (lock, serverTime) =>
  lock
    ? { seatNumbers: lock.seatNumbers, expiresAt: lock.expiresAt, serverTime }
    : null;

exports.getSeatMap = async (req, res, next) => {
  try {
    const { showtime, room, seats, hold, serverTime } = await seatService.getSeatMap({
      showtimeId: req.params.showtimeId,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: {
        showtime: {
          _id: showtime._id,
          movie: showtime.movie,
          startTime: showtime.startTime,
          endTime: showtime.endTime,
          priceNormal: showtime.priceNormal,
          priceVip: showtime.priceVip,
        },
        room: {
          _id: room._id,
          name: room.name,
          rows: room.rows,
          seatsPerRow: room.seatsPerRow,
          vipRows: room.vipRows,
        },
        seats,
        hold: formatHold(hold, serverTime),
        serverTime,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.hold = async (req, res, next) => {
  try {
    const { showtimeId, seatNumbers } = req.body;
    const { lock, serverTime } = await seatService.holdSeats({
      showtimeId,
      userId: req.user.id,
      seatNumbers,
    });
    res.json({ success: true, data: formatHold(lock, serverTime) });
  } catch (err) {
    next(err);
  }
};

exports.getMyHold = async (req, res, next) => {
  try {
    const { lock, serverTime } = await seatService.getMyHold({
      showtimeId: req.params.showtimeId,
      userId: req.user.id,
    });
    res.json({ success: true, data: formatHold(lock, serverTime), serverTime });
  } catch (err) {
    next(err);
  }
};

exports.release = async (req, res, next) => {
  try {
    const released = await seatService.releaseHold({
      showtimeId: req.params.showtimeId,
      userId: req.user.id,
    });
    res.json({
      success: true,
      message: released ? 'Đã hủy giữ ghế' : 'Không có phiên giữ ghế nào',
    });
  } catch (err) {
    next(err);
  }
};