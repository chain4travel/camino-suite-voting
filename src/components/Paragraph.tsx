import { Stack, Divider } from '@mui/material';
import React, { ReactNode } from 'react';

interface ParagraphProps {
  children: ReactNode | ReactNode[];
  spacing?: 'lg' | 'md' | 'sm' | number;
  divider?: boolean;
}
const Paragraph = ({ children, spacing, divider }: ParagraphProps) => {
  let margin = spacing;
  switch (spacing) {
    case 'lg':
      margin = 3;
      break;
    case 'md':
      margin = 2;
      break;
    case 'sm':
      margin = 1;
      break;
    default:
  }
  return (
    <>
      <Stack spacing={margin}>{children}</Stack>
      {divider && <Divider sx={{ marginTop: 3 }} />}
    </>
  );
};
export default Paragraph;
