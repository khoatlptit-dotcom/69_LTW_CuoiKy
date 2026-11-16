export const toQuery = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  ).toString();
  return qs ? `?${qs}` : '';
};