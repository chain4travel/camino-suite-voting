import create from 'zustand';

import type { ToastState, ToastConfig } from '@/types';
import { Severity } from '@/types';

export const useToastStore = create<ToastState>(set => ({
  option: {
    isShown: false,
    severity: Severity.Info,
    message: 'this is a info message',
    action: undefined,
  },
  setOption: (option: ToastConfig | Partial<ToastConfig>) => set({ option }),
}));
