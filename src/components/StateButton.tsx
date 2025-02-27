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
      sx={{ width: '100%' }}
      {...props}
    >
      <span className="StateButton-text">{children}</span>
    </Button>
  )
)(({ theme }) => ({
  width: '100%',
  minWidth: '150px',
  padding: theme.spacing(1.25, 2),
  '& .StateButton-text': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    width: '100%',
    wordBreak: 'break-all',
  },
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
