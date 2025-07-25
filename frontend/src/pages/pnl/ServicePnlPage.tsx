// frontend/src/pages/pnl/ServicePnlPage.tsx (FIXED - Remove unused imports)

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Avatar,
  Badge,
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import { fetchServicePnl } from '../../store/slices/pnlSlice';
import Breadcrumb from '../../components/Common/Breadcrumb';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import moment from 'moment';

const ServicePnlPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { servicePnl, loading, error } = useSelector(
    (state: RootState) => state.pnl
  );

  useEffect(() => {
    if (serviceId) {
      dispatch(fetchServicePnl(serviceId));
    }
  }, [dispatch, serviceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'success';
    if (margin >= 20) return 'warning';
    return 'error';
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

  if (!servicePnl) {
    return (
      <Box p={3}>
        <Alert severity="warning">Không tìm thấy dữ liệu đơn dịch vụ</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Header with Service Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Badge badgeContent={servicePnl.details?.length || 0} color="primary">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <ReceiptIcon />
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h4">
                Đơn Dịch Vụ: {servicePnl.orderCode}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {moment(servicePnl.orderDate).format('DD/MM/YYYY')} → {moment(servicePnl.completionDate).format('DD/MM/YYYY')}
              </Typography>
            </Box>
          </Box>
          
          {/* Customer & Vehicle Info */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Khách hàng:</strong> {servicePnl.customerName}
                </Typography>
                <Chip 
                  label={servicePnl.customerType === 'khachmoi' ? 'Khách mới' : 'Khách cũ'} 
                  size="small" 
                  color={servicePnl.customerType === 'khachmoi' ? 'success' : 'primary'}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <CarRepairIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Xe:</strong> {servicePnl.vehicleBrand} {servicePnl.vehicleModel}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h5">
                {formatCurrency(servicePnl.totalAmount)}
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
              <Typography variant="h5">
                {formatCurrency(servicePnl.totalCost)}
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
              <Typography 
                variant="h5" 
                color={servicePnl.grossProfit > 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(servicePnl.grossProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Biên Lợi Nhuận
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography variant="h5" sx={{ mr: 1 }}>
                  {servicePnl.grossMargin.toFixed(1)}%
                </Typography>
                <Chip 
                  label={
                    servicePnl.grossMargin >= 30 ? 'Tốt' : 
                    servicePnl.grossMargin >= 20 ? 'Đạt' : 'Thấp'
                  }
                  size="small" 
                  color={getMarginColor(servicePnl.grossMargin)}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Chi Tiết Dịch Vụ & Phụ Tùng
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tên Sản Phẩm/Dịch Vụ</strong></TableCell>
                  <TableCell><strong>Danh Mục</strong></TableCell>
                  <TableCell><strong>Nhân Viên</strong></TableCell>
                  <TableCell align="center"><strong>SL</strong></TableCell>
                  <TableCell align="right"><strong>Đơn Giá</strong></TableCell>
                  <TableCell align="right"><strong>Giá Vốn</strong></TableCell>
                  <TableCell align="right"><strong>Thành Tiền</strong></TableCell>
                  <TableCell align="right"><strong>Lợi Nhuận</strong></TableCell>
                  <TableCell align="center"><strong>Biên LN</strong></TableCell>
                  <TableCell align="right"><strong>Giờ Công</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {servicePnl.details?.map((detail: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {detail.productName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={detail.categoryName} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {detail.employeeName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {detail.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(detail.unitPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(detail.costPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(detail.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={detail.grossProfit > 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {formatCurrency(detail.grossProfit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${detail.grossMargin.toFixed(1)}%`}
                        size="small" 
                        color={getMarginColor(detail.grossMargin)}
                        variant={detail.grossMargin >= 20 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {detail.laborHours > 0 ? `${detail.laborHours.toFixed(1)}h` : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Summary Row */}
                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                  <TableCell colSpan={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      TỔNG CỘNG
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatCurrency(servicePnl.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold"
                      color={servicePnl.grossProfit > 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(servicePnl.grossProfit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${servicePnl.grossMargin.toFixed(1)}%`}
                      color={getMarginColor(servicePnl.grossMargin)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {servicePnl.details?.reduce((sum: number, detail: any) => sum + detail.laborHours, 0).toFixed(1)}h
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          {(!servicePnl.details || servicePnl.details.length === 0) && (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                Không có chi tiết dịch vụ
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ServicePnlPage;
