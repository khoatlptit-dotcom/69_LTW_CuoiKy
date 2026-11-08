// TODO: viết các hàm xử lý cho movie
exports.getAll = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};
