import React, { ReactNode } from 'react';
import {
  Stack,
  SxProps,
  Theme,
  Typography,
  TypographyPropsVariantOverrides,
} from '@mui/material';
import type { OverridableStringUnion } from '@mui/types';
import type { Variant } from '@mui/material/styles/createTypography';

type HeaderVariant =
  | OverridableStringUnion<'inherit' | Variant, TypographyPropsVariantOverrides>
  | undefined;
interface HeaderProps {
  headline: string;
  variant?: HeaderVariant;
  children?: ReactNode;
  fontFamily?: string | undefined;
}
const Header = ({
  headline,
  variant = 'h3',
  fontFamily,
  children,
}: HeaderProps) => {
  let sx = {};
  switch (variant) {
    case 'h6':
      sx = { marginBottom: '8px' };
      break;
    case 'h2':
    case 'h3':
    default:
      sx = { marginTop: '40px', marginBottom: '40px' };
      break;
  }
  return (
    <Stack direction="row" justifyContent="space-between" sx={sx}>
      <Typography variant={variant} sx={{ fontFamily }}>
        {headline}
      </Typography>
      {children}
    </Stack>
  );
};
export default Header;
