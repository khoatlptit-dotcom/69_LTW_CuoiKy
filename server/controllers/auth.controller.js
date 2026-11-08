// TODO: viết các hàm xử lý cho auth
exports.getAll = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};
