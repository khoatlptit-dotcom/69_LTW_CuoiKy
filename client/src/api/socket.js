import { io } from 'socket.io-client';

// Build production (triển khai): kết nối cùng địa chỉ với trang web. Khi phát triển: cổng 5000.
const SOCKET_URL =
  process.env.NODE_ENV === 'production'
    ? undefined
    : process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, { autoConnect: false });

export default socket;