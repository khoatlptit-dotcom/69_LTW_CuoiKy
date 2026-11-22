import { useCallback, useEffect, useState } from "react";
import { cancelBooking, getMyBookings } from "../api/bookingApi";

const PAGE_SIZE = 5;
const CANCEL_BEFORE_MS = 2 * 60 * 60 * 1000;
const STATUS_LABEL = { confirmed: "Đã xác nhận", cancelled: "Đã hủy" };

const pageStyle = {
  maxWidth: 720,
  width: "100%",
  margin: "2rem auto",
  padding: "0 1rem",
  boxSizing: "border-box",
};
const cardStyle = {
  border: "1px solid currentColor",
  borderRadius: 8,
  padding: "0 1rem",
  margin: "1rem 0",
};

const formatTime = (value) => new Date(value).toLocaleString("vi-VN");
const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const TicketCard = ({ booking, onCancel, cancelling }) => {
  const { showtime, seats, totalPrice, status } = booking;
  const canCancel =
    status === "confirmed" &&
    Boolean(showtime) &&
    new Date(showtime.startTime).getTime() - Date.now() >= CANCEL_BEFORE_MS;

  return (
    <article style={cardStyle}>
      <h2>{showtime?.movie?.title || "Vé xem phim"}</h2>
      <p>Phòng: {showtime?.room?.name || "Không rõ"}</p>
      <p>
        Suất chiếu: {showtime ? formatTime(showtime.startTime) : "Không rõ"}
      </p>
      <p>Ghế: {seats.join(", ")}</p>
      <p>Tổng tiền: {formatMoney(totalPrice)}</p>
      <p>Trạng thái: {STATUS_LABEL[status] || status}</p>
      {canCancel && (
        <p>
          <button
            type="button"
            onClick={() => onCancel(booking._id)}
            disabled={cancelling}
          >
            {cancelling ? "Đang hủy..." : "Hủy vé"}
          </button>
        </p>
      )}
    </article>
  );
};

const MyTicketsPage = () => {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyBookings({ page, limit: PAGE_SIZE, status })
      .then((res) => {
        if (!active) return;
        if (res.items.length === 0 && page > 1) {
          setPage(page - 1); // trang vừa hết vé (ví dụ sau khi hủy) thì lùi lại một trang
          return;
        }
        setData(res);
        setError("");
      })
      .catch((err) => {
        if (active)
          setError(
            err.status
              ? err.message || "Không tải được danh sách vé"
              : "Không kết nối được tới máy chủ",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, status, reloadKey]);

  const handleCancel = useCallback(async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy vé này?")) return;
    setCancellingId(id);
    setMessage("");
    setError("");
    try {
      await cancelBooking(id);
      setMessage("Đã hủy vé.");
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(
        err.status
          ? err.message || "Không hủy được vé"
          : "Không kết nối được tới máy chủ",
      );
    } finally {
      setCancellingId("");
    }
  }, []);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  return (
    <main style={pageStyle}>
      <h1>Vé của tôi</h1>
      <p>Chỉ hủy được vé trước giờ chiếu ít nhất 2 tiếng.</p>

      <p>
        <label htmlFor="status">Lọc theo trạng thái </label>
        <select id="status" value={status} onChange={handleStatusChange}>
          <option value="">Tất cả</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </p>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      {loading && <p>Đang tải...</p>}
      {!loading && !error && data.items.length === 0 && (
        <p>Bạn chưa có vé nào.</p>
      )}

      {data.items.map((booking) => (
        <TicketCard
          key={booking._id}
          booking={booking}
          onCancel={handleCancel}
          cancelling={cancellingId === booking._id}
        />
      ))}

      <nav aria-label="Phân trang">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Trước
        </button>
        <span>
          {" "}
          Trang {page}/{data.totalPages || 1}{" "}
        </span>
        <button
          type="button"
          disabled={page >= data.totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </nav>
    </main>
  );
};

export default MyTicketsPage;
