require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

const poster = (text) =>
  `https://placehold.co/300x450?text=${encodeURIComponent(text)}`;

const movies = [
  { title: 'Hành Trình Về Phương Nam', genres: ['Phiêu lưu', 'Gia đình'], duration: 112, status: 'now',
    description: 'Cuộc hành trình của hai anh em xuyên qua miền Tây sông nước.' },
  { title: 'Đêm Không Trăng', genres: ['Kinh dị'], duration: 98, status: 'now',
    description: 'Một nhóm bạn mắc kẹt trong ngôi nhà cổ giữa đêm tối.' },
  { title: 'Mật Mã Sài Gòn', genres: ['Hành động', 'Hình sự'], duration: 125, status: 'now',
    description: 'Cuộc truy lùng băng nhóm đánh cắp dữ liệu giữa lòng thành phố.' },
  { title: 'Mùa Hè Của Chúng Ta', genres: ['Tình cảm', 'Học đường'], duration: 105, status: 'now',
    description: 'Câu chuyện thanh xuân của nhóm bạn trong mùa hè cuối cấp.' },
  { title: 'Tiệm Mì Ông Tư', genres: ['Hài', 'Gia đình'], duration: 95, status: 'now',
    description: 'Tiệm mì nhỏ đứng trước nguy cơ bị giải tỏa.' },
  { title: 'Vùng Đất Quên Lãng', genres: ['Khoa học viễn tưởng'], duration: 138, status: 'now',
    description: 'Đoàn thám hiểm tìm thấy một hành tinh có dấu vết của loài người.' },
  { title: 'Cánh Cửa Thứ Mười Ba', genres: ['Kinh dị', 'Bí ẩn'], duration: 102, status: 'now',
    description: 'Tòa chung cư không có tầng 13 và những chuyện lạ xảy ra ở đó.' },
  { title: 'Người Giữ Ngọn Hải Đăng', genres: ['Chính kịch'], duration: 118, status: 'now',
    description: 'Một người đàn ông sống cô độc và bí mật của ngọn hải đăng cũ.' },
  { title: 'Tốc Độ Bão Táp', genres: ['Hành động'], duration: 110, status: 'upcoming',
    description: 'Tay đua trở lại giải đấu lớn nhất sau nhiều năm giải nghệ.' },
  { title: 'Giấc Mơ Pha Lê', genres: ['Hoạt hình', 'Gia đình'], duration: 92, status: 'upcoming',
    description: 'Cô bé tìm thấy thế giới pha lê sau tấm gương trong phòng mình.' },
  { title: 'Thanh Xuân Không Ngủ', genres: ['Tình cảm', 'Hài'], duration: 100, status: 'upcoming',
    description: 'Những đêm thức trắng của nhóm bạn trẻ khởi nghiệp.' },
].map((m) => ({ ...m, poster: poster(m.title), trailerUrl: '' }));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // ===== PHIM (Tùng) =====
  await Movie.deleteMany({});
  await Movie.insertMany(movies);
  console.log(`Đã thêm ${movies.length} phim`);

  // TODO: tạo admin, user, phòng, suất chiếu mẫu

  console.log('Seed xong');
  process.exit(0);
})();