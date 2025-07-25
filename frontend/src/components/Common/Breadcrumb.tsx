// frontend/src/components/Common/Breadcrumb.tsx

import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { resetToLevel } from '../../store/slices/pnlSlice';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';

const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { drillDownContext } = useSelector((state: RootState) => state.pnl);

  const getIcon = (level: string) => {
    switch (level) {
      case 'garage': return <HomeIcon fontSize="small" />;
      case 'department': return <BusinessIcon fontSize="small" />;
      case 'team': return <GroupIcon fontSize="small" />;
      case 'employee': return <PersonIcon fontSize="small" />;
      case 'service': return <ReceiptIcon fontSize="small" />;
      default: return null;
    }
  };

  const handleBreadcrumbClick = (level: string, path: string) => {
    dispatch(resetToLevel(level));
    navigate(path);
  };

  return (
    <Box mb={2}>
      <Breadcrumbs aria-label="breadcrumb" separator="›">
        {drillDownContext.breadcrumb.map((item, index) => {
          const isLast = index === drillDownContext.breadcrumb.length - 1;
          
          return isLast ? (
            <Typography key={item.level} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {getIcon(item.level)}
              <Box ml={0.5}>{item.name}</Box>
            </Typography>
          ) : (
            <Link
              key={item.level}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleBreadcrumbClick(item.level, item.path);
              }}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {getIcon(item.level)}
              <Box ml={0.5}>{item.name}</Box>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
