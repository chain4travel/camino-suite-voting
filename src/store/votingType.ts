import create from 'zustand';

import { ProposalTypes, type CompletedVotingTypeState } from '@/types';

export const useVotingTypeStore = create<CompletedVotingTypeState>(set => ({
  selectVotingType: ProposalTypes.BaseFee,
  setSelectVotingType: (selectVotingType: string) => set({ selectVotingType }),
}));
