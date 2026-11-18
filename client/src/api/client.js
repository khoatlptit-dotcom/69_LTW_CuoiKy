import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data || {};
    const message =
      data.message ||
      (error.request ? 'Không thể kết nối tới máy chủ' : error.message);
    return Promise.reject(Object.assign(new Error(message), { status, data }));
  }
);

const request = async (path, { method = 'GET', body } = {}) => {
  const response = await api.request({ url: path, method, data: body });
  return response.data;
};

export default request; 