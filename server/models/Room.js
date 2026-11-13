const mongoose = require('mongoose');
const { generateSeats } = require('../utils/seatMap');

const MAX_ROWS = 26;
const MAX_SEATS_PER_ROW = 30;

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên phòng là bắt buộc'],
      trim: true,
    },
    rows: {
      type: Number,
      required: [true, 'Số hàng ghế là bắt buộc'],
      min: [1, 'Phòng phải có ít nhất 1 hàng'],
      max: [MAX_ROWS, `Phòng tối đa ${MAX_ROWS} hàng`],
      validate: { validator: Number.isInteger, message: 'Số hàng phải là số nguyên' },
    },
    seatsPerRow: {
      type: Number,
      required: [true, 'Số ghế mỗi hàng là bắt buộc'],
      min: [1, 'Mỗi hàng phải có ít nhất 1 ghế'],
      max: [MAX_SEATS_PER_ROW, `Mỗi hàng tối đa ${MAX_SEATS_PER_ROW} ghế`],
      validate: { validator: Number.isInteger, message: 'Số ghế phải là số nguyên' },
    },
    // Số hàng VIP tính từ 1 (hàng 1 = A). Ví dụ [3, 4] là hàng C và D.
    vipRows: {
      type: [Number],
      default: [],
      validate: {
        validator(list) {
          const unique = new Set(list);
          return (
            unique.size === list.length &&
            list.every((n) => Number.isInteger(n) && n >= 1 && n <= this.rows)
          );
        },
        message: 'Hàng VIP phải là số nguyên không trùng, từ 1 đến số hàng của phòng',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.virtual('totalSeats').get(function totalSeats() {
  return this.rows * this.seatsPerRow;
});

// Sơ đồ ghế được sinh từ cấu hình phòng, không lưu cứng trong DB.
roomSchema.methods.getSeats = function getSeats() {
  return generateSeats(this);
};

module.exports = mongoose.model('Room', roomSchema);