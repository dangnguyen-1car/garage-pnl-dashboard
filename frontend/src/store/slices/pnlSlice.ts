// frontend/src/store/slices/pnlSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { IPnlData, IApiResponse } from '../../types/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface PnlState {
  garagePnl: IPnlData[];
  departmentPnl: IPnlData[];
  loading: boolean;
  error: string | null;
}

const initialState: PnlState = {
  garagePnl: [],
  departmentPnl: [],
  loading: false,
  error: null,
};

export const fetchGaragePnl = createAsyncThunk(
  'pnl/fetchGaragePnl',
  async (params: { from: string; to: string; period: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IPnlData[]>>(
      `${API_BASE}/pnl/garage?from=${params.from}&to=${params.to}&period=${params.period}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

export const fetchDepartmentPnl = createAsyncThunk(
  'pnl/fetchDepartmentPnl',
  async (params: { departmentId: number; from: string; to: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IPnlData[]>>(
      `${API_BASE}/pnl/department/${params.departmentId}?from=${params.from}&to=${params.to}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

const pnlSlice = createSlice({
  name: 'pnl',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGaragePnl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGaragePnl.fulfilled, (state, action) => {
        state.loading = false;
        state.garagePnl = action.payload.data || [];
      })
      .addCase(fetchGaragePnl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch garage P&L data';
      })
      .addCase(fetchDepartmentPnl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentPnl.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentPnl = action.payload.data || [];
      })
      .addCase(fetchDepartmentPnl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch department P&L data';
      });
  },
});

export const { clearError } = pnlSlice.actions;
export default pnlSlice.reducer;
