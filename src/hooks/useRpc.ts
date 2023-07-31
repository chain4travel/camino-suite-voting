import { useMutation, useQuery } from '@tanstack/react-query';
import { bnToAvaxP } from '@c4tplatform/camino-wallet-sdk/dist';
import { getFeeDistribution, getTxFee, vote } from '@/helpers/rpc';
import { VotingOption } from '@/types';
import useToast from './useToast';
import useNetwork from './useNetwork';

// TODO: base RPC call

export const useBaseFee = () => {
  const { caminoClient } = useNetwork();
  const { data, isLoading, error, isSuccess } = useQuery(
    ['getBaseFee'],
    async () => caminoClient?.Info().getTxFee()
  );

  console.debug('useBaseFee data: ', data, isLoading, error, isSuccess);

  return {
    isLoading,
    error,
    baseFee: bnToAvaxP(data?.txFee ?? 0),
  };
};

export const useFeeDistribution = () => {
  const { data, isLoading, error, isSuccess } = useQuery(
    ['getFeeDistribution'],
    async () => getFeeDistribution()
  );

  console.debug('useFeeDistribution data: ', data, isLoading, error, isSuccess);

  return {
    isLoading,
    error,
    feeDistribution: data ?? [],
  };
};

export const useSubmitVote = (option?: { onSettled?: () => void }) => {
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
    onSuccess: () => toast.success('Successfully voted'),
    onError: (error, any) => toast.error('Failed to vote: ', error),
    onSettled: option && option.onSettled,
  });

  console.debug('mutation: ', mutation);

  return mutation;
};
