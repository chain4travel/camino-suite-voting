import { BN } from '@c4tplatform/caminojs/dist';
import store from 'wallet/store';
import useNetwork from './useNetwork';
import { useEffect, useMemo, useState } from 'react';

const useWallet = () => {
  const { caminoClient } = useNetwork();
  const [isConsortiumMember, setIsConsortiumMember] = useState<boolean>(false);
  // TODO: use react-query
  useEffect(() => {
    const getAddressState = async () => {
      const BN_ONE = new BN(1);
      const states = await caminoClient
        ?.PChain()
        .getAddressStates(
          store?.state?.activeWallet?.platformKeyChain?.getAddressStrings()[0]
        );
      setIsConsortiumMember(!states.and(BN_ONE.shln(38)).isZero());
    };
    if (store.state.activeWallet) {
      getAddressState();
    }
  }, [store.state.activeWallet]);

  const { pchainAPI, signer } = useMemo(() => {
    if (store.state.activeWallet) {
      const pchain = caminoClient.PChain();
      const signer = pchain.keyChain().importKey(store.state.activeWallet.key);
      return { pchainAPI: pchain, signer };
    }
    return {};
  }, [store.state.activeWallet]);

  // Fake wallet
  return {
    isConsortiumMember,
    pchainAPI,
    signer,
  };
};
export default useWallet;
