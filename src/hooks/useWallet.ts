import store from 'wallet/store';
import useNetwork from './useNetwork';
import { useEffect } from 'react';

const useWallet = () => {
  const { caminoClient } = useNetwork();
  // TODO: use react-query
  useEffect(() => {
    const getAddressState = async () => {
      console.log(
        'store: ',
        store?.state?.activeWallet?.platformKeyChain?.getAddressStrings()[0]
      );
      console.log('caminoClient pchain: ', caminoClient?.PChain());
      const states = await caminoClient
        ?.PChain()
        .getAddressStates(
          store?.state?.activeWallet?.platformKeyChain?.getAddressStrings()[0]
        );
      console.log('address states: ', states);
    };
    // if (store.state.activeWallet) {
    getAddressState();
    // }
  }, [store.state.activeWallet]);

  // Fake wallet
  return {
    isConsortiumMember: false,
  };
};
export default useWallet;
