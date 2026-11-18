const Room = require('../models/Room');
const Showtime = require('../models/Showtime');

// Chuẩn hóa và kiểm tra dữ liệu gửi lên
const parseRoom = (body) => {
  const name = String(body.name || '').trim();
  const rows = Number(body.rows);
  const seatsPerRow = Number(body.seatsPerRow);
  const vipRows = [
    ...new Set((Array.isArray(body.vipRows) ? body.vipRows : []).map(Number)),
  ].sort((a, b) => a - b);

  if (!name) return { error: 'Vui lòng nhập tên phòng' };
  if (!Number.isInteger(rows) || rows < 1 || rows > 26) {
    return { error: 'Số hàng ghế phải là số nguyên từ 1 đến 26' };
  }
  if (!Number.isInteger(seatsPerRow) || seatsPerRow < 1 || seatsPerRow > 30) {
    return { error: 'Số ghế mỗi hàng phải là số nguyên từ 1 đến 30' };
  }
  if (vipRows.some((r) => !Number.isInteger(r) || r < 1 || r > rows)) {
    return { error: `Hàng VIP phải là số nguyên từ 1 đến ${rows}` };
  }
  return { data: { name, rows, seatsPerRow, vipRows } };
};

// GET /api/rooms
exports.getAll = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/:id
exports.getById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

// POST /api/rooms (admin)
exports.create = async (req, res, next) => {
  try {
    const { data, error } = parseRoom(req.body);
    if (error) return res.status(400).json({ message: error });
    const room = await Room.create(data);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

// PUT /api/rooms/:id (admin)
exports.update = async (req, res, next) => {
  try {
    const { data, error } = parseRoom(req.body);
    if (error) return res.status(400).json({ message: error });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });

    const oldVip = [...room.vipRows].sort((a, b) => a - b);
    const layoutChanged =
      room.rows !== data.rows ||
      room.seatsPerRow !== data.seatsPerRow ||
      JSON.stringify(oldVip) !== JSON.stringify(data.vipRows);

    // Phòng đã có suất chiếu thì không đổi sơ đồ ghế, tránh hỏng vé đã đặt
    if (layoutChanged && (await Showtime.exists({ room: room._id }))) {
      return res.status(409).json({
        message: 'Phòng đã có suất chiếu, chỉ được đổi tên, không đổi sơ đồ ghế',
      });
    }

    room.set(data);
    await room.save();
    res.json(room);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/rooms/:id (admin)
exports.remove = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });

    if (await Showtime.exists({ room: room._id })) {
      return res.status(409).json({ message: 'Phòng đang có suất chiếu, không thể xóa' });
    }

    await room.deleteOne();
    res.json({ message: 'Đã xóa phòng' });
  } catch (err) {
    next(err);
  }
};