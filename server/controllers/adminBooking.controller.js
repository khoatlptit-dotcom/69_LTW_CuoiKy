const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { parsePaging } = require('../utils/paginate');

const STATUSES = ['confirmed', 'cancelled'];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getAll = async (req, res, next) => {
  try {
    const { showtimeId, status, q } = req.query;
    const filter = {};

    if (showtimeId) {
      if (!mongoose.isValidObjectId(showtimeId)) return res.status(400).json({ message: 'showtimeId không hợp lệ' });
      filter.showtime = showtimeId;
    }
    if (status) {
      const list = String(status).split(',');
      if (list.some((s) => !STATUSES.includes(s))) return res.status(400).json({ message: 'status không hợp lệ' });
      filter.status = { $in: list };
    }
    if (q) {
      const users = await User.find({ email: { $regex: escapeRegex(String(q)), $options: 'i' } }).select('_id');
      filter.user = { $in: users.map((u) => u._id) };
    }

    const { page, limit, skip } = parsePaging(req.query);
    const [data, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .populate({ path: 'showtime', populate: [{ path: 'movie', select: 'title' }, { path: 'room', select: 'name' }] }),
      Booking.countDocuments(filter),
    ]);
    res.json({ data, page, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};