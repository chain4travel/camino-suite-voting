import { LoadingButton } from '@mui/lab';
import { alpha, styled, useTheme } from '@mui/material';

const Button = styled(LoadingButton)(({}) => {
  const theme = useTheme();
  return {
    '&, &.MuiButton-root': {
      boxShadow: 'none',
      width: 'fit-content',
    },
    '&.MuiButton-outlined': {
      borderColor: theme.palette.divider,
    },
    '&.MuiButton-contained': {
      color: theme.palette.text.primary,
    },
    '&.MuiButton-containedInherit': {
      backgroundColor: theme.palette.grey[700],

      '&:hover': {
        backgroundColor: alpha(theme.palette.grey[700], 0.6),
      },
    },
    '&.MuiButton-containedPrimary': {
      backgroundColor: theme.palette.primary,
      color: theme.palette.primary.contrastText,
    },
    '&.MuiButton-containedAccent': {
      color: theme.palette.grey[900],
    },
    '&.Mui-disabled': {
      opacity: 0.8,
    },
  };
});
export default Button;
