import React, { forwardRef, useEffect, useState } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  AlertProps,
  Stack,
  AlertTitle,
  styled,
  LinearProgress,
} from '@mui/material';

import useToast from '@/hooks/useToast';

const DEFAULT_DURATION = 5000;
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
  '.MuiLinearProgress-root': {
    position: 'absolute',
    width: '100%',
    left: 0,
    bottom: 0,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
}));

const useCountdown = (duration: number, started = false) => {
  const COUNT_DOWN_STEP_DURATION = 100;
  const COUNT_DOWN_STEP = (100 / duration) * 100;
  const [progress, setProgress] = useState(100 - COUNT_DOWN_STEP);

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(
      () => setProgress(prevProgress => prevProgress - COUNT_DOWN_STEP),
      COUNT_DOWN_STEP_DURATION
    );
    return () => {
      clearInterval(interval);
      setProgress(100 - COUNT_DOWN_STEP);
    };
  }, [COUNT_DOWN_STEP, started]);

  return progress;
};
const Toast = () => {
  const { isShown, onClose, severity, message, title, action } = useToast();
  const progress = useCountdown(DEFAULT_DURATION, isShown);

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <StyledSnackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isShown}
        autoHideDuration={DEFAULT_DURATION}
        onClose={onClose}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
          action={action}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
          <LinearProgress
            variant="determinate"
            color={severity}
            value={progress}
          />
        </Alert>
      </StyledSnackbar>
    </Stack>
  );
};
export default Toast;
