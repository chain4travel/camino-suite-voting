import { SyntheticEvent } from 'react';

import { useToastStore } from '@/store';
import { Severity, ToastState } from '@/types';

const useToast = () => {
  const { option, setOption } = useToastStore();

  const show = (config: ToastState) => setOption({ isShown: true, ...config });
  const success = (message: string, title?: string) =>
    setOption({ isShown: true, severity: Severity.Success, message, title });
  const info = (message: string, title?: string) =>
    setOption({ isShown: true, severity: Severity.Info, message, title });
  const warning = (message: string, title?: string) =>
    setOption({ isShown: true, severity: Severity.Warning, message, title });
  const error = (message: string, title?: string) =>
    setOption({ isShown: true, severity: Severity.Error, message, title });
  const onClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOption({ isShown: false });
  };

  return {
    show,
    success,
    info,
    warning,
    error,
    onClose,
    ...option,
  };
};
export default useToast;
