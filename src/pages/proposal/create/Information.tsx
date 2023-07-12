import { Box, alpha, styled } from '@mui/material';
import React from 'react';

const Information = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[700],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[700], 0.3),
}));
export default Information;
