import { Stack, styled } from '@mui/material';
import React from 'react';

const FormContainer = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  marginBottom: theme.spacing(4),
  minHeight: '300px',
  border: 1,
  borderStyle: 'solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  padding: `${theme.spacing(3)} 0`,
  justifyContent: 'center',
  alignItems: 'center',
}));
export default FormContainer;
