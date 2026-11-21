const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDateTime = (value) =>
  new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const BookingSummary = ({ showtime, room, selected, total, maxSeats, busy, onClear, onConfirm }) => {
  const vipCount = selected.filter((seat) => seat.type === 'vip').length;
  const normalCount = selected.length - vipCount;

  return (
    <aside className="booking-summary">
      <h2 className="booking-summary__title">Thông tin đặt vé</h2>

      <dl className="booking-summary__info">
        <dt>Phòng</dt>
        <dd>{room.name}</dd>
        <dt>Suất chiếu</dt>
        <dd>
          {formatDateTime(showtime.startTime)} - {formatDateTime(showtime.endTime)}
        </dd>
      </dl>

      <div className="booking-summary__seats">
        <p>
          Ghế đã chọn: <strong>{selected.length}</strong>/{maxSeats}
        </p>
        {selected.length === 0 ? (
          <p className="booking-summary__empty">Chưa chọn ghế nào</p>
        ) : (
          <ul className="booking-summary__chips">
            {selected.map((seat) => (
              <li key={seat.id} className={`chip${seat.type === 'vip' ? ' chip--vip' : ''}`}>
                {seat.id}
              </li>
            ))}
          </ul>
        )}
        {selected.length > 0 && (
          <p className="booking-summary__breakdown">
            Thường: {normalCount} · VIP: {vipCount}
          </p>
        )}
      </div>

      <p className="booking-summary__total">
        Tổng tiền <strong>{formatCurrency(total)}</strong>
      </p>

      <div className="booking-summary__actions">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={busy || selected.length === 0}
          onClick={onClear}
        >
          Bỏ chọn tất cả
        </button>
        {onConfirm && (
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy || selected.length === 0}
            onClick={onConfirm}
          >
            Xác nhận đặt vé
          </button>
        )}
      </div>
    </aside>
  );
};

export default BookingSummary;