import create from 'zustand';
import { Avalanche as Camino } from '@c4tplatform/caminojs/dist';
import type { NetworkStore } from '@/types';

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  activeNetwork: null,
  caminoClient: null,
  setActiveNetwork: async network => {
    let client = get().caminoClient;
    if (network) {
      const { ip, port, protocol, networkId } = network;
      client = new Camino(ip, port, protocol, networkId);
    }
    if (client && !client.getNetwork()) {
      await client.fetchNetworkSettings();
    }
    set({ activeNetwork: network, caminoClient: client });
  },
}));
