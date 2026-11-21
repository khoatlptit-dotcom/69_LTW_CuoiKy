const STATUS_LABEL = {
  available: 'còn trống',
  selected: 'đang chọn',
  held: 'người khác đang giữ',
  sold: 'đã bán',
};

const Seat = ({ seat, status, disabled, onToggle }) => {
  const isVip = seat.type === 'vip';
  const clickable = status === 'available' || status === 'selected';
  const classes = ['seat', `seat--${status}`, isVip ? 'seat--vip' : ''].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || !clickable}
      aria-pressed={status === 'selected'}
      aria-label={`Ghế ${seat.seatNumber}, ${isVip ? 'VIP' : 'thường'}, ${STATUS_LABEL[status]}`}
      title={`${seat.seatNumber} · ${isVip ? 'VIP' : 'Thường'} · ${seat.price.toLocaleString('vi-VN')} ₫`}
      onClick={() => onToggle(seat)}
    >
      {status === 'sold' ? '✕' : seat.number}
    </button>
  );
};

export default Seat;