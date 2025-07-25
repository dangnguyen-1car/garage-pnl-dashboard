// frontend/src/components/Dashboard/DashboardOverview.tsx (Updated - Thay thế toàn bộ file)

import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { fetchDashboardOverview, setPeriod } from '../../store/slices/dashboardSlice';
import { setDrillDownContext, clearDrillDownData } from '../../store/slices/pnlSlice';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  InteractionItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { overview, loading, selectedPeriod } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardOverview(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  const handlePeriodChange = (event: any) => {
    const period = event.target.value;
    dispatch(setPeriod(period));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // ✨ NEW: Handle department click for drill-down
  const handleDepartmentClick = (event: any, elements: InteractionItem[]) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const departmentData = overview?.departmentPerformance?.[clickedIndex];
      
      if (departmentData) {
        // Clear previous drill-down data
        dispatch(clearDrillDownData());
        
        // Set drill-down context
        dispatch(setDrillDownContext({
          level: 'department',
          id: clickedIndex + 1, // Assuming department IDs start from 1
          name: departmentData.name,
          breadcrumb: [
            {
              level: 'garage',
              id: 'garage',
              name: 'Tổng Garage',
              path: '/dashboard'
            },
            {
              level: 'department',
              id: clickedIndex + 1,
              name: departmentData.name,
              path: `/pnl/department/${clickedIndex + 1}`
            }
          ]
        }));
        
        // Navigate to department page
        navigate(`/pnl/department/${clickedIndex + 1}`);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!overview) return null;

  // Chart data cho Customer Type Revenue
  const customerTypeData = {
    labels: overview.customerTypeRevenue?.map((item: any) => 
      item.type === 'khachmoi' ? 'Khách mới' : 'Khách cũ'
    ) || [],
    datasets: [
      {
        data: overview.customerTypeRevenue?.map((item: any) => item.revenue) || [],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  // ✨ UPDATED: Chart data cho Department Performance với click handler
  const deptPerformanceData = {
    labels: overview.departmentPerformance?.map((dept: any) => dept.name) || [],
    datasets: [
      {
        label: 'Doanh thu thực tế',
        data: overview.departmentPerformance?.map((dept: any) => dept.actualRevenue) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Mục tiêu',
        data: overview.departmentPerformance?.map((dept: any) => dept.targetRevenue) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
  };

  // Chart data cho Category Revenue
  const categoryData = {
    labels: overview.categoryRevenue?.slice(0, 10).map((cat: any) => cat.name) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: overview.categoryRevenue?.slice(0, 10).map((cat: any) => cat.revenue) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Dashboard P&L Garage
        </Typography>
        <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
          <InputLabel>Kỳ báo cáo</InputLabel>
          <Select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            label="Kỳ báo cáo"
          >
            <MenuItem value="this_month">Tháng này</MenuItem>
            <MenuItem value="last_month">Tháng trước</MenuItem>
            <MenuItem value="this_quarter">Quý này</MenuItem>
            <MenuItem value="this_year">Năm này</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h5" component="h2">
                {formatCurrency(overview.summary.totalRevenue)}
              </Typography>
              <Typography color="textSecondary">
                Biên lợi nhuận: {overview.summary.grossMargin.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Lợi Nhuận Gộp
              </Typography>
              <Typography variant="h5" component="h2">
                {formatCurrency(overview.summary.grossProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng Chi Phí
              </Typography>
              <Typography variant="h5" component="h2">
                {formatCurrency(overview.summary.totalCogs)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng Giờ Công
              </Typography>
              <Typography variant="h5" component="h2">
                {overview.summary.totalLaborHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Customer Type Revenue */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Doanh Thu Theo Loại Khách Hàng
              </Typography>
              <Box height={300}>
                <Doughnut 
                  data={customerTypeData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ✨ UPDATED: Department Performance with click handler */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hiệu Suất Theo Bộ Phận
                <Typography variant="body2" color="textSecondary">
                  👆 Nhấp vào cột để xem chi tiết bộ phận
                </Typography>
              </Typography>
              <Box height={300}>
                <Bar 
                  data={deptPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: handleDepartmentClick,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          afterLabel: (context) => {
                            return 'Nhấp để xem chi tiết';
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return new Intl.NumberFormat('vi-VN').format(value as number);
                          }
                        }
                      }
                    },
                    onHover: (event, elements) => {
                      (event.native?.target as HTMLElement).style.cursor = 
                        elements.length > 0 ? 'pointer' : 'default';
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Revenue */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Doanh Thu Theo Danh Mục Dịch Vụ (Top 10)
              </Typography>
              <Box height={400}>
                <Bar 
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return new Intl.NumberFormat('vi-VN').format(value as number);
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
