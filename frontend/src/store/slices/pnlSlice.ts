// frontend/src/store/slices/pnlSlice.ts (FIXED VERSION)

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  IPnlData, 
  IApiResponse, 
  ITeamSummary, 
  IEmployeeSummary, 
  IServiceOrderSummary,
  IEmployeePnl,
  IDrillDownContext,
  ITeamPnl, // ✨ NEW: Import ITeamPnl
  IServicePnl // ✨ NEW: Import IServicePnl
} from '../../types/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface PnlState {
  garagePnl: IPnlData[];
  departmentPnl: IPnlData[];
  employeePnl: IEmployeePnl[];
  employeeOrders: IServiceOrderSummary[];
  
  // ✨ NEW: Add state for Team P&L and Service P&L
  teamPnl: ITeamPnl[]; // State cho dữ liệu P&L của Team
  servicePnl: IServicePnl | null; // State cho dữ liệu P&L của Service Order
  
  departmentTeams: ITeamSummary[];
  teamEmployees: IEmployeeSummary[]; // ✨ NEW: Add state for employees by team
  
  drillDownContext: IDrillDownContext;
  
  loading: boolean;
  error: string | null;
}

const initialState: PnlState = {
  garagePnl: [],
  departmentPnl: [],
  employeePnl: [],
  employeeOrders: [],
  
  teamPnl: [], // Khởi tạo
  servicePnl: null, // Khởi tạo
  
  departmentTeams: [],
  teamEmployees: [], // Khởi tạo
  
  drillDownContext: {
    level: 'garage',
    breadcrumb: []
  },
  loading: false,
  error: null,
};

// Existing thunks
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

export const fetchEmployeePnl = createAsyncThunk(
  'pnl/fetchEmployeePnl',
  async (params: { employeeId: number; from: string; to: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IEmployeePnl[]>>(
      `${API_BASE}/pnl/employee/${params.employeeId}?from=${params.from}&to=${params.to}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

export const fetchOrdersByEmployee = createAsyncThunk(
  'pnl/fetchOrdersByEmployee',
  async (params: { employeeId: number; from: string; to: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IServiceOrderSummary[]>>(
      `${API_BASE}/pnl/employee/${params.employeeId}/orders?from=${params.from}&to=${params.to}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// Existing: Teams by department
export const fetchTeamsByDepartment = createAsyncThunk(
  'pnl/fetchTeamsByDepartment',
  async (departmentId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<ITeamSummary[]>>(
      `${API_BASE}/pnl/department/${departmentId}/teams`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// ✨ NEW: Thunk to fetch Team P&L
export const fetchTeamPnl = createAsyncThunk(
  'pnl/fetchTeamPnl',
  async (params: { teamId: number; from: string; to: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<ITeamPnl[]>>(
      `${API_BASE}/pnl/team/${params.teamId}?from=${params.from}&to=${params.to}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// ✨ NEW: Thunk to fetch Employees by Team
export const fetchEmployeesByTeam = createAsyncThunk(
  'pnl/fetchEmployeesByTeam',
  async (teamId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IEmployeeSummary[]>>(
      `${API_BASE}/pnl/team/${teamId}/employees`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

// ✨ NEW: Thunk to fetch Service P&L
export const fetchServicePnl = createAsyncThunk(
  'pnl/fetchServicePnl',
  async (serviceId: string) => { // serviceId có thể là string (orderCode)
    const token = localStorage.getItem('token');
    const response = await axios.get<IApiResponse<IServicePnl>>( // API trả về 1 object IServicePnl
      `${API_BASE}/pnl/service/${serviceId}`,
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
    
    addBreadcrumb: (state, action: PayloadAction<{
      level: string;
      id: number | string;
      name: string;
      path: string;
    }>) => {
      state.drillDownContext.breadcrumb.push(action.payload);
    },
    
    setDrillDownContext: (state, action: PayloadAction<IDrillDownContext>) => {
      state.drillDownContext = action.payload;
    },
    
    resetToLevel: (state, action: PayloadAction<string>) => {
      const targetLevel = action.payload;
      const levelIndex = state.drillDownContext.breadcrumb.findIndex(
        item => item.level === targetLevel
      );
      
      if (levelIndex >= 0) {
        state.drillDownContext.breadcrumb = state.drillDownContext.breadcrumb.slice(0, levelIndex + 1);
        state.drillDownContext.level = targetLevel as any;
      }
    },
    
    clearDrillDownData: (state) => {
      state.employeePnl = [];
      state.employeeOrders = [];
      state.departmentTeams = [];
      state.teamEmployees = [];
      state.teamPnl = []; // Clear team P&L data
      state.servicePnl = null; // Clear service P&L data
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Existing garage P&L reducers
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
      
      // Department P&L reducers
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
      })
      
      // Employee P&L reducers
      .addCase(fetchEmployeePnl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeePnl.fulfilled, (state, action) => {
        state.loading = false;
        state.employeePnl = action.payload.data || [];
      })
      .addCase(fetchEmployeePnl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employee P&L data';
      })
      
      // Orders by employee reducers
      .addCase(fetchOrdersByEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeOrders = action.payload.data || [];
      })
      .addCase(fetchOrdersByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employee orders';
      })
      
      // Teams by department reducers
      .addCase(fetchTeamsByDepartment.fulfilled, (state, action) => {
        state.departmentTeams = action.payload.data || [];
      })

      // ✨ NEW: Team P&L reducers
      .addCase(fetchTeamPnl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamPnl.fulfilled, (state, action) => {
        state.loading = false;
        state.teamPnl = action.payload.data || [];
      })
      .addCase(fetchTeamPnl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch team P&L data';
      })

      // ✨ NEW: Employees by Team reducers
      .addCase(fetchEmployeesByTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesByTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teamEmployees = action.payload.data || [];
      })
      .addCase(fetchEmployeesByTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees by team';
      })

      // ✨ NEW: Service P&L reducers
      .addCase(fetchServicePnl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicePnl.fulfilled, (state, action) => {
        state.loading = false;
        state.servicePnl = action.payload.data || null; // API trả về 1 object, không phải mảng
      })
      .addCase(fetchServicePnl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch service P&L data';
      });
  },
});

export const { 
  clearError, 
  addBreadcrumb, 
  setDrillDownContext, 
  resetToLevel, 
  clearDrillDownData 
} = pnlSlice.actions;

export default pnlSlice.reducer;