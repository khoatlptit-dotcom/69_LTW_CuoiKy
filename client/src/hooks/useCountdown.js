import { useEffect, useRef, useState } from 'react';

const calcSecondsLeft = (expiresAt, offsetMs) =>
  expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - (Date.now() + offsetMs)) / 1000))
    : null;

// expiresAt: hạn giữ ghế do server trả về
// offsetMs: serverTime - Date.now() của máy khách, để đồng hồ theo giờ server
const useCountdown = (expiresAt, offsetMs = 0, onExpire) => {
  const [left, setLeft] = useState(() => calcSecondsLeft(expiresAt, offsetMs));
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setLeft(calcSecondsLeft(expiresAt, offsetMs));
    if (!expiresAt) return undefined;

    const id = setInterval(() => {
      const next = calcSecondsLeft(expiresAt, offsetMs);
      setLeft(next);
      if (next <= 0) {
        clearInterval(id);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt, offsetMs]);

  return left;
};

export default useCountdown;