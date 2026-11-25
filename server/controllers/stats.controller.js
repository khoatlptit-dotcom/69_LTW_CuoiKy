const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const User = require('../models/User');

const TZ = 'Asia/Ho_Chi_Minh';

const buildMatch = ({ from, to }) => {
  const match = { status: 'confirmed' };
  const gte = from ? new Date(`${from}T00:00:00+07:00`) : null;
  const lt = to ? new Date(new Date(`${to}T00:00:00+07:00`).getTime() + 86400000) : null;
  if ([gte, lt].some((d) => d && Number.isNaN(d.getTime()))) return null;
  if (gte || lt) match.createdAt = { ...(gte && { $gte: gte }), ...(lt && { $lt: lt }) };
  return match;
};

const runStats = (stages) => async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    if (!match) return res.status(400).json({ message: 'from/to phải có dạng YYYY-MM-DD' });
    res.json(await Booking.aggregate([{ $match: match }, ...stages]));
  } catch (err) {
    next(err);
  }
};

const sums = {
  revenue: { $sum: '$totalPrice' },
  seats: { $sum: { $size: '$seats' } },
  bookings: { $sum: 1 },
};

exports.revenueByMovie = runStats([
  { $lookup: { from: 'showtimes', localField: 'showtime', foreignField: '_id', as: 'st' } },
  { $unwind: '$st' },
  { $group: { _id: '$st.movie', ...sums } },
  { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
  { $unwind: '$movie' },
  { $project: { _id: 0, movieId: '$_id', title: '$movie.title', revenue: 1, seats: 1, bookings: 1 } },
  { $sort: { revenue: -1 } },
]);

exports.revenueByDay = runStats([
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, ...sums } },
  { $project: { _id: 0, date: '$_id', revenue: 1, seats: 1, bookings: 1 } },
  { $sort: { date: 1 } },
]);
exports.overview = async (req, res, next) => {
  try {
    const [movies, members] = await Promise.all([
      Movie.countDocuments(),
      User.countDocuments({ role: 'member' }),
    ]);
    res.json({ movies, members });
  } catch (err) {
    next(err);
  }
};