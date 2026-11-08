import request from './client';

// TODO: các hàm gọi API cho room
export const getAll = () => request('/rooms');
