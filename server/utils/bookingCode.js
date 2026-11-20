const generateBookingCode = () => {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK${time}${random}`;
};

module.exports = generateBookingCode;