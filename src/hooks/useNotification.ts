import { useNotificationStore } from '@/store/notifications';
import type { NotificationPayload } from '@/types';

export const useNotification = () => {
  const { showNotification, showSuccess, showError, showWarning, showInfo } =
    useNotificationStore();

  return {
    notify: showNotification,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    dispatchNotification: (payload: {
      message: string;
      type: NotificationPayload['type'];
    }) => {
      showNotification(payload);
    },
  };
};
