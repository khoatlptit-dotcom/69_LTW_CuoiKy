import request from './client';

export const getSeatMap = (showtimeId) => request(`/seats/showtime/${showtimeId}`);

export const holdSeats = (showtimeId, seatNumbers) =>
  request('/seats/hold', { method: 'POST', body: { showtimeId, seatNumbers } });

export const releaseSeats = (showtimeId) =>
  request(`/seats/hold/${showtimeId}`, { method: 'DELETE' });