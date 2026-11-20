const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const { MAX_SEATS_PER_BOOKING, getSeatType } = require('../utils/seatMap');
const { emitSeatEvent } = require('../utils/realtime');
const { sweepExpiredLocks } = require('./seatLockSweeper');

const HOLD_DURATION_MS = 5 * 60 * 1000;

const httpError = (status, message, details) =>
  Object.assign(new Error(message), { status, details });

const loadShowtime = async (showtimeId) => {
  if (!showtimeId) throw httpError(400, 'Thiếu showtimeId');
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) throw httpError(404, 'Không tìm thấy suất chiếu');
  return showtime;
};

const loadRoom = async (showtime) => {
  const room = await Room.findById(showtime.room);
  if (!room) throw httpError(404, 'Không tìm thấy phòng chiếu của suất này');
  return room;
};

const normalizeSeats = (seatNumbers) => {
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw httpError(400, 'Phải chọn ít nhất 1 ghế');
  }
  const seats = seatNumbers.map((seat) => String(seat).trim().toUpperCase());
  if (new Set(seats).size !== seats.length) {
    throw httpError(400, 'Danh sách ghế bị trùng');
  }
  if (seats.length > MAX_SEATS_PER_BOOKING) {
    throw httpError(400, `Tối đa ${MAX_SEATS_PER_BOOKING} ghế mỗi lần đặt`);
  }
  return seats;
};

// Ghế đã bán: ghế thuộc các booking còn hiệu lực (confirmed) của suất chiếu.
const findSoldSeats = (showtimeId) =>
  Booking.distinct('seats', { showtime: showtimeId, status: 'confirmed' });

// Ghế đã bán và ghế người khác đang giữ (phiên chưa hết hạn).
const findConflicts = async (showtimeId, userId, seats, now) => {
  const wanted = new Set(seats);
  const [soldAll, otherLocks] = await Promise.all([
    findSoldSeats(showtimeId),
    SeatLock.find({
      showtime: showtimeId,
      user: { $ne: userId },
      expiresAt: { $gt: now },
      seatNumbers: { $in: seats },
    }),
  ]);

  const soldSeats = soldAll.filter((seat) => wanted.has(seat));
  const heldSeats = [
    ...new Set(
      otherLocks.flatMap((lock) => lock.seatNumbers).filter((seat) => wanted.has(seat))
    ),
  ];
  return { soldSeats: soldSeats.sort(), heldSeats: heldSeats.sort() };
};

const conflictError = ({ soldSeats, heldSeats }) => {
  if (soldSeats.length === 0 && heldSeats.length === 0) {
    return httpError(409, 'Yêu cầu giữ ghế bị xung đột, vui lòng thử lại');
  }
  const parts = [];
  if (soldSeats.length) parts.push(`đã được bán: ${soldSeats.join(', ')}`);
  if (heldSeats.length) parts.push(`đang được người khác giữ: ${heldSeats.join(', ')}`);
  return httpError(409, `Không thể giữ ghế, ghế ${parts.join('; ')}`, {
    soldSeats,
    heldSeats,
  });
};

const holdSeats = async ({ showtimeId, userId, seatNumbers }) => {
  const seats = normalizeSeats(seatNumbers);
  const showtime = await loadShowtime(showtimeId);
  const now = new Date();

  if (showtime.startTime <= now) {
    throw httpError(400, 'Suất chiếu đã bắt đầu, không thể giữ ghế');
  }

  const room = await loadRoom(showtime);
  const invalid = seats.filter((seat) => !getSeatType(room, seat));
  if (invalid.length) {
    throw httpError(400, `Ghế không tồn tại trong phòng: ${invalid.join(', ')}`);
  }

  // Dọn phiên đã hết hạn của suất chiếu này để chúng không chặn người khác.
  await sweepExpiredLocks(showtime._id);

  const conflicts = await findConflicts(showtime._id, userId, seats, now);
  if (conflicts.soldSeats.length || conflicts.heldSeats.length) {
    throw conflictError(conflicts);
  }

  // Giữ nguyên hạn của phiên còn hiệu lực, không reset khi người dùng đổi ghế.
  const own = await SeatLock.findOne({ showtime: showtime._id, user: userId });
  const ownActive = own && own.expiresAt > now ? own : null;
  const expiresAt = ownActive
    ? ownActive.expiresAt
    : new Date(now.getTime() + HOLD_DURATION_MS);

  try {
    const lock = await SeatLock.findOneAndUpdate(
      { showtime: showtime._id, user: userId },
      { $set: { seatNumbers: seats, expiresAt } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Ghế vừa bỏ chọn được trả lại; ghế vừa chọn được giữ.
    const freed = ownActive ? ownActive.seatNumbers.filter((seat) => !seats.includes(seat)) : [];
    if (freed.length) emitSeatEvent(showtime._id, 'seat:released', { seatNumbers: freed });
    emitSeatEvent(showtime._id, 'seat:held', { seatNumbers: seats });

    return { lock, serverTime: now };
  } catch (err) {
    if (err.code === 11000) {
      // Có request khác vừa giữ ghế trước: tính lại ghế nào bị trùng để báo cho người dùng.
      const latest = await findConflicts(showtime._id, userId, seats, new Date());
      throw conflictError(latest);
    }
    throw err;
  }
};

const releaseHold = async ({ showtimeId, userId }) => {
  if (!showtimeId) throw httpError(400, 'Thiếu showtimeId');
  const lock = await SeatLock.findOneAndDelete({ showtime: showtimeId, user: userId });
  if (lock) emitSeatEvent(showtimeId, 'seat:released', { seatNumbers: lock.seatNumbers });
  return Boolean(lock);
};

const getMyHold = async ({ showtimeId, userId }) => {
  if (!showtimeId) throw httpError(400, 'Thiếu showtimeId');
  const now = new Date();
  const lock = await SeatLock.findOne({
    showtime: showtimeId,
    user: userId,
    expiresAt: { $gt: now },
  });
  return { lock, serverTime: now };
};

const getSeatMap = async ({ showtimeId, userId }) => {
  const showtime = await loadShowtime(showtimeId);
  const room = await loadRoom(showtime);
  const now = new Date();

  const [soldList, locks] = await Promise.all([
    findSoldSeats(showtime._id),
    SeatLock.find({ showtime: showtime._id, expiresAt: { $gt: now } }),
  ]);

  const sold = new Set(soldList);
  const mine = new Set();
  const held = new Set();
  let myLock = null;

  locks.forEach((lock) => {
    if (String(lock.user) === String(userId)) {
      myLock = lock;
      lock.seatNumbers.forEach((seat) => mine.add(seat));
    } else {
      lock.seatNumbers.forEach((seat) => held.add(seat));
    }
  });

  const seats = room.getSeats().map((seat) => {
    let status = 'available';
    if (sold.has(seat.seatNumber)) status = 'sold';
    else if (mine.has(seat.seatNumber)) status = 'mine';
    else if (held.has(seat.seatNumber)) status = 'held';

    return {
      ...seat,
      price: seat.type === 'vip' ? showtime.priceVip : showtime.priceNormal,
      status,
    };
  });

  return { showtime, room, seats, hold: myLock, serverTime: now };
};

module.exports = {
  HOLD_DURATION_MS,
  holdSeats,
  releaseHold,
  getMyHold,
  getSeatMap,
};