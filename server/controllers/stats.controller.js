// TODO: viết các hàm xử lý cho stats
exports.getAll = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};
