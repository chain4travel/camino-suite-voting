import React from 'react';
import { ButtonProps, styled } from '@mui/material';
import Button from './Button';

const checkedClassName = 'RadioButton-checked';
interface RadioButtonProps {
  label?: string;
  checked?: boolean;
}
const RadioButton = styled(
  ({ label, checked, className, ...props }: ButtonProps & RadioButtonProps) => {
    const overrideClassName = checked
      ? [className, checkedClassName].join(' ')
      : className;
    return (
      <Button
        variant="contained"
        color="inherit"
        className={overrideClassName}
        {...props}
      >
        {label}
      </Button>
    );
  }
)(({ theme }) => ({
  backgroundColor: theme.palette.grey[800],
  '.MuiButton-startIcon': {
    color: theme.palette.info.light,
  },
  '&.RadioButton-checked': {
    color: theme.palette.background.default,
    backgroundColor: theme.palette.grey[50],
  },
  '&.RadioButton-checked .MuiButton-startIcon': {
    color: theme.palette.background.default,
  },
}));
export default RadioButton;
