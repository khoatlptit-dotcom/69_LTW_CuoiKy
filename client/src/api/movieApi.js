import request from './client';

// TODO: các hàm gọi API cho movie
export const getAll = () => request('/movies');
