const BASE = process.env.REACT_APP_API_URL || '/api';

const request = async (path, { method = 'GET', body } = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Lỗi'), { status: res.status, data });
  return data;
};

export default request;
