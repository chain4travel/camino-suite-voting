import create from 'zustand';

import type { RadioState } from '@/types';

export const useRadioStore = create<RadioState>(set => ({
  select: 'GENERAL',
  setSelect: (select: string) => set({ select }),
}));
