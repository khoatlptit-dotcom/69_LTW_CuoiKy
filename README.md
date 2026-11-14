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

## Phân công
| Thành viên | Chức năng phụ trách |
|---|---|
| Khoa | Giữ ghế: model SeatLock, API hold/release, kiểm tra hạn theo giờ server ; đếm ngược 5 phút, xử lý F5 và nhiều tab ; sơ đồ ghế SeatMap, Redux seatSlice, useMemo tổng tiền ; model Room và sinh ghế |
| Dũng | Đặt vé: xác nhận booking, model Ticket, unique index, trả 409 kèm ghế trùng, rollback ; hủy vé trước 2 giờ, lịch sử vé, MyTicketsPage ; Auth: JWT, bcrypt, middleware phân quyền, AuthContext, Login/Register; admin quản lý tài khoản  |
| Tuấn | Real-time: Socket.IO, room theo showtimeId, phát sự kiện giữ/hủy/đặt/hủy vé, cleanup listener ; thống kê Aggregation, DashboardPage, RevenueChart ; Showtime CRUD, kiểm tra chồng giờ, admin suất chiếu, admin xem vé/booking |
| Tùng | Phim: model, CRUD, tìm kiếm, lọc, phân trang server ; giao diện Home, danh sách phim, chi tiết, trailer; nền tảng: Router, layout, common, ProtectedRoute, 404 ; seed, README, responsive, tài khoản demo; admin phim và admin phòng|
