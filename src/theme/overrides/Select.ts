import { Theme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Select = {
  MuiSelect: {
    defaultProps: {
      IconComponent: ExpandMoreIcon,
    },
    styleOverrides: {
      select: {
        padding: '1rem',
      },
      root: {
        '&:before': { borderBottom: 0 },
        '&:hover': {
          '&:not(.Mui-disabled, .Mui-error):before': { borderBottom: 0 },
        },
      },
      icon: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.primary,
        right: '1rem',
      }),
    },
  },
};
export default Select;
