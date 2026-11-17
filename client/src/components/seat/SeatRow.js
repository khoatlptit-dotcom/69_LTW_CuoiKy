import Seat from './Seat';

// Trạng thái hiển thị: ghế đang chọn (Redux) được ưu tiên hơn trạng thái từ server.
const getDisplayStatus = (seat, selectedIds) => {
  if (selectedIds.has(seat.seatNumber)) return 'selected';
  if (seat.status === 'mine') return 'available';
  return seat.status;
};

const SeatRow = ({ label, seats, selectedIds, disabled, onToggle }) => (
  <div className="seat-row" role="group" aria-label={`Hàng ${label}`}>
    <span className="seat-row__label">{label}</span>
    <div className="seat-row__seats">
      {seats.map((seat) => (
        <Seat
          key={seat.seatNumber}
          seat={seat}
          status={getDisplayStatus(seat, selectedIds)}
          disabled={disabled}
          onToggle={onToggle}
        />
      ))}
    </div>
    <span className="seat-row__label">{label}</span>
  </div>
);

export default SeatRow;