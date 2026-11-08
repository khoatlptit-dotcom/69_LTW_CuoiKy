import request from './client';

// TODO: các hàm gọi API cho showtime
export const getAll = () => request('/showtimes');
