import create from 'zustand';
import { Avalanche as Camino } from '@c4tplatform/caminojs';
import type { NetworkStore } from '@/types';

export const useNetworkStore = create<NetworkStore>(set => ({
  activeNetwork: null,
  caminoClient: null,
  setActiveNetwork: network =>
    set(state => {
      let client = state.caminoClient;
      console.log('~state: ', state);
      console.log('~network: ', network);
      if (network) {
        const { ip, port, protocol, networkId } = network;
        client = new Camino(
          ip,
          port,
          protocol,
          !isNaN(networkId) ? networkId : 12345
        );
      }
      return { activeNetwork: network, caminoClient: client };
    }),
}));
