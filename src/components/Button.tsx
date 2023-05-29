import React from 'react';
import { alpha, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const Button = styled(LoadingButton)(({ theme }) => ({
  '&, &.MuiButton-root': {
    boxShadow: 'none',
  },
  '&.MuiButton-containedInherit': {
    backgroundColor: theme.palette.grey[700],

    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[900], 0.6),
    },
  },
  '&.MuiButton-containedPrimary': {
    backgroundColor: theme.palette.primary,
  },
}));
export default Button;
