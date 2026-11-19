require('dotenv').config();
const http = require('http');
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
app.use('/api/stats', require('./routes/stats.routes'));

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy API' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(PORT, () => console.log(`Server chạy cổng ${PORT}`));
});