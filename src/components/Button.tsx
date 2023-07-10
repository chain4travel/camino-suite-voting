import React from 'react';
import { alpha, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

const Button = styled(LoadingButton)(({ theme }) => ({
  '&, &.MuiButton-root': {
    boxShadow: 'none',
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.divider,
  },
  '&.MuiButton-contained': {
    color: theme.palette.text.primary,
  },
  '&.MuiButton-containedInherit': {
    backgroundColor: theme.palette.grey[700],

    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[700], 0.6),
    },
  },
  '&.MuiButton-containedPrimary': {
    backgroundColor: theme.palette.primary,
  },
  '&.MuiButton-containedAccent': {
    color: theme.palette.grey[900],
  },
  '&.Mui-disabled': {
    color: alpha(theme.palette.grey[100], 0.5),
    borderColor: alpha(theme.palette.divider, 0.5),
  },
}));
export default Button;
