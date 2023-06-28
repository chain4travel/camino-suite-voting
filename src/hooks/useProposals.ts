import { useQuery } from '@tanstack/react-query';

import { fetchProposalDetail, fetchCompletedVotes } from '@/apis/proposals';
import { fetchActiveVotings } from '@/apis';

export const useActiveVotings = (page = 0) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getActiveVotings', page],
    async () => fetchActiveVotings(page)
  );

  console.debug('useActiveVotings data: ', data, isLoading, error, isSuccess);

  return {
    isLoading,
    error,
    proposals: data?.data ?? [],
  };
};

export const useCompletedVotes = (type: string, page = 0) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getCompletedVotes', type, page],
    async () => fetchCompletedVotes(type, page)
  );

  console.debug('useCompletedVotes data: ', data, isLoading, error, isSuccess);

  return {
    votes: data?.data ?? [],
    error,
    isLoading,
    // totalCount: data?.data?.totalCount ?? 0,
  };
};

export const useProposal = (type: string, id: string) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getActiveProposal', type, id],
    async () => fetchProposalDetail(type, id)
  );

  console.debug('useActiveProposal data: ', data, isLoading, error, isSuccess);

  return {
    proposal: data?.data,
    error,
    isLoading,
    // totalCount: data?.data?.totalCount ?? 0,
  };
};
