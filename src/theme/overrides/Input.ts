import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

const Input = {
  // MuiInputBase: {
  //   styleOverrides: {
  //     root: ({ theme }: { theme: Theme }) => ({
  //       '&.Mui-disabled': {
  //         '& svg': { color: theme.palette.text.disabled },
  //       },
  //     }),
  //     input: ({ theme }: { theme: Theme }) => ({
  //         '&::placeholder': {
  //             opacity: 1,
  //             color: theme.palette.text.disabled,
  //         },
  //     }),
  //   },
  // },
  MuiInput: {
    styleOverrides: {
      underline: ({ theme }: { theme: Theme }) => ({
        '&:before': {
          borderBottomColor: theme.palette.grey[500],
        },
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.grey[800],
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.grey[500],
        },
        '&.Mui-focused': {
          backgroundColor: theme.palette.action.focus,
        },
        '&.Mui-disabled': {
          backgroundColor: theme.palette.action.disabledBackground,
        },
      }),
      underline: ({ theme }: { theme: Theme }) => ({
        '&:before, &:hover:not(.Mui-disabled, .Mui-error):before': {
          borderBottom: 0,
        },
        '&.Mui-focused:before': {
          borderBottomColor: theme.palette.grey[500],
        },
      }),
      input: {
        paddingTop: '8px',
      },
    },
  },
  // MuiOutlinedInput: {
  //     styleOverrides: {
  //         root: ({ theme }: { theme: Theme }) => ({
  //             '& .MuiOutlinedInput-notchedOutline': {
  //                 borderColor: theme.palette.grey[500_32] + '!important',
  //             },
  //             '&.Mui-disabled': {
  //                 '& .MuiOutlinedInput-notchedOutline': {
  //                     borderColor: theme.palette.action.disabledBackground,
  //                 },
  //             },
  //         }),
  //     },
  // },
};
export default Input;
