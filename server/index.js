require('dotenv').config();
const { startSeatLockSweeper } = require('./services/seatLockSweeper');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/movies', require('./routes/movie.routes'));
app.use('/api/rooms', require('./routes/room.routes'));
app.use('/api/showtimes', require('./routes/showtime.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/seats', require('./routes/seat.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/admin/bookings', require('./routes/adminBooking.routes'));

// Khi triển khai: server phục vụ luôn giao diện đã build, cả web chỉ cần một địa chỉ.
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    return res.sendFile(path.join(buildPath, 'index.html'));
  });
}
app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy API' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(PORT, () => console.log(`Server chạy cổng ${PORT}`));
  startSeatLockSweeper();
});