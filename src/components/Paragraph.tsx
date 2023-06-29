import { Stack, Divider, StackProps } from '@mui/material';
import React, { ReactNode } from 'react';

interface ParagraphProps {
  children: ReactNode | ReactNode[];
  spacing?: 'lg' | 'md' | 'sm' | number;
  divider?: boolean;
}
const Paragraph = ({
  children,
  spacing,
  divider,
  ...props
}: ParagraphProps & StackProps) => {
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
      <Stack {...props} spacing={margin} sx={{ width: '100%' }}>
        {children}
      </Stack>
      {divider && <Divider sx={{ marginTop: 3 }} />}
    </>
  );
};
export default Paragraph;
