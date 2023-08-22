import create from 'zustand';
import { Avalanche as Camino } from '@c4tplatform/caminojs/dist';
import type { NetworkStore } from '@/types';

export const useNetworkStore = create<NetworkStore>(set => ({
  activeNetwork: null,
  caminoClient: null,
  setActiveNetwork: network =>
    set(state => {
      let client = state.caminoClient;
      if (network) {
        const { ip, port, protocol, networkId } = network;
        client = new Camino(ip, port, protocol, networkId);
      }
      return { activeNetwork: network, caminoClient: client };
    }),
  setCaminoClient: client => set({ caminoClient: client }),
}));
