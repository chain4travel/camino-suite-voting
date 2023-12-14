import { Avalanche as Camino } from '@c4tplatform/caminojs';

export interface Network {
  name: string;
  id: number;
  protocol: string;
  port: number;
  networkId: number; // == id??
  url: string; // provider??
  ip: string;
  explorerUrl?: string;
  signavaultUrl?: string;
}

export type NetworkStore = {
  activeNetwork: Network | null;
  caminoClient: Camino | null;
  setActiveNetwork: (network: Network | null) => void;
};
