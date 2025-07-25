// frontend/src/pages/pnl/TeamPnlPage.tsx (COMPLETE)

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
  LinearProgress,
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchTeamPnl,
  fetchEmployeesByTeam,
  addBreadcrumb,
} from '../../store/slices/pnlSlice';
import Breadcrumb from '../../components/Common/Breadcrumb';
import moment from 'moment';

const TeamPnlPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { teamPnl, teamEmployees, loading, error } = useSelector(
    (state: RootState) => state.pnl
  );

  const [dateRange] = useState({
    from: moment().startOf('month').format('YYYY-MM-DD'),
    to: moment().endOf('month').format('YYYY-MM-DD')
  });

  useEffect(() => {
    if (teamId) {
      const tId = parseInt(teamId);
      
      // Fetch team P&L data
      dispatch(fetchTeamPnl({
        teamId: tId,
        from: dateRange.from,
        to: dateRange.to
      }));
      
      // Fetch employees in this team
      dispatch(fetchEmployeesByTeam(tId));
    }
  }, [dispatch, teamId, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'L1': return 'error';
      case 'L2': return 'warning';
      case 'L3': return 'info';
      case 'L4': return 'primary';
      case 'L5': return 'success';
      default: return 'default';
    }
  };

  const handleEmployeeClick = (employeeId: number, employeeName: string) => {
    // Add to breadcrumb
    dispatch(addBreadcrumb({
      level: 'employee',
      id: employeeId,
      name: employeeName,
      path: `/pnl/employee/${employeeId}`
    }));
    
    // Navigate to employee page
    navigate(`/pnl/employee/${employeeId}`);
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

  // Calculate summary from team P&L data
  const summary = teamPnl.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + item.revenue,
      totalCogs: acc.totalCogs + item.cogs,
      totalGrossProfit: acc.totalGrossProfit + item.grossProfit,
      totalLaborHours: acc.totalLaborHours + item.laborHours,
      targetRevenue: item.targetRevenue || acc.targetRevenue,
      revenueAchievement: item.revenueAchievement || acc.revenueAchievement,
    }),
    { 
      totalRevenue: 0, 
      totalCogs: 0, 
      totalGrossProfit: 0, 
      totalLaborHours: 0,
      targetRevenue: 0,
      revenueAchievement: 0
    }
  );

  const grossMargin = summary.totalRevenue > 0 
    ? (summary.totalGrossProfit / summary.totalRevenue) * 100 
    : 0;

  const teamName = teamPnl.length > 0 && teamPnl[0].teamName 
    ? teamPnl[0].teamName 
    : `Team ${teamId}`;

  const departmentName = teamPnl.length > 0 && teamPnl[0].departmentName 
    ? teamPnl[0].departmentName 
    : 'N/A';

  return (
    <Box p={3}>
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        P&L Team - {teamName}
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Thuộc: {departmentName} | 
        Kỳ báo cáo: {moment(dateRange.from).format('DD/MM/YYYY')} - {moment(dateRange.to).format('DD/MM/YYYY')}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Doanh Thu Thực Tế
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Mục tiêu: {formatCurrency(summary.targetRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tỷ Lệ Hoàn Thành
              </Typography>
              <Typography variant="h5" color={summary.revenueAchievement >= 100 ? 'success.main' : 'warning.main'}>
                {summary.revenueAchievement.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(summary.revenueAchievement, 100)}
                color={summary.revenueAchievement >= 100 ? 'success' : 'primary'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Lợi Nhuận Gộp
              </Typography>
              <Typography variant="h5">
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
                Tổng Giờ Công
              </Typography>
              <Typography variant="h5">
                {summary.totalLaborHours.toFixed(1)}h
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {teamEmployees.length} nhân viên
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employees List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh Sách Nhân Viên
            <Typography variant="body2" color="textSecondary">
              👆 Nhấp vào nhân viên để xem chi tiết đơn hàng
            </Typography>
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Mã NV</strong></TableCell>
                  <TableCell><strong>Tên Nhân Viên</strong></TableCell>
                  <TableCell><strong>Chức Vụ</strong></TableCell>
                  <TableCell align="center"><strong>Cấp Độ</strong></TableCell>
                  <TableCell align="right"><strong>Lương/Giờ</strong></TableCell>
                  <TableCell align="right"><strong>Doanh Thu Gần Đây</strong></TableCell>
                  <TableCell align="right"><strong>Giờ Công Gần Đây</strong></TableCell>
                  <TableCell align="center"><strong>Hành Động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamEmployees.map((employee) => {
                  const efficiency = employee.recentHours > 0 
                    ? employee.recentRevenue / employee.recentHours 
                    : 0;
                  
                  return (
                    <TableRow 
                      key={employee.id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                      onClick={() => handleEmployeeClick(employee.id, employee.name)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {employee.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {employee.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.position}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={employee.level} 
                          size="small" 
                          color={getLevelColor(employee.level) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(employee.hourlyRate)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={employee.recentRevenue > 0 ? 'success.main' : 'text.secondary'}>
                          {formatCurrency(employee.recentRevenue)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {efficiency > 0 ? `${formatCurrency(efficiency)}/h` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {employee.recentHours.toFixed(1)}h
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Mục tiêu: {employee.targetHours.toFixed(0)}h
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmployeeClick(employee.id, employee.name);
                          }}
                        >
                          Xem Đơn Hàng
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {teamEmployees.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                Không có nhân viên nào trong team này
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamPnlPage;
