// TODO: viết các hàm xử lý cho room
exports.getAll = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};
