import { useQuery } from 'react-query';

import { fetchProposalList } from '@/apis/proposals';

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
