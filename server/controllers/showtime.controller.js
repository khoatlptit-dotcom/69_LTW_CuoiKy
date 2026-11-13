const mongoose = require('mongoose');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { parsePaging } = require('../utils/paginate');

const validate = ({ movie, room, startTime, priceNormal, priceVip }) => {
  const errors = {};
  if (!mongoose.isValidObjectId(movie)) errors.movie = 'Chưa chọn phim';
  if (!mongoose.isValidObjectId(room)) errors.room = 'Chưa chọn phòng';
  if (!startTime || Number.isNaN(new Date(startTime).getTime())) errors.startTime = 'Giờ chiếu không hợp lệ';
  if (!(Number(priceNormal) > 0)) errors.priceNormal = 'Giá ghế thường phải lớn hơn 0';
  if (!(Number(priceVip) >= Number(priceNormal))) errors.priceVip = 'Giá VIP phải ≥ giá thường';
  return errors;
};

const findOverlap = (room, start, end, excludeId) =>
  Showtime.findOne({
    room,
    startTime: { $lt: end },
    endTime: { $gt: start },
    ...(excludeId && { _id: { $ne: excludeId } }),
  }).populate('movie', 'title');

const prepare = async (body, excludeId) => {
  const errors = validate(body);
  if (Object.keys(errors).length) return { status: 400, body: { message: 'Dữ liệu không hợp lệ', errors } };
  const [movie, room] = await Promise.all([Movie.findById(body.movie), Room.findById(body.room)]);
  if (!movie || !room) return { status: 404, body: { message: 'Phim hoặc phòng không tồn tại' } };

  const startTime = new Date(body.startTime);
  const endTime = new Date(startTime.getTime() + movie.duration * 60000);
  const clash = await findOverlap(body.room, startTime, endTime, excludeId);
  if (clash) return { status: 409, body: { message: `Phòng đã có suất "${clash.movie?.title}" trùng giờ`, conflictId: clash._id } };

  const { priceNormal, priceVip } = body;
  return { data: { movie: body.movie, room: body.room, startTime, endTime, priceNormal, priceVip } };
};

exports.create = async (req, res, next) => {
  try {
    const result = await prepare(req.body);
    if (!result.data) return res.status(result.status).json(result.body);
    res.status(201).json(await Showtime.create(result.data));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const showtime = await Showtime.findById(id);
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    if (await Booking.exists({ showtime: id, status: 'confirmed' }))
      return res.status(409).json({ message: 'Suất chiếu đã có vé, không thể sửa' });

    const result = await prepare(req.body, id);
    if (!result.data) return res.status(result.status).json(result.body);
    Object.assign(showtime, result.data);
    res.json(await showtime.save());
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    if (await Booking.exists({ showtime: id, status: 'confirmed' }))
      return res.status(409).json({ message: 'Suất chiếu đã có vé, không thể xóa' });
    if (!(await Showtime.findByIdAndDelete(id))) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    res.json({ message: 'Đã xóa suất chiếu' });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const showtime = await Showtime.findById(req.params.id).populate('movie').populate('room');
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    res.json(showtime);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { movieId, roomId, date } = req.query;
    const filter = {};
    if (movieId || roomId) {
      if ([movieId, roomId].some((v) => v && !mongoose.isValidObjectId(v)))
        return res.status(400).json({ message: 'movieId/roomId không hợp lệ' });
      if (movieId) filter.movie = movieId;
      if (roomId) filter.room = roomId;
    }
    if (date) {
      const dayStart = new Date(`${date}T00:00:00+07:00`);
      if (Number.isNaN(dayStart.getTime())) return res.status(400).json({ message: 'date phải dạng YYYY-MM-DD' });
      filter.startTime = { $gte: dayStart, $lt: new Date(dayStart.getTime() + 86400000) };
    }
    const { page, limit, skip } = parsePaging(req.query);
    const [data, total] = await Promise.all([
      Showtime.find(filter).sort({ startTime: 1 }).skip(skip).limit(limit)
        .populate('movie', 'title duration poster').populate('room', 'name'),
      Showtime.countDocuments(filter),
    ]);
    res.json({ data, page, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};