import React from 'react';
import { styled } from '@mui/material';
import Radio, { RadioProps } from '@mui/material/Radio';
import { CheckCircle } from '@mui/icons-material';

interface RadioButtonProps {
  label?: string;
  checked?: boolean;
}
const RadioButton = styled(
  ({ value, ...props }: RadioProps & RadioButtonProps) => {
    return (
      <Radio
        {...props}
        value={value}
        checkedIcon={<CheckCircle />}
        color="default"
      />
    );
  }
)(() => ({
  padding: 2,
}));
export default RadioButton;
