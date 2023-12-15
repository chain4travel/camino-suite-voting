import React from 'react';
import { CircularProgress } from '@mui/material';
import { LoadingButtonProps } from '@mui/lab';
import { Refresh } from '@mui/icons-material';
import Button from './Button';

type RefreshButtonProps = LoadingButtonProps & { onRefresh: () => void };
const RefreshButton = ({
  onRefresh,
  loading,
  ...props
}: RefreshButtonProps) => (
  <Button
    {...props}
    loading={loading}
    loadingIndicator={
      <CircularProgress
        sx={{ color: 'text.primary' }}
        size={17}
        thickness={6}
      />
    }
    onClick={onRefresh}
    sx={{ minWidth: 40, py: 0.25 }}
  >
    {!loading && <Refresh sx={{ color: 'text.primary' }} />}
  </Button>
);
export default RefreshButton;
