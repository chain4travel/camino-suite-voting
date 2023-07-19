import React, { ReactNode, forwardRef } from 'react';
import { InputLabel, Stack, TextField, TextFieldProps } from '@mui/material';

interface InputFieldProps {
  endAdornment?: ReactNode;
}
const InputField = forwardRef(
  (
    {
      label,
      type,
      size,
      endAdornment,
      ...props
    }: InputFieldProps & TextFieldProps,
    _ref
  ) => {
    return (
      <Stack direction="row" alignItems="center" spacing={2}>
        {label && (
          <InputLabel color="secondary" sx={{ minWidth: 220 }}>
            {label}
          </InputLabel>
        )}
        <TextField
          {...props}
          type={type}
          size={size ?? 'small'}
          InputProps={{ endAdornment }}
          sx={{ minWidth: 300 }}
        />
      </Stack>
    );
  }
);
export default InputField;
