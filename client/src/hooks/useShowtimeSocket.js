import { useEffect, useRef } from 'react';
import socket from '../api/socket';

const EVENTS = ['seat:held', 'seat:released', 'seat:booked', 'seat:cancelled'];

const useShowtimeSocket = (showtimeId, handlers) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!showtimeId) return undefined;

    const join = () => socket.emit('showtime:join', showtimeId);
    const onConnect = () => {
      join();
      handlersRef.current.onConnect?.();
    };
    const listeners = EVENTS.map((event) => {
      const fn = (payload) => payload.showtimeId === showtimeId && handlersRef.current[event]?.(payload);
      socket.on(event, fn);
      return [event, fn];
    });

    socket.on('connect', onConnect);
    if (socket.connected) join();
    else socket.connect();

    return () => {
      socket.emit('showtime:leave', showtimeId);
      socket.off('connect', onConnect);
      listeners.forEach(([event, fn]) => socket.off(event, fn));
    };
  }, [showtimeId]);
};

export default useShowtimeSocket;