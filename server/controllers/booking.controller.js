const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
require("../models/Room"); // dang ky cac model duoc populate (neu khong se loi MissingSchemaError)
require("../models/Movie");

const MAX_SEATS = 8;
const CANCEL_BEFORE_MS = 2 * 60 * 60 * 1000;
const FIRST_ROW_INDEX = 1; // Room.vipRows đánh số từ 1 (hàng A = 1), theo thống nhất với A

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
      return res
        .status(409)
        .json({
          message: `Ghế ${list.join(", ")} đã có người đặt`,
          seats: list,
        });
    }
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const filter = { user: req.user.id };
    if (req.query.status)
      filter.status = { $in: String(req.query.status).split(",") };
    if (req.query.from) {
      const from = new Date(req.query.from);
      if (Number.isNaN(from.getTime()))
        return res.status(400).json({ message: "Ngày không hợp lệ" });
      filter.createdAt = { $gte: from };
    }

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "showtime",
          select: "startTime endTime room movie",
          populate: [
            { path: "movie", select: "title poster" },
            { path: "room", select: "name" },
          ],
        }),
      Booking.countDocuments(filter),
    ]);
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const booking = await Booking.findById(id).populate(
      "showtime",
      "startTime",
    );
    if (!booking) return res.status(404).json({ message: "Không tìm thấy vé" });
    if (String(booking.user) !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền hủy vé này" });
    }
    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Vé đã được hủy" });
    if (!booking.showtime) {
      return res
        .status(404)
        .json({ message: "Suất chiếu của vé không còn tồn tại" });
    }
    if (booking.showtime.startTime.getTime() - Date.now() < CANCEL_BEFORE_MS) {
      return res
        .status(400)
        .json({ message: "Chỉ được hủy vé trước giờ chiếu ít nhất 2 tiếng" });
    }

    // Điều kiện status giúp tránh hủy hai lần cùng lúc
    const updated = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "confirmed" },
      { status: "cancelled" },
      { new: true },
    );
    if (!updated) return res.status(400).json({ message: "Vé đã được hủy" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
