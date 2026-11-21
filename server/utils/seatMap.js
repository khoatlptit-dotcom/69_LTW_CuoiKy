const MAX_SEATS_PER_BOOKING = 8;

const rowLabel = (rowNumber) => String.fromCharCode(64 + rowNumber); // 1 -> A

const generateSeats = ({ rows, seatsPerRow, vipRows = [] }) => {
  const vipSet = new Set(vipRows);
  const seats = [];

  for (let r = 1; r <= rows; r += 1) {
    const row = rowLabel(r);
    const type = vipSet.has(r) ? 'vip' : 'normal';
    for (let n = 1; n <= seatsPerRow; n += 1) {
      seats.push({ seatNumber: `${row}${n}`, row, number: n, type });
    }
  }
  return seats;
};

// Trả về 'normal' | 'vip', hoặc null nếu mã ghế không tồn tại trong phòng.
const getSeatType = (room, seatNumber) => {
  const match = /^([A-Z])(\d+)$/.exec(String(seatNumber).toUpperCase());
  if (!match) return null;

  const rowNumber = match[1].charCodeAt(0) - 64;
  const number = Number(match[2]);
  if (rowNumber < 1 || rowNumber > room.rows) return null;
  if (number < 1 || number > room.seatsPerRow) return null;

  return (room.vipRows || []).includes(rowNumber) ? 'vip' : 'normal';
};

// Tính tiền ở server từ loại ghế và giá của suất chiếu, không tin số tiền từ frontend.
const calculateAmount = (room, showtime, seatNumbers) => {
  let total = 0;
  const details = [];

  for (const seatNumber of seatNumbers) {
    const type = getSeatType(room, seatNumber);
    if (!type) {
      throw Object.assign(new Error(`Ghế ${seatNumber} không tồn tại trong phòng`), {
        status: 400,
      });
    }
    const price = type === 'vip' ? showtime.priceVip : showtime.priceNormal;
    total += price;
    details.push({ seatNumber: String(seatNumber).toUpperCase(), seatType: type, price });
  }

  return { total, details };
};

module.exports = {
  MAX_SEATS_PER_BOOKING,
  generateSeats,
  getSeatType,
  calculateAmount,
};