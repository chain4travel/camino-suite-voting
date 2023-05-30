import React, { forwardRef } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  AlertProps,
  Stack,
  AlertTitle,
  styled,
} from '@mui/material';

import useToast from '@/hooks/toast';

const StyledSnackbar = styled(Snackbar)({
  '.MuiAlert-root': {
    boxShadow: 'none',
    backgroundImage: 'none',
  },
});
const Alert = styled(
  forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />
  ))
)(({ theme }) => ({
  '&.MuiAlert-filled': {
    color: theme.palette.text.primary,
  },
}));

const Toast = () => {
  const { isShown, onClose, severity, message, title } = useToast();

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <StyledSnackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isShown}
        autoHideDuration={5000}
        onClose={onClose}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </Alert>
      </StyledSnackbar>
    </Stack>
  );
};
export default Toast;
