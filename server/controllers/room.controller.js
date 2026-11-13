const Room = require('../models/Room');
const Showtime = require('../models/Showtime');

const FIELDS = ['name', 'rows', 'seatsPerRow', 'vipRows'];

const httpError = (status, message) => Object.assign(new Error(message), { status });

const findRoom = async (id) => {
  const room = await Room.findById(id);
  if (!room) throw httpError(404, 'Không tìm thấy phòng chiếu');
  return room;
};

const pickFields = (body) =>
  FIELDS.reduce((result, field) => {
    if (body[field] !== undefined) result[field] = body[field];
    return result;
  }, {});

const assertVipRowsIsArray = (body) => {
  if (body.vipRows !== undefined && !Array.isArray(body.vipRows)) {
    throw httpError(400, 'vipRows phải là một mảng số hàng');
  }
};

const isStructureChanged = (room, body) => {
  if (body.rows !== undefined && Number(body.rows) !== room.rows) return true;
  if (body.seatsPerRow !== undefined && Number(body.seatsPerRow) !== room.seatsPerRow) {
    return true;
  }
  if (body.vipRows !== undefined) {
    const next = body.vipRows.map(Number).sort((a, b) => a - b);
    const current = [...room.vipRows].sort((a, b) => a - b);
    return JSON.stringify(next) !== JSON.stringify(current);
  }
  return false;
};

exports.getAll = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const room = await findRoom(req.params.id);
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// Sơ đồ ghế được sinh từ cấu hình phòng trong database.
exports.getSeats = async (req, res, next) => {
  try {
    const room = await findRoom(req.params.id);
    res.json({ success: true, data: { room, seats: room.getSeats() } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    assertVipRowsIsArray(req.body);
    const room = await Room.create(pickFields(req.body));
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    assertVipRowsIsArray(req.body);
    const room = await findRoom(req.params.id);

    if (isStructureChanged(room, req.body)) {
      const hasUpcoming = await Showtime.exists({
        room: room._id,
        endTime: { $gt: new Date() },
      });
      if (hasUpcoming) {
        throw httpError(
          409,
          'Phòng còn suất chiếu chưa kết thúc, không thể đổi kích thước hoặc hàng VIP'
        );
      }
    }

    room.set(pickFields(req.body));
    room.markModified('vipRows'); // luôn kiểm tra lại hàng VIP so với số hàng mới
    await room.save();
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const room = await findRoom(req.params.id);

    const hasShowtimes = await Showtime.exists({ room: room._id });
    if (hasShowtimes) {
      throw httpError(409, 'Phòng đã có suất chiếu, không thể xóa');
    }

    await room.deleteOne();
    res.json({ success: true, message: 'Đã xóa phòng chiếu' });
  } catch (err) {
    next(err);
  }
};