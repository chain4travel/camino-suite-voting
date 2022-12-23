import { useQuery } from 'react-query';

import { fetchProposalList } from '@/apis/proposals';
import { useProposalState, ProposalState } from '@/store';
import { Proposal } from '@/types';

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
  if (!proposal) {
    proposal = proposals.filter((p: Proposal) => p.id === id)[0];
  }
  return proposal;
};
