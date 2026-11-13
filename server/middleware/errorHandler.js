const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Lỗi server';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join('; ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Giá trị không hợp lệ cho trường "${err.path}"`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'Dữ liệu đã tồn tại';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;