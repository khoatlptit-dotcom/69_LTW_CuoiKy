require('dotenv').config();
const mongoose = require('mongoose');
// TODO: tạo admin, user, phim, phòng, suất chiếu mẫu
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Seed xong');
  process.exit(0);
})();
