// frontend/src/pages/pnl/DepartmentPnlPage.tsx (CORRECTED)

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
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchDepartmentPnl,
  fetchTeamsByDepartment,
  addBreadcrumb,
} from '../../store/slices/pnlSlice';
import Breadcrumb from '../../components/Common/Breadcrumb';
import moment from 'moment';

const DepartmentPnlPage: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { departmentPnl, departmentTeams, loading, error } = useSelector(
    (state: RootState) => state.pnl
  );

  const [dateRange] = useState({
    from: moment().startOf('month').format('YYYY-MM-DD'),
    to: moment().endOf('month').format('YYYY-MM-DD')
  });

  useEffect(() => {
    if (departmentId) {
      const deptId = parseInt(departmentId);
      
      // Fetch department P&L data
      dispatch(fetchDepartmentPnl({
        departmentId: deptId,
        from: dateRange.from,
        to: dateRange.to
      }));
      
      // Fetch teams in this department
      dispatch(fetchTeamsByDepartment(deptId));
    }
  }, [dispatch, departmentId, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleTeamClick = (teamId: number, teamName: string) => {
    // Add to breadcrumb
    dispatch(addBreadcrumb({
      level: 'team',
      id: teamId,
      name: teamName,
      path: `/pnl/team/${teamId}`
    }));
    
    // Navigate to team page
    navigate(`/pnl/team/${teamId}`);
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

  // Calculate summary from P&L data
  const summary = departmentPnl.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + item.revenue,
      totalCogs: acc.totalCogs + item.cogs,
      totalGrossProfit: acc.totalGrossProfit + item.grossProfit,
      totalLaborHours: acc.totalLaborHours + item.laborHours,
    }),
    { totalRevenue: 0, totalCogs: 0, totalGrossProfit: 0, totalLaborHours: 0 }
  );

  const grossMargin = summary.totalRevenue > 0 
    ? (summary.totalGrossProfit / summary.totalRevenue) * 100 
    : 0;

  // ✨ FIXED: Safe access to departmentName with null check
  const departmentName = departmentPnl.length > 0 && departmentPnl[0].departmentName 
    ? departmentPnl[0].departmentName 
    : `Bộ phận ${departmentId}`;

  return (
    <Box p={3}>
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        P&L Bộ Phận - {departmentName}
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Kỳ báo cáo: {moment(dateRange.from).format('DD/MM/YYYY')} - {moment(dateRange.to).format('DD/MM/YYYY')}
      </Typography>

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
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Biên Lợi Nhuận
              </Typography>
              <Typography variant="h5">
                {grossMargin.toFixed(1)}%
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Teams List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh Sách Teams/Tổ
            <Typography variant="body2" color="textSecondary">
              👆 Nhấp vào team để xem chi tiết
            </Typography>
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tên Team</strong></TableCell>
                  <TableCell align="right"><strong>Số Nhân Viên</strong></TableCell>
                  <TableCell align="right"><strong>Mục Tiêu Doanh Thu</strong></TableCell>
                  <TableCell align="right"><strong>Doanh Thu Gần Đây</strong></TableCell>
                  <TableCell align="right"><strong>Mục Tiêu Lợi Nhuận</strong></TableCell>
                  <TableCell align="center"><strong>Hành Động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departmentTeams.map((team) => (
                  <TableRow 
                    key={team.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => handleTeamClick(team.id, team.name)}
                  >
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {team.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={team.employeeCount} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(team.targetRevenue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(team.recentRevenue)}
                    </TableCell>
                    <TableCell align="right">
                      {team.targetProfitPct.toFixed(1)}%
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeamClick(team.id, team.name);
                        }}
                      >
                        Xem Chi Tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {departmentTeams.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                Không có team nào trong bộ phần này
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DepartmentPnlPage;
