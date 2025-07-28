export interface NotificationPayload {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type DispatchNotificationFunction = (
  payload: NotificationPayload
) => void;
