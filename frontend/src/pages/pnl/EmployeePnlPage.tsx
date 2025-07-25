// frontend/src/pages/pnl/EmployeePnlPage.tsx (FIXED VERSION)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar,
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchEmployeePnl,
  fetchOrdersByEmployee,
  addBreadcrumb,
} from '../../store/slices/pnlSlice';
import Breadcrumb from '../../components/Common/Breadcrumb';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import moment from 'moment';
import { IEmployeePnl, IServiceOrderSummary } from '../../types/api';

const EmployeePnlPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { employeePnl, employeeOrders, loading, error } = useSelector(
    (state: RootState) => state.pnl
  );

  const [dateRange] = useState({
    from: moment().startOf('month').format('YYYY-MM-DD'),
    to: moment().endOf('month').format('YYYY-MM-DD')
  });

  useEffect(() => {
    if (employeeId) {
      const empId = parseInt(employeeId);
      
      // Fetch employee P&L data
      dispatch(fetchEmployeePnl({
        employeeId: empId,
        from: dateRange.from,
        to: dateRange.to
      }));
      
      // Fetch orders by this employee
      dispatch(fetchOrdersByEmployee({
        employeeId: empId,
        from: dateRange.from,
        to: dateRange.to
      }));
    }
  }, [dispatch, employeeId, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (grossMargin: number): "success" | "warning" | "error" => {
    if (grossMargin >= 30) return 'success';
    if (grossMargin >= 20) return 'warning';
    return 'error';
  };

  const handleOrderClick = (orderCode: string) => {
    // Add to breadcrumb
    dispatch(addBreadcrumb({
      level: 'service',
      id: orderCode,
      name: `Đơn ${orderCode}`,
      path: `/pnl/service/${orderCode}`
    }));
    
    // Navigate to service page
    navigate(`/pnl/service/${orderCode}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Get employee info from first P&L record
  const employeeInfo: IEmployeePnl | null = employeePnl.length > 0 ? employeePnl[0] : null;

  // ✨ FIXED: Calculate summary with proper typing
  const summary = employeePnl.reduce(
    (acc: {
      totalRevenue: number;
      totalCogs: number;
      totalGrossProfit: number;
      totalLaborHours: number;
      totalLaborCost: number;
    }, item: IEmployeePnl) => ({
      totalRevenue: acc.totalRevenue + item.revenue,
      totalCogs: acc.totalCogs + item.cogs,
      totalGrossProfit: acc.totalGrossProfit + item.grossProfit,
      totalLaborHours: acc.totalLaborHours + item.laborHours,
      totalLaborCost: acc.totalLaborCost + (item.laborCost || 0),
    }),
    { 
      totalRevenue: 0, 
      totalCogs: 0, 
      totalGrossProfit: 0, 
      totalLaborHours: 0,
      totalLaborCost: 0
    }
  );

  const grossMargin = summary.totalRevenue > 0 
    ? (summary.totalGrossProfit / summary.totalRevenue) * 100 
    : 0;

  const hoursAchievement = employeeInfo?.targetHours && employeeInfo.targetHours > 0 
    ? (summary.totalLaborHours / employeeInfo.targetHours) * 100 
    : 0;

  return (
    <Box p={3}>
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Header with Employee Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h4">
                {employeeInfo?.employeeName || `Nhân viên ${employeeId}`}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {employeeInfo?.employeeCode} | {employeeInfo?.position} | 
                Cấp {employeeInfo?.level} | {employeeInfo?.departmentName} - {employeeInfo?.teamName}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" color="textSecondary">
            Kỳ báo cáo: {moment(dateRange.from).format('DD/MM/YYYY')} - {moment(dateRange.to).format('DD/MM/YYYY')}
          </Typography>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {employeeOrders.length} đơn hàng
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
              <Typography variant="h5" color={grossMargin >= 20 ? 'success.main' : 'warning.main'}>
                {formatCurrency(summary.totalGrossProfit)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Biên: {grossMargin.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Giờ Công Thực Hiện
              </Typography>
              <Typography variant="h5">
                {summary.totalLaborHours.toFixed(1)}h
              </Typography>
              <Typography variant="body2" color={hoursAchievement >= 100 ? 'success.main' : 'warning.main'}>
                Đạt {hoursAchievement.toFixed(1)}% mục tiêu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Chi Phí Nhân Công
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalLaborCost)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {employeeInfo?.hourlyRate ? formatCurrency(employeeInfo.hourlyRate) : '0'}/giờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh Sách Đơn Hàng Dịch Vụ
            <Typography variant="body2" color="textSecondary">
              👆 Nhấp vào đơn hàng để xem chi tiết
            </Typography>
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Mã Đơn</strong></TableCell>
                  <TableCell><strong>Ngày Hoàn Thành</strong></TableCell>
                  <TableCell><strong>Khách Hàng</strong></TableCell>
                  <TableCell><strong>Xe</strong></TableCell>
                  <TableCell align="right"><strong>Doanh Thu</strong></TableCell>
                  <TableCell align="right"><strong>Lợi Nhuận</strong></TableCell>
                  <TableCell align="center"><strong>Biên LN</strong></TableCell>
                  <TableCell align="right"><strong>Giờ Công</strong></TableCell>
                  <TableCell align="center"><strong>Hành Động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeOrders.map((order: IServiceOrderSummary) => (
                  <TableRow 
                    key={order.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => handleOrderClick(order.orderCode)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <ReceiptIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2" fontFamily="monospace">
                          {order.orderCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {moment(order.completionDate).format('DD/MM/YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.customerName}
                      </Typography>
                      <Chip 
                        label={order.customerType === 'khachmoi' ? 'Khách mới' : 'Khách cũ'} 
                        size="small" 
                        color={order.customerType === 'khachmoi' ? 'success' : 'primary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.vehicleBrand} {order.vehicleModel}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.licensePlate}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={order.grossProfit > 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {formatCurrency(order.grossProfit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${order.grossMargin.toFixed(1)}%`}
                        size="small" 
                        color={getStatusColor(order.grossMargin)}
                        variant={order.grossMargin >= 20 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {order.totalLaborHours.toFixed(1)}h
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order.orderCode);
                        }}
                      >
                        Chi Tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {employeeOrders.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                Nhân viên này chưa có đơn hàng nào trong kỳ báo cáo
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeePnlPage;
