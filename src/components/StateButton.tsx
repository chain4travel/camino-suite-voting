import React from 'react';
import { ButtonProps, styled } from '@mui/material';
import Button from './Button';

const StateButton = styled(
  ({ color, children, className, ...props }: ButtonProps) => (
    <Button
      variant="outlined"
      color={color}
      className={`${className} StateButton-${color}`}
      disabled
      {...props}
    >
      {children}
    </Button>
  )
)(({ theme }) => ({
  minWidth: '150px',
  borderRadius: theme.typography.fontSize + 4,
  '&.Mui-disabled': {
    borderColor: 'inherit',
    color: theme.palette.grey[50],
    '&.MuiButton-contained': {
      backgroundColor: theme.palette.grey[500],
    },
    '&.StateButton-success': {
      color: theme.palette.success.main,
    },
    '&.StateButton-error': {
      color: theme.palette.error.light,
    },
    '&.StateButton-accent': {
      color: theme.palette.accent.main,
    },
  },
}));
export default StateButton;
