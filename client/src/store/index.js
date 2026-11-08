import { configureStore } from '@reduxjs/toolkit';
import seatReducer from './seatSlice';

const store = configureStore({
  reducer: { seats: seatReducer },
});

export default store;
