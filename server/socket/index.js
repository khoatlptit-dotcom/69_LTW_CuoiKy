const { Server } = require('socket.io');
const mongoose = require('mongoose');

let io;

exports.initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('showtime:join', (id) => {
      if (mongoose.isValidObjectId(id)) socket.join(`showtime:${id}`);
    });
    socket.on('showtime:leave', (id) => socket.leave(`showtime:${id}`));
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error('Socket.IO chưa được khởi tạo');
  return io;
};