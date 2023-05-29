import { useQuery } from 'react-query';

import { fetchProposalHistory } from '@/apis/proposals';
import { useProposalState } from '@/store';
import type { Proposal, ProposalState } from '@/types';
import { useEffect } from 'react';
import { fetchActiveVotings } from '@/apis';

export const useActiveVotings = (page = 0) => {
  const { data, isLoading, isError, isSuccess } = useQuery(
    ['getActiveVotings', page],
    async () => fetchActiveVotings(page)
  );

  console.debug('useActiveVotings data: ', data, isLoading, isError, isSuccess);

  return {
    isLoading,
    isError,
    proposals: data?.data ?? [],
  };
};

export const useProposal = (type: string, id: number) => {
  let proposal = useProposalState(
    (state: ProposalState) => state.currentProposal
  );
  const { proposals } = useActiveVotings();
  // TODO: since we don't know if there has API for single proposal by id, we fetch both local state and API (for refreshing at the detail page)
  useEffect(() => {
    if (!proposal) {
      proposal = proposals.filter((p: Proposal) => p.id === id)[0];
    }
  }, [proposal, proposals]);
  return proposal;
};

export const useProposalHistory = (type: string, page = 0) => {
  const { data, isLoading, isError, isSuccess } = useQuery(
    ['getProposalHistory', type, page],
    async () => fetchProposalHistory(type, page)
  );

  return {
    proposals: data?.data?.proposals ?? [],
    totalCount: data?.data?.totalCount ?? 0,
  };
};
