// frontend/src/store/store.ts (Updated)
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import pnlSlice from './slices/pnlSlice';
import dashboardSlice from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    pnl: pnlSlice,
    dashboard: dashboardSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
