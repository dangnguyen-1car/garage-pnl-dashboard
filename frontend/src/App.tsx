// frontend/src/App.tsx (Updated - Thay thế toàn bộ file)

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { getCurrentUser } from './store/slices/authSlice';
import { RootState } from './store/store';

// ✨ NEW: Import drill-down pages
import DepartmentPnlPage from './pages/pnl/DepartmentPnlPage';
import TeamPnlPage from './pages/pnl/TeamPnlPage';
import EmployeePnlPage from './pages/pnl/EmployeePnlPage';
import ServicePnlPage from './pages/pnl/ServicePnlPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser() as any);
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        
        {/* ✨ UPDATED: Main Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardOverview />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* ✨ NEW: P&L Drill-down Routes */}
        <Route
          path="/pnl/department/:departmentId"
          element={
            <ProtectedRoute>
              <Layout>
                <DepartmentPnlPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pnl/team/:teamId"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamPnlPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pnl/employee/:employeeId"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <EmployeePnlPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pnl/service/:serviceId"
          element={
            <ProtectedRoute>
              <Layout>
                <ServicePnlPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Default routes */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
