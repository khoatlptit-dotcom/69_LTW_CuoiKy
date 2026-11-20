exports.parsePaging = ({ page, limit }) => {
  const p = Math.max(Number(page) || 1, 1);
  const l = Math.min(Math.max(Number(limit) || 10, 1), 100);
  return { page: p, limit: l, skip: (p - 1) * l };
};