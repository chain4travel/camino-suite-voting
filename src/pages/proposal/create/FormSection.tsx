import { styled } from '@mui/material';
import React from 'react';
import Paragraph from '@/components/Paragraph';

const FormSection = styled(Paragraph)(({ theme }) => ({
  padding: theme.spacing(0),
}));
export default FormSection;
