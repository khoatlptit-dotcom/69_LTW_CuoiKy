const Movie = require('../models/Movie');

// GET /api/movies?q=&genre=&status=&page=&limit=
exports.getAll = async (req, res, next) => {
  try {
    const { q, genre, status } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 50);

    const filter = {};
    if (q) {
      // escape ký tự đặc biệt để tìm kiếm an toàn
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: safe, $options: 'i' };
    }
    if (genre) filter.genres = genre;
    if (status) filter.status = status;

    const total = await Movie.countDocuments(filter);
    const data = await Movie.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id
exports.getById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// POST /api/movies (admin)
exports.create = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// PUT /api/movies/:id (admin)
exports.update = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.json(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// DELETE /api/movies/:id (admin)
exports.remove = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.json({ message: 'Đã xóa phim' });
  } catch (err) {
    next(err);
  }
};