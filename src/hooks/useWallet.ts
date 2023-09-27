import { useMemo, useState } from 'react';
import { BN, Avalanche as Camino, BinTools } from '@c4tplatform/caminojs/dist';
import { Configuration, MultisigApi } from '@c4tplatform/signavaultjs';
import { AddressState } from '@c4tplatform/caminojs/dist/apis/platformvm';
import store from 'wallet/store';
import { MultisigWallet, SingletonWallet, Network, WalletType } from '@/types';
import { useWalletStore } from '@/store/wallet';
import useNetwork from './useNetwork';

const KOP_SIGNAVAULT_URL = 'https://signavault.kopernikus.camino.network';
const DEFAULT_SIGNAVAULT_CONFIG: Configuration = new Configuration({
  basePath: 'http://127.0.0.1:8081/v1',
});
const DEFAULT_SIGNAVAULT_VERSION = '/v1';

const getSignaVaultApi = (activeNetwork?: Network | null): MultisigApi => {
  let config = DEFAULT_SIGNAVAULT_CONFIG;
  const versioRegex = /\/v\d+$/;

  let signavaultUrl = activeNetwork?.signavaultUrl;
  if (activeNetwork) {
    // assign `signavaultUrl if no configuration for Kopernikus
    if (!signavaultUrl && activeNetwork.name === 'Kopernikus') {
      signavaultUrl = KOP_SIGNAVAULT_URL;
    }
    // auto append default version if no version pattern found
    if (signavaultUrl && !versioRegex.test(signavaultUrl)) {
      signavaultUrl += DEFAULT_SIGNAVAULT_VERSION;
    }
  }

  config = new Configuration({
    basePath: signavaultUrl,
  });
  return new MultisigApi(config);
};

const isMultiSigWallet = (wallet: { type: WalletType }) =>
  wallet.type === 'multisig';
const useWallet = () => {
  const { caminoClient, activeNetwork } = useNetwork();
  const activeWallet = store.state?.activeWallet;
  const setPendingMultisigTxs = useWalletStore(
    state => state.setPendingMultisigTxs
  );
  const [isConsortiumMember, setIsConsortiumMember] = useState<boolean>(false);

  const signavaultApi = useMemo(
    () => getSignaVaultApi(activeNetwork),
    [activeNetwork]
  );
  const { pchainAPI, signer, currentWalletAddress, multisigWallet } =
    useMemo(() => {
      const getAddressState = async (address: string, caminoClient: Camino) => {
        const BN_ONE = new BN(1);
        const states = await caminoClient?.PChain().getAddressStates(address);
        setIsConsortiumMember(
          !states?.and(BN_ONE.shln(AddressState.CONSORTIUM)).isZero()
        );
      };

      if (activeWallet && caminoClient) {
        const pchain = caminoClient.PChain();
        const bintools = BinTools.getInstance();
        let walletAddress, signer, multisigWallet;
        if (isMultiSigWallet(activeWallet)) {
          multisigWallet = activeWallet as MultisigWallet;
          walletAddress = bintools.addressToString(
            multisigWallet.hrp,
            multisigWallet.pchainId,
            multisigWallet.keyData.alias
          );
          signer = multisigWallet.wallets[0].keyPair; // pchain.keyChain().importKey();
        } else {
          const singletonWallet = activeWallet as SingletonWallet;
          walletAddress =
            singletonWallet.platformKeyChain?.getAddressStrings()[0];
          signer = pchain.keyChain().importKey(singletonWallet.key);
          setPendingMultisigTxs([]);
        }
        getAddressState(walletAddress, caminoClient);

        return {
          pchainAPI: pchain,
          signer,
          currentWalletAddress: walletAddress,
          multisigWallet,
        };
      }
      return {};
    }, [activeWallet, caminoClient]);

  // Fake wallet
  return {
    isConsortiumMember,
    pchainAPI,
    signer,
    currentWalletAddress,
    multisigWallet,
    signavaultApi,
  };
};
export default useWallet;
