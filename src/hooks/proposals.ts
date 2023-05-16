import { useQuery } from 'react-query';

import { fetchProposalList, fetchProposalHistory } from '@/apis/proposals';
import { useProposalState } from '@/store';
import type { Proposal, ProposalState } from '@/types';
import { useEffect } from 'react';

export const useProposals = (type: string, page = 0) => {
  console.log('proposal type: ', type);
  const { data, isLoading, isError, isSuccess } = useQuery(
    ['getProposals', type, page],
    async () => fetchProposalList(type, page)
  );

  console.log('data: ', data);

  return {
    proposals: data?.data?.proposals ?? [],
    totalCount: data?.data?.totalCount ?? 0,
  };
};

export const useProposal = (type: string, id: number) => {
  let proposal = useProposalState(
    (state: ProposalState) => state.currentProposal
  );
  const { proposals } = useProposals(type);
  // TODO: since we don't know if there has API for single proposal by id, we fetch both local state and API (for refreshing at the detail page)
  useEffect(() => {
    if (!proposal) {
      proposal = proposals.filter((p: Proposal) => p.id === id)[0];
    }
  }, [proposal, proposals]);
  return proposal;
};

export const useProposalHistory = (type: string, page = 0) => {
  console.log('proposal type: ', type);
  const { data, isLoading, isError, isSuccess } = useQuery(
    ['getProposalHistory', type, page],
    async () => fetchProposalHistory(type, page)
  );

  console.log('data: ', data);

  return {
    proposals: data?.data?.proposals ?? [],
    totalCount: data?.data?.totalCount ?? 0,
  };
};
