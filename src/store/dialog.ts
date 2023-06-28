import create from 'zustand';

import type { DialogState, DialogConfig } from '@/types';

export const useDialogStore = create<DialogState>(set => ({
  option: { isOpen: false },
  setOption: (option: DialogConfig) => set({ option }),
}));
