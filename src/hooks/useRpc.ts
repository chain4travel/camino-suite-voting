import { useQuery } from 'react-query';
import { getTxFee } from '@/helpers/rpc';

// TODO: base RPC call

export const useBaseFee = () => {
  const { data, isLoading, isError, isSuccess } = useQuery(
    ['getBaseFee'],
    async () => getTxFee()
  );

  console.log('data: ', data, isLoading, isError, isSuccess);

  return {
    isLoading,
    isError,
    baseFee: data ?? 0,
  };
};
