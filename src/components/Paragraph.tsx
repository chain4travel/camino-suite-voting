import { Box, Divider } from '@mui/material';
import React, { ReactNode } from 'react';

interface ParagraphProps {
  children: ReactNode[];
  divider?: boolean;
}
const Paragraph = ({ children, divider }: ParagraphProps) => {
  return (
    <Box margin="24px 0">
      {children}
      {divider && <Divider sx={{ marginTop: '24px' }} />}
    </Box>
  );
};
export default Paragraph;
