import create from 'zustand';

import { Proposal } from '@/types';

export interface ProposalState {
  currentProposal: Proposal;
  setCurrentProposal: (proposal: Proposal) => void;
}

export const useProposalState = create<ProposalState>(set => ({
  currentProposal: null,
  setCurrentProposal: proposal => set(state => ({ currentProposal: proposal })),
}));
