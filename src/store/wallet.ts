import { PendingMultisigTx, WalletAddressState, WalletStore } from '@/types';
import create from 'zustand';

export const useWalletStore = create<WalletStore>(set => ({
  addressState: {
    isCaminoProposer: false,
    isConsortiumAdminProposer: false,
    isConsortiumMember: false,
    isKycVerified: false,
  },
  pendingMultisigTxs: [],
  currentWalletAddress: undefined,
  setCurrentWalletAddress: (address: string) =>
    set({ currentWalletAddress: address }),
  setAddressState: (addressState: WalletAddressState) => set({ addressState }),
  setPendingMultisigTxs: (pendingMultisigTxs: PendingMultisigTx[]) =>
    set({ pendingMultisigTxs }),
}));
