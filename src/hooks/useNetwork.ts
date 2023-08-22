import { useNetworkStore } from '@/store/network';
import { Network } from '@/types';
import { useEffect } from 'react';

const useNetwork = (network?: Network) => {
  const { activeNetwork, caminoClient, setActiveNetwork, setCaminoClient } =
    useNetworkStore();

  useEffect(() => {
    if (network) {
      setActiveNetwork(network);
    }
  }, [network]);

  useEffect(() => {
    const updateCaminoClient = async () => {
      await caminoClient.fetchNetworkSettings();
      setCaminoClient(caminoClient);
    };

    if (caminoClient && !caminoClient.network) {
      updateCaminoClient();
    }
  }, [caminoClient]);

  return {
    activeNetwork,
    caminoClient,
  };
};
export default useNetwork;
