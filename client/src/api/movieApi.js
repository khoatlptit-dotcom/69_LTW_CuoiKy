import request from './client';

// Ghép object thành chuỗi ?page=1&q=abc (bỏ qua giá trị rỗng)
const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const getAll = (params) => request(`/movies${buildQuery(params)}`);
export const getById = (id) => request(`/movies/${id}`);
export const create = (data) => request('/movies', { method: 'POST', body: data });
export const update = (id, data) =>
  request(`/movies/${id}`, { method: 'PUT', body: data });
export const remove = (id) => request(`/movies/${id}`, { method: 'DELETE' });