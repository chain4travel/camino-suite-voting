import create from 'zustand';

import type { Proposal, ProposalState } from '@/types';

export const useProposalState = create<ProposalState>(set => ({
  currentProposal: null,
  setCurrentProposal: (proposal: Proposal) =>
    set({ currentProposal: proposal }),
}));
