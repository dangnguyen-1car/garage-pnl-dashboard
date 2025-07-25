// frontend/src/components/Layout/Layout.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            P&L Dashboard - Garage Management
          </Typography>
          {user && (
            <Box display="flex" alignItems="center">
              <Typography variant="body2" sx={{ mr: 2 }}>
                Xin chào, {user.fullName || user.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
