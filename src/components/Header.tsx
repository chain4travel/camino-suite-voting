import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';

import Headline from './Headline';

interface HeaderProps {
  headline: string;
  children: ReactNode;
}
const Header = ({ headline, children }: HeaderProps) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ marginTop: '40px', marginBottom: '40px' }}
    >
      <Headline text={headline} />
      {children}
    </Stack>
  );
};
export default Header;
