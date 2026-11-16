const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
require("../models/Room"); // đăng ký model Room để populate("room") hoạt động

const MAX_SEATS = 8;
const FIRST_ROW_INDEX = 0; // Room.vipRows là chỉ số hàng; đổi thành 1 nếu A đánh số hàng từ 1 (hỏi A)

// Mã ghế: chữ cái hàng + số ghế, ví dụ "A1", "F10"
const parseSeat = (seatId) => {
  const match =
    typeof seatId === "string" ? /^([A-Z])(\d{1,3})$/.exec(seatId) : null;
  return match
    ? {
        row: match[1].charCodeAt(0) - 65 + FIRST_ROW_INDEX,
        number: Number(match[2]),
      }
    : null;
};

const isValidSeat = (room, seatId) => {
  const seat = parseSeat(seatId);
  return (
    Boolean(seat) &&
    seat.row < FIRST_ROW_INDEX + room.rows &&
    seat.number >= 1 &&
    seat.number <= room.seatsPerRow
  );
};

const calcTotal = (showtime, room, seats) =>
  seats.reduce(
    (sum, seatId) =>
      sum +
      (room.vipRows.includes(parseSeat(seatId).row)
        ? showtime.priceVip
        : showtime.priceNormal),
    0,
  );

exports.getAll = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;
    if (!mongoose.isValidObjectId(showtimeId)) {
      return res.status(400).json({ message: "Suất chiếu không hợp lệ" });
    }
    if (
      !Array.isArray(seats) ||
      seats.length < 1 ||
      seats.length > MAX_SEATS ||
      new Set(seats).size !== seats.length
    ) {
      return res
        .status(400)
        .json({ message: `Chọn từ 1 đến ${MAX_SEATS} ghế, không trùng nhau` });
    }

    const showtime = await Showtime.findById(showtimeId).populate("room");
    if (!showtime)
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    if (!showtime.room)
      return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    if (showtime.startTime <= new Date()) {
      return res.status(400).json({ message: "Suất chiếu đã bắt đầu" });
    }
    if (!seats.every((seat) => isValidSeat(showtime.room, seat))) {
      return res
        .status(400)
        .json({ message: "Có ghế không tồn tại trong phòng chiếu" });
    }

    try {
      const booking = await Booking.create({
        user: req.user.id,
        showtime: showtime._id,
        seats,
        totalPrice: calcTotal(showtime, showtime.room, seats), // tính ở server, không tin client
      });
      return res.status(201).json(booking);
    } catch (err) {
      if (err.code !== 11000) throw err;
      const taken = await Booking.find({
        showtime: showtime._id,
        status: "confirmed",
        seats: { $in: seats },
      }).select("seats");
      const conflict = seats.filter((seat) =>
        taken.some((b) => b.seats.includes(seat)),
      );
      const list = conflict.length ? conflict : seats;
      return res.status(409).json({
        message: `Ghế ${list.join(", ")} đã có người đặt`,
        seats: list,
      });
    }
  } catch (err) {
    next(err);
  }
};
