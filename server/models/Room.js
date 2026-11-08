const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  vipRows: [Number], // chỉ số hàng VIP, VD [3,4]
});

module.exports = mongoose.model('Room', roomSchema);
