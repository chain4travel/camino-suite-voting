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
  padding: theme.spacing(1.25, 2),
  '&.Mui-disabled': {
    borderColor: 'inherit',
    color: theme.palette.grey[50],
    '&.MuiButton-contained': {
      backgroundColor: theme.palette.grey[800],
    },
    '&.StateButton-success .MuiButton-startIcon': {
      color: theme.palette.success.main,
    },
    '&.StateButton-error .MuiButton-startIcon': {
      color: theme.palette.error.main,
    },
  },
}));
export default StateButton;
