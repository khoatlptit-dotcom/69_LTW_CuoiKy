import request from "./client";

export const getAll = () => request("/bookings");

// Đặt vé: seats là mảng mã ghế, ví dụ ["A1", "A2"]
export const createBooking = (showtimeId, seats) =>
  request("/bookings", { method: "POST", body: { showtimeId, seats } });

// Lịch sử vé của tôi. params: page, limit, status ("confirmed" hoặc "cancelled"), from
export const getMyBookings = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ).toString();
  return request(`/bookings/me${query ? `?${query}` : ""}`);
};

// Hủy vé (chỉ chủ vé, trước giờ chiếu ít nhất 2 tiếng)
export const cancelBooking = (id) =>
  request(`/bookings/${id}/cancel`, { method: "PATCH" });
