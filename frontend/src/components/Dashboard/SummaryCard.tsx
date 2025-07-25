// frontend/src/components/Dashboard/SummaryCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { IPnlSummary } from '../../types/api';

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  isPercentage?: boolean;
  isCurrency?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  isPercentage = false,
  isCurrency = false,
}) => {
  const formatValue = (val: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(val);
    }
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString('vi-VN');
  };

  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="h6">
          {title}
        </Typography>
        <Typography variant="h4" component="h2">
          {formatValue(value)}
        </Typography>
        {subtitle && (
          <Typography color="textSecondary" variant="body2">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
