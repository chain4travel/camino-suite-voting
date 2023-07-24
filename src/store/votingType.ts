import create from 'zustand';

import type { CompletedVotingTypeState } from '@/types';

export const useVotingTypeStore = create<CompletedVotingTypeState>(set => ({
  selectVotingType: 'GENERAL',
  setSelectVotingType: (selectVotingType: string) => set({ selectVotingType }),
}));
