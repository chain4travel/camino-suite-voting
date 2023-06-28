import { useMutation, useQuery } from '@tanstack/react-query';
import { getTxFee, vote } from '@/helpers/rpc';
import { VotingOption } from '@/types';
import useToast from './toast';

// TODO: base RPC call

export const useBaseFee = () => {
  const { data, isLoading, isError, isSuccess } = useQuery(
    ['getBaseFee'],
    async () => getTxFee()
  );

  console.debug('useBaseFee data: ', data, isLoading, isError, isSuccess);

  return {
    isLoading,
    isError,
    baseFee: data ?? 0,
  };
};

export const useVote = (option?: { onSettled?: () => void }) => {
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: ({
      proposalId,
      votingType,
      votes,
    }: {
      proposalId: string | number;
      votingType: string;
      votes: VotingOption[];
    }) => vote(proposalId, votingType, votes),
    onSuccess: _data => toast.success('Successfully voted'),
    onError: (error: any) => toast.error('Failed to vote: ', error),
    onSettled: option && option.onSettled,
  });

  console.debug('mutation: ', mutation);

  return mutation;
};
