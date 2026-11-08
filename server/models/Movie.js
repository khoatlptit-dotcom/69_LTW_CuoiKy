const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    genres: [String],
    duration: { type: Number, required: true }, // phút
    poster: String,
    trailerUrl: String, // link YouTube
    description: String,
    status: { type: String, enum: ['now', 'upcoming'], default: 'now' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
