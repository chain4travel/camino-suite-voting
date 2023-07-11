import React from 'react';
import { Checkbox as MuiCheckbox, styled } from '@mui/material';

const Checkbox = styled(MuiCheckbox)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.common.white,
  },
}));
export default Checkbox;
