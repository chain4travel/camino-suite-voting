import { Chip, styled } from '@mui/material';

const Badge = styled(Chip)(({ theme }) => ({
  '&.MuiChip-root': {
    ...theme.typography.caption,
    color: theme.palette.text.primary,
    height: '1rem',
  },
  '.MuiChip-label': {
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },
}));
export default Badge;
