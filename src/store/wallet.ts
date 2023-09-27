import { PendingMultisigTx, WalletStore } from '@/types';
import create from 'zustand';

export const useWalletStore = create<WalletStore>(set => ({
  pendingMultisigTxs: [],
  setPendingMultisigTxs: (pendingMultisigTxs: PendingMultisigTx[]) =>
    set({ pendingMultisigTxs }),
}));
