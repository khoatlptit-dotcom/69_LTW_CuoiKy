import { useEffect, useState } from 'react';

// Đếm ngược (giây); gọi onExpire khi về 0
const useCountdown = (seconds, onExpire) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (left <= 0) onExpire?.();
  }, [left, onExpire]);
  return left;
};

export default useCountdown;
