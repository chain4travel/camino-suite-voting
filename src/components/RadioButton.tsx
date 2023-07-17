import React from 'react';
import { ButtonProps, alpha, styled } from '@mui/material';
import Radio from '@mui/material/Radio';
import { CheckCircle } from '@mui/icons-material';

interface RadioButtonProps {
  label?: string;
  checked?: boolean;
}
const RadioButton = styled(({ value }: ButtonProps & RadioButtonProps) => {
  return <Radio value={value} checkedIcon={<CheckCircle />} color="default" />;
})(({ theme }) => ({
  backgroundColor: theme.palette.grey[800],
  '.MuiButton-startIcon': {
    color: theme.palette.info.light,
  },
  '&.RadioButton-checked': {
    color: theme.palette.background.default,
    backgroundColor: theme.palette.grey[50],
    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[50], 0.6),
    },
  },
  '&.RadioButton-checked .MuiButton-startIcon': {
    color: theme.palette.background.default,
  },
}));
export default RadioButton;
