const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const seatService = require("../services/seatService");
const { emitSeatEvent } = require("../utils/realtime");
const { calculateAmount, MAX_SEATS_PER_BOOKING } = require("../utils/seatMap");
// Đăng ký các model được populate (nếu không sẽ báo lỗi MissingSchemaError)
require("../models/Room");
require("../models/Movie");

const CANCEL_BEFORE_MS = 2 * 60 * 60 * 1000;

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const showtimePopulate = {
  path: "showtime",
  select: "startTime endTime room movie",
  populate: [
    { path: "movie", select: "title poster" },
    { path: "room", select: "name" },
  ],
};

// Đặt vé: người đặt phải đang giữ đủ các ghế (seatService của A), tiền tính ở server
exports.create = async (req, res, next) => {
  try {
    const { showtimeId } = req.body;
    const rawSeats = req.body.seats;
    if (!mongoose.isValidObjectId(showtimeId)) {
      return res.status(400).json({ message: "Suất chiếu không hợp lệ" });
    }
    if (
      !Array.isArray(rawSeats) ||
      rawSeats.length < 1 ||
      rawSeats.length > MAX_SEATS_PER_BOOKING ||
      rawSeats.some((seat) => typeof seat !== "string")
    ) {
      return res
        .status(400)
        .json({
          message: `Chọn từ 1 đến ${MAX_SEATS_PER_BOOKING} ghế, không trùng nhau`,
        });
    }
    // Cùng cách chuẩn hóa với seatService của A (cắt khoảng trắng, viết hoa) để so khớp với phiên giữ ghế
    const seats = rawSeats.map((seat) => seat.trim().toUpperCase());
    if (new Set(seats).size !== seats.length) {
      return res
        .status(400)
        .json({
          message: `Chọn từ 1 đến ${MAX_SEATS_PER_BOOKING} ghế, không trùng nhau`,
        });
    }

    const showtime = await Showtime.findById(showtimeId).populate("room");
    if (!showtime)
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    if (!showtime.room)
      return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    if (showtime.startTime <= new Date()) {
      return res.status(400).json({ message: "Suất chiếu đã bắt đầu" });
    }

    // Phiên giữ ghế phải còn hạn và chứa mọi ghế gửi lên (getMyHold trả về { lock, serverTime })
    const { lock } = await seatService.getMyHold({
      showtimeId,
      userId: req.user.id,
    });
    const held = new Set(lock ? lock.seatNumbers : []);
    if (!lock || !seats.every((seat) => held.has(seat))) {
      return res
        .status(409)
        .json({
          code: "HOLD_INVALID",
          message: "Phiên giữ ghế đã hết hạn hoặc không khớp",
        });
    }

    // Tiền tính ở server bằng hàm của A (trả về { total, details }), không tin số tiền từ client
    const { total } = calculateAmount(showtime.room, showtime, seats);

    let booking;
    try {
      booking = await Booking.create({
        user: req.user.id,
        showtime: showtime._id,
        seats,
        totalPrice: total,
      });
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
        details: { seats: list },
      });
    }

    // Vé đã tạo: xóa phiên giữ ghế và báo realtime. Lỗi ở hai bước này không được làm hỏng vé.
    try {
      await seatService.releaseHold({ showtimeId, userId: req.user.id });
    } catch (err) {
      console.error("releaseHold lỗi:", err.message);
    }
    try {
      emitSeatEvent(showtimeId, "seat:booked", { seatNumbers: seats });
    } catch (err) {
      console.error("emitSeatEvent lỗi:", err.message);
    }
    return res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// Lịch sử vé của người đang đăng nhập
exports.getMine = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const filter = { user: req.user.id };
    if (req.query.status)
      filter.status = { $in: String(req.query.status).split(",") };
    if (req.query.from) {
      const from = parseDate(req.query.from);
      if (!from) return res.status(400).json({ message: "Ngày không hợp lệ" });
      filter.createdAt = { $gte: from };
    }

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(showtimePopulate),
      Booking.countDocuments(filter),
    ]);
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Hủy vé: chỉ chủ vé, trước giờ chiếu ít nhất 2 tiếng; hủy xong báo realtime để mở lại ghế
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

    try {
      emitSeatEvent(String(booking.showtime._id), "seat:cancelled", {
        seatNumbers: booking.seats,
      });
    } catch (err) {
      console.error("emitSeatEvent lỗi:", err.message);
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
