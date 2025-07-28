import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface NotificationPayload {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type DispatchNotificationFunction = (
  payload: NotificationPayload
) => void;

interface NotificationStore {
  dispatchNotification: DispatchNotificationFunction | null;

  setDispatchNotification: (fn: DispatchNotificationFunction) => void;

  showNotification: (payload: NotificationPayload) => void;

  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      dispatchNotification: null,

      setDispatchNotification: (fn: DispatchNotificationFunction) => {
        set({ dispatchNotification: fn });
      },

      showNotification: (payload: NotificationPayload) => {
        const { dispatchNotification } = get();
        if (dispatchNotification) {
          dispatchNotification(payload);
        } else {
          console.warn('Notification dispatcher not initialized');
        }
      },

      showSuccess: (message: string) => {
        get().showNotification({ message, type: 'success' });
      },

      showError: (message: string) => {
        get().showNotification({ message, type: 'error' });
      },

      showWarning: (message: string) => {
        get().showNotification({ message, type: 'warning' });
      },

      showInfo: (message: string) => {
        get().showNotification({ message, type: 'info' });
      },
    }),
    {
      name: 'notification-store',
    }
  )
);
