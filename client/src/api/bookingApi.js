import request from './client';

// TODO: các hàm gọi API cho booking
export const getAll = () => request('/bookings');
