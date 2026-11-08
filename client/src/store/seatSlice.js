import { createSlice } from '@reduxjs/toolkit';

const MAX_SEATS = 8;

const seatSlice = createSlice({
  name: 'seats',
  initialState: { selected: [] }, // [{ id: 'A1', type: 'normal' | 'vip' }]
  reducers: {
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

export const { toggleSeat, clearSeats } = seatSlice.actions;
export default seatSlice.reducer;
