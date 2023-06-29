import { styled } from '@mui/material';
import React from 'react';
import Paragraph from '@/components/Paragraph';

const FormSection = styled(Paragraph)(({ theme }) => ({
  padding: `0 ${theme.spacing(3)}`,
}));
export default FormSection;
