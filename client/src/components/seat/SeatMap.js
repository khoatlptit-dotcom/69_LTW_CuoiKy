import { useMemo } from 'react';
import SeatRow from './SeatRow';

const SeatMap = ({ seats, selectedIds, disabled, onToggle }) => {
  const rows = useMemo(() => {
    const grouped = new Map();
    seats.forEach((seat) => {
      if (!grouped.has(seat.row)) grouped.set(seat.row, []);
      grouped.get(seat.row).push(seat);
    });
    return [...grouped.entries()];
  }, [seats]);

  return (
    <div className="seat-map">
      <div className="seat-map__screen" aria-hidden="true">
        MÀN HÌNH
      </div>
      <div className="seat-map__rows">
        {rows.map(([label, rowSeats]) => (
          <SeatRow
            key={label}
            label={label}
            seats={rowSeats}
            selectedIds={selectedIds}
            disabled={disabled}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatMap;