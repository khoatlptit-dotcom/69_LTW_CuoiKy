// TODO: viết các hàm xử lý cho showtime
exports.getAll = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};
