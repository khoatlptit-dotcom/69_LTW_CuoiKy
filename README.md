# Rạp chiếu phim mini – Đặt vé xem phim (BTL cuối kỳ LTW)

Stack: React (Create React App) + React Router + Redux Toolkit + Context API | Node.js + Express | MongoDB (Mongoose)

## Cài đặt
```bash
# Server
cd server && cp .env.example .env && npm install && npm run seed && npm run dev
# Client (terminal khác)
cd client && cp .env.example .env && npm install && npm start
```
Client: http://localhost:3000 – Server: http://localhost:5000

## Tài khoản demo (sau khi chạy `npm run seed`)
| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@cinema.com | 123456 |
| Thành viên | user@cinema.com | 123456 |
## Yêu cầu
- Node.js (bản LTS)
- MongoDB Community Server chạy trên máy (mặc định `mongodb://127.0.0.1:27017`)

## Chạy trên Windows PowerShell
Nếu lệnh nối bằng `&&` báo lỗi, chạy từng dòng riêng:
```bash
cd server
copy .env.example .env
npm install
npm run seed
npm start
```
Mở terminal khác cho client:
```bash
cd client
copy .env.example .env
npm install
npm start
```

## Biến môi trường
**server/.env**

| Biến | Ý nghĩa |
|---|---|
| PORT | Cổng server (mặc định 5000) |
| MONGO_URI | Địa chỉ MongoDB |
| JWT_SECRET | Khóa ký token đăng nhập (đổi thành chuỗi bí mật riêng) |
| JWT_EXPIRES_IN | Thời hạn token (VD: 1d) |
| CLIENT_URL | Địa chỉ client được phép gọi API (http://localhost:3000) |

**client/.env** (không bắt buộc): `REACT_APP_API_URL`, mặc định `http://localhost:5000/api`.

## Dữ liệu mẫu (seed)
`npm run seed` **xóa toàn bộ dữ liệu cũ** (tài khoản, phim, phòng, suất chiếu, vé) rồi tạo lại: 2 tài khoản demo, phim từ `server/seeds/movies.json`, 2 phòng chiếu và suất chiếu trong 7 ngày tới. Muốn thêm trailer cho phim, điền `trailerUrl` (link YouTube) trong `movies.json` rồi seed lại. Mỗi lần seed lại, phim có mã mới nên hãy mở lại từ trang chủ.

## API phim
| Phương thức | Đường dẫn | Quyền |
|---|---|---|
| GET | `/api/movies?q=&genre=&status=&page=&limit=` | Mọi người |
| GET | `/api/movies/:id` | Mọi người |
| POST, PUT, DELETE | `/api/movies`, `/api/movies/:id` | Admin |

`status` là `now` (đang chiếu) hoặc `upcoming` (sắp chiếu). Kết quả danh sách có dạng `{ data, page, limit, total, totalPages }`.

## API phòng chiếu
| Phương thức | Đường dẫn | Quyền |
|---|---|---|
| GET | `/api/rooms`, `/api/rooms/:id` | Mọi người |
| POST, PUT, DELETE | `/api/rooms`, `/api/rooms/:id` | Admin |

Phòng đã có suất chiếu thì không xóa được và không đổi được sơ đồ ghế (chỉ đổi tên).

## Cấu trúc thư mục
```
client/src
  api/          gọi API (axios)
  components/   admin, booking, common, layout
  context/      AuthContext, ThemeContext
  pages/        trang người dùng và pages/admin
  store/        Redux
server
  config/ controllers/ middleware/ models/ routes/ seeds/
```
## Phân công
| Thành viên | Chức năng phụ trách |
|---|---|
| Khoa | Giữ ghế: model SeatLock, API hold/release, kiểm tra hạn theo giờ server ; đếm ngược 5 phút, xử lý F5 và nhiều tab ; sơ đồ ghế SeatMap, Redux seatSlice, useMemo tổng tiền ; model Room và sinh ghế |
| Dũng | Đặt vé: xác nhận booking, model Ticket, unique index, trả 409 kèm ghế trùng, rollback ; hủy vé trước 2 giờ, lịch sử vé, MyTicketsPage ; Auth: JWT, bcrypt, middleware phân quyền, AuthContext, Login/Register; admin quản lý tài khoản  |
| Tuấn | Real-time: Socket.IO, room theo showtimeId, phát sự kiện giữ/hủy/đặt/hủy vé, cleanup listener ; thống kê Aggregation, DashboardPage, RevenueChart ; Showtime CRUD, kiểm tra chồng giờ, admin suất chiếu, admin xem vé/booking |
| Tùng | Phim: model, CRUD, tìm kiếm, lọc, phân trang server ; giao diện Home, danh sách phim, chi tiết, trailer; nền tảng: Router, layout, common, ProtectedRoute, 404 ; seed, README, responsive, tài khoản demo; admin phim và admin phòng|
