import request from './client';

export const getAll = () => request('/rooms');
export const getById = (id) => request(`/rooms/${id}`);
export const create = (data) => request('/rooms', { method: 'POST', body: data });
export const update = (id, data) =>
  request(`/rooms/${id}`, { method: 'PUT', body: data });
export const remove = (id) => request(`/rooms/${id}`, { method: 'DELETE' });