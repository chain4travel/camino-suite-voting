import { useMemo } from 'react';
import { BN, Avalanche as Camino, BinTools } from '@c4tplatform/caminojs/dist';
import { Configuration, MultisigApi } from '@c4tplatform/signavaultjs';
import { AddressState } from '@c4tplatform/caminojs/dist/apis/platformvm';
import store from 'wallet/store';
import { MultisigWallet, SingletonWallet, Network, WalletType } from '@/types';
import { useWalletStore } from '@/store/wallet';
import { useNetworkStore } from '@/store/network';

const DEFAULT_SIGNAVAULT_CONFIG: Configuration = new Configuration({
  basePath: 'http://127.0.0.1:8081/v1',
});
const DEFAULT_SIGNAVAULT_VERSION = '/v1';

const getSignaVaultApi = (activeNetwork?: Network | null): MultisigApi => {
  let config = DEFAULT_SIGNAVAULT_CONFIG;
  const versioRegex = /\/v\d+$/;

  let signavaultUrl = activeNetwork?.signavaultUrl;
  if (activeNetwork) {
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
  const { caminoClient, activeNetwork } = useNetworkStore(state => ({
    caminoClient: state.caminoClient,
    activeNetwork: state.activeNetwork,
  }));
  const activeWallet = store.state?.activeWallet;
  const { setAddressState, setCurrentWalletAddress, setPendingMultisigTxs } =
    useWalletStore(state => ({
      setAddressState: state.setAddressState,
      setCurrentWalletAddress: state.setCurrentWalletAddress,
      setPendingMultisigTxs: state.setPendingMultisigTxs,
    }));

  const signavaultApi = useMemo(
    () => getSignaVaultApi(activeNetwork),
    [activeNetwork]
  );
  const { pchainAPI, signer, multisigWallet } = useMemo(() => {
    const getAddressState = async (address: string, caminoClient: Camino) => {
      const BN_ONE = new BN(1);
      const states = await caminoClient?.PChain().getAddressStates(address);
      setAddressState({
        isConsortiumMember: !states
          ?.and(BN_ONE.shln(AddressState.CONSORTIUM))
          .isZero(),
        isKycVerified: !states
          ?.and(BN_ONE.shln(AddressState.KYC_VERIFIED))
          .isZero(),
        isConsortiumAdminProposer: !states
          ?.and(BN_ONE.shln(AddressState.ROLE_CONSORTIUM_ADMIN_PROPOSER))
          .isZero(),
        isCaminoProposer: !states
          ?.and(BN_ONE.shln(AddressState.CAMINO_ONLY_PROPOSER))
          .isZero(),
      });
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
      setCurrentWalletAddress(walletAddress);

      return {
        pchainAPI: pchain,
        signer,
        multisigWallet,
      };
    }
    return {};
  }, [activeWallet, caminoClient]);

  // Fake wallet
  return {
    pchainAPI,
    signer,
    multisigWallet,
    signavaultApi,
  };
};
export default useWallet;
