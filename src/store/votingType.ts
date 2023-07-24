import create from 'zustand';

import type { CompletedVotingTypeState } from '@/types';

export const useVotingTypeStore = create<CompletedVotingTypeState>(set => ({
  select: 'GENERAL',
  setSelect: (select: string) => set({ select }),
}));
