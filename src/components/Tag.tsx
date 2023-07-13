import { Chip, alpha, styled } from '@mui/material';
import React from 'react';

const Tag = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius / 2,
  backgroundColor: theme.palette.grey[800],
  height: 20,
  '.MuiChip-label': {
    ...theme.typography.caption,
    fontWeight: 600,
    color: theme.palette.grey[300],
    padding: theme.spacing(0, 1),
    letterSpacing: 1.6,
  },
  '&.MuiChip-filledWarning': {
    '.MuiChip-label': {
      color: theme.palette.warning.main,
      backgroundColor: alpha(theme.palette.warning.main, 0.2),
    },
  },
  '&.MuiChip-filledSuccess': {
    '.MuiChip-label': {
      color: theme.palette.success.main,
      backgroundColor: alpha(theme.palette.success.main, 0.2),
    },
  },
}));
export default Tag;
