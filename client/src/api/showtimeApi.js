import request from './client';
import { toQuery } from '../utils/query';

export const getAll = (params) => request(`/showtimes${toQuery(params)}`);
export const getById = (id) => request(`/showtimes/${id}`);
export const create = (body) => request('/showtimes', { method: 'POST', body });
export const update = (id, body) => request(`/showtimes/${id}`, { method: 'PUT', body });
export const remove = (id) => request(`/showtimes/${id}`, { method: 'DELETE' });
export const getMovieOptions = () => request('/movies?limit=100');
export const getRoomOptions = () => request('/rooms');