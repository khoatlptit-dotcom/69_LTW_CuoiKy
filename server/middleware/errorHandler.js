const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
};

module.exports = errorHandler;
