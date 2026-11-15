const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: [String], // VD ["A1","A2"]
    totalPrice: Number,
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

// Hai booking confirmed không được trùng (suất chiếu, ghế); booking đã hủy thì ghế được đặt lại
bookingSchema.index(
  { showtime: 1, seats: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } },
);

module.exports = mongoose.model("Booking", bookingSchema);
