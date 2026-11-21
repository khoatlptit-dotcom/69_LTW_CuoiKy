import { createSlice } from '@reduxjs/toolkit';

export const MAX_SEATS = 8;

const seatSlice = createSlice({
  name: 'seats',
  // selected: [{ id: 'A1', type: 'normal' | 'vip', price: 80000 }]
  initialState: { showtimeId: null, selected: [] },
  reducers: {
    // Đổi suất chiếu thì xóa lựa chọn cũ.
    startSession: (state, { payload }) => {
      if (state.showtimeId !== payload) {
        state.showtimeId = payload;
        state.selected = [];
      }
    },
    // Đồng bộ danh sách ghế theo phiên giữ ghế trên server.
    setSelected: (state, { payload }) => {
      state.selected = payload.slice(0, MAX_SEATS);
    },
    toggleSeat: (state, { payload }) => {
      const idx = state.selected.findIndex((s) => s.id === payload.id);
      if (idx >= 0) state.selected.splice(idx, 1);
      else if (state.selected.length < MAX_SEATS) state.selected.push(payload);
    },
    clearSeats: (state) => {
      state.selected = [];
    },
  },
});

export const { startSession, setSelected, toggleSeat, clearSeats } = seatSlice.actions;
export default seatSlice.reducer;