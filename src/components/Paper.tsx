import { Paper as MuiPaper, styled } from '@mui/material';
import React from 'react';

const Paper = styled(MuiPaper)(() => ({
  boxShadow: 'none',
  backgroundImage: 'none',
}));
export default Paper;
