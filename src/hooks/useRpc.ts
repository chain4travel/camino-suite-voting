import { useQuery } from '@tanstack/react-query';
import { getFeeDistribution } from '@/helpers/rpc';
import { useNetworkStore } from '@/store/network';

// TODO: base RPC call

export const useBaseFee = () => {
  const caminoClient = useNetworkStore(state => state.caminoClient);
  const { data, isLoading, error } = useQuery({
    queryKey: ['getBaseFee'],
    queryFn: async () => await caminoClient?.Info().getTxFee(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    isLoading,
    error,
    baseFee: (data?.txFee.toNumber() ?? 0).toString(),
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
