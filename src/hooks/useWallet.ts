import { BN } from '@c4tplatform/caminojs/dist';
import store from 'wallet/store';
import useNetwork from './useNetwork';
import { useEffect, useState } from 'react';

const useWallet = () => {
  const { caminoClient } = useNetwork();
  const [isConsortiumMember, setIsConsortiumMember] = useState<boolean>(false);
  // TODO: use react-query
  useEffect(() => {
    const getAddressState = async () => {
      console.log(
        'store: ',
        store?.state?.activeWallet?.platformKeyChain?.getAddressStrings()[0]
      );
      console.log('caminoClient pchain: ', caminoClient?.PChain());
      const BN_ONE = new BN(1);
      const states = await caminoClient
        ?.PChain()
        .getAddressStates(
          store?.state?.activeWallet?.platformKeyChain?.getAddressStrings()[0]
        );
      setIsConsortiumMember(!states.and(BN_ONE.shln(38)).isZero());
      console.log('isConsortiumMember: ', isConsortiumMember);
    };
    // if (store.state.activeWallet) {
    getAddressState();
    // }
  }, [store.state.activeWallet]);

  // Fake wallet
  return {
    isConsortiumMember,
  };
};
export default useWallet;
