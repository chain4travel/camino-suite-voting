import React, { forwardRef } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  AlertProps,
  Stack,
  AlertTitle,
} from '@mui/material';

import useToast from '@/hooks/toast';

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />
));

const Toast = () => {
  const { isShown, onClose, severity, message, title } = useToast();

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isShown}
        autoHideDuration={5000}
        onClose={onClose}
      >
        <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
export default Toast;
