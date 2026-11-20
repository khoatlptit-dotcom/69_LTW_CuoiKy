const ITEMS = [
  { className: 'seat--available', label: 'Ghế thường' },
  { className: 'seat--available seat--vip', label: 'Ghế VIP' },
  { className: 'seat--selected', label: 'Đang chọn' },
  { className: 'seat--held', label: 'Người khác đang giữ' },
  { className: 'seat--sold', label: 'Đã bán', mark: '✕' },
];

const SeatLegend = () => (
  <ul className="seat-legend" aria-label="Chú thích trạng thái ghế">
    {ITEMS.map((item) => (
      <li key={item.label} className="seat-legend__item">
        <span className={`seat seat--legend ${item.className}`}>{item.mark || ''}</span>
        {item.label}
      </li>
    ))}
  </ul>
);

export default SeatLegend;