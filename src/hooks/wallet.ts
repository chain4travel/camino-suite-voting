import { useEffect, useState } from 'react';

import walletStore from 'Wallet/store';
import { WALLET_EVENTS } from 'Wallet/events';

const useWallet = () => {
  const [activeWallet, setActiveWallet] = useState();
  useEffect(() => {
    if (walletStore.state.activeWallet) {
      setActiveWallet(walletStore.state.activeWallet);
    }

    const onWalletConnected = () => {
      setActiveWallet(walletStore.state.activeWallet);
    };
    window.addEventListener(WALLET_EVENTS.WALLET_CONNECTED, onWalletConnected);

    return () => {
      window.removeEventListener(
        WALLET_EVENTS.WALLET_CONNECTED,
        onWalletConnected
      );
    };
  }, []);

  return activeWallet;
};
export default useWallet;
