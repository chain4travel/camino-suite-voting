import { useNetworkStore } from '@/store/network';
import { Network } from '@/types';
import { useEffect } from 'react';

const useNetwork = (network?: Network) => {
  const { activeNetwork, caminoClient, setActiveNetwork } = useNetworkStore();

  useEffect(() => {
    console.debug('network changed ?', network);
    if (network) {
      setActiveNetwork(network);
    }
  }, [network]);

  return {
    activeNetwork,
    caminoClient,
  };
};
export default useNetwork;
