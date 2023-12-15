import { ReactElement, SyntheticEvent } from 'react';

import { useToastStore } from '@/store';
import type { ToastState } from '@/types';
import { Severity } from '@/types';

const useToast = () => {
  const { option, setOption } = useToastStore();

  const show = (config: ToastState) => setOption({ isShown: true, ...config });
  const success = (message: string, title?: string, action?: ReactElement) =>
    setOption({
      isShown: true,
      severity: Severity.Success,
      message,
      title,
      action,
    });
  const info = (message: string, title?: string, action?: ReactElement) =>
    setOption({
      isShown: true,
      severity: Severity.Info,
      message,
      title,
      action,
    });
  const warning = (message: string, title?: string, action?: ReactElement) =>
    setOption({
      isShown: true,
      severity: Severity.Warning,
      message,
      title,
      action,
    });
  const error = (message: string, title?: string, action?: ReactElement) =>
    setOption({
      isShown: true,
      severity: Severity.Error,
      message,
      title,
      action,
    });
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
