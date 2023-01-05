import create from 'zustand';

import { ToastState, Severity, ToastConfig } from '@/types';

export const useToastStore = create<ToastState>(set => ({
  option: {
    isShown: false,
    severity: Severity.Info,
    message: 'this is a info message',
  },
  setOption: (option: ToastConfig | Partial<ToastConfig>) => set({ option }),
}));
