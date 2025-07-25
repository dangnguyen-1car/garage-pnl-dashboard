// frontend/src/store/slices/dashboardSlice.ts (Updated with types)
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { IOverview, IApiResponse } from '../../types/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface DashboardState {
  overview: IOverview | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: string;
}

const initialState: DashboardState = {
  overview: null,
  loading: false,
  error: null,
  selectedPeriod: 'this_month',
};

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (period: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IOverview>>(
      `${API_BASE}/dashboard/overview?period=${period}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.data || null;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const { setPeriod, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
