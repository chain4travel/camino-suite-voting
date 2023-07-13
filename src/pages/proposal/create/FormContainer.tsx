import { Stack, styled } from '@mui/material';
import React from 'react';

const FormContainer = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  minHeight: '300px',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 0, 3, 0),
  justifyContent: 'center',
  alignItems: 'center',
}));
export default FormContainer;
