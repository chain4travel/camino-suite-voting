import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import createHash from 'create-hash';
import { difference, find } from 'lodash';
import {
  BN,
  BinTools,
  Avalanche as Camino,
  Buffer,
} from '@c4tplatform/caminojs/dist';
import {
  OutputOwners,
  MultisigKeyChain,
  SECP256k1KeyPair,
  MultisigKeyPair,
  SignatureError,
} from '@c4tplatform/caminojs/dist/common';
import {
  Configuration,
  MultisigApi,
  ModelMultisigTx,
} from '@c4tplatform/signavaultjs';
import {
  AddressState,
  PlatformVMConstants,
  UnsignedTx as PlatformUnsignedTx,
  KeyChain,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import store from 'wallet/store';
import useNetwork from './useNetwork';
import { MultisigWallet, SingletonWallet, Network, WalletType } from '@/types';
import useToast from './useToast';

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
  const [isConsortiumMember, setIsConsortiumMember] = useState<boolean>(false);
  const [pendingMultisigTx, setPendingMultisigTx] = useState<
    (ModelMultisigTx & { isSigned: boolean })[] | undefined
  >();
  const toast = useToast();

  const signavaultApi = useMemo(
    () => getSignaVaultApi(activeNetwork),
    [activeNetwork]
  );
  const {
    pchainAPI,
    signer,
    currentWalletAddress,
    multisigWallet,
    tryToSignMultisig,
    signMultisigTx,
    abortSignavault,
    executeMultisigTx,
  } = useMemo(() => {
    const bintools = BinTools.getInstance();
    const getAddressState = async (address: string, caminoClient: Camino) => {
      const BN_ONE = new BN(1);
      const states = await caminoClient?.PChain().getAddressStates(address);
      setIsConsortiumMember(
        !states?.and(BN_ONE.shln(AddressState.CONSORTIUM)).isZero()
      );
    };

    const getMultisigTxForAlias = async (
      alias: string,
      signer: SECP256k1KeyPair
    ) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signatureAliasTimestamp = signer
        .sign(
          Buffer.from(
            createHash('sha256')
              .update(Buffer.from(alias + timestamp))
              .digest()
          )
        )
        .toString('hex');

      const res = await signavaultApi.getAllMultisigTxForAlias(
        alias,
        signatureAliasTimestamp,
        timestamp
      );
      const pendingTxs = res.data.map(tx => {
        const unlinkedAddresses = (
          activeWallet as MultisigWallet
        ).unlinkedOwners.map(ulink =>
          bintools.addressToString(
            activeWallet.hrp,
            activeWallet.pchainId,
            ulink
          )
        );
        const walletAddress = difference(
          (activeWallet as MultisigWallet).keyData.owner.addresses,
          unlinkedAddresses
        );
        const isSigned = !!find(
          tx.owners,
          owner => walletAddress.includes(owner.address) && owner.signature
        );
        return { ...tx, isSigned };
      });
      setPendingMultisigTx(pendingTxs);
    };

    const tryToCreateMultisig = async (
      wallet: MultisigWallet,
      unsignedTx: PlatformUnsignedTx
    ) => {
      // Create the hash from the tx
      const txbuff = unsignedTx.toBuffer();
      const msg: Buffer = Buffer.from(
        createHash('sha256').update(txbuff).digest()
      );

      const outputOwner = new OutputOwners(
        wallet.keyData.owner.addresses.map((addr: string) =>
          bintools.stringToAddress(addr)
        ),
        new BN(wallet.keyData.owner.locktime),
        wallet.keyData.owner.threshold
      );

      // Crreate Multisig KeyChain
      const msKeyChain = new MultisigKeyChain(
        wallet.hrp,
        wallet.pchainId,
        msg,
        PlatformVMConstants.SECPMULTISIGCREDENTIAL,
        unsignedTx.getTransaction().getOutputOwners(),
        new Map([[wallet.keyData.alias.toString('hex'), outputOwner]])
      );

      // Insert all signatures
      const walletSigs: Buffer[] = [];
      wallet.wallets.forEach(w => {
        const key = w.keyPair;
        if (key) {
          const signature = key.sign(msg);
          walletSigs.push(signature);
          msKeyChain.addKey(
            new MultisigKeyPair(msKeyChain, key.getAddress(), signature)
          );
        }
      });

      // Create signature indices (throws if not able to do so)
      try {
        msKeyChain.buildSignatureIndices();
        // No exception, we can sign directly and issue tx
        unsignedTx.sign(msKeyChain);
      } catch (e) {
        console.error('failed to Create signature indices ', e);
        // Signature errors are thrown if not enough signers are present
        if (!(e instanceof SignatureError)) throw e;
      }

      // This is the place where we can need to do some signavault activities
      // - check if the tx is already in signavault
      // - if so:
      // -- pull signatures, and insert them into mskeychain
      // -- call buildSignatureIndices again
      // -- if successful, tx can be signed
      // - if not:
      // -- serialize tx into hex bytes (hexm)
      // -- serialize utx.getTransaction().getOutputOwners (hexo)
      // -- send hexbytes, transaction.outputowners, txID to signavault
      // -- for every wallet here send the signature (loop)

      // ToDo: On init time there should be set if this is an existing
      // or new TX, for this little test we assume new TX
      const alias = bintools.addressToString(
        wallet.hrp,
        wallet.pchainId,
        wallet.keyData.alias
      );
      try {
        await signavaultApi.createMultisigTx({
          alias,
          unsignedTx: txbuff.toString('hex'),
          signature: walletSigs[0].toString('hex'),
          outputOwners: OutputOwners.toArray(
            unsignedTx.getTransaction().getOutputOwners()
          ).toString('hex'),
        });

        walletSigs.splice(0, 1);
        for (const s of walletSigs) {
          await signavaultApi.signMultisigTx(msg.toString('hex'), {
            signature: s.toString('hex'),
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await getMultisigTxForAlias(alias, wallet.wallets[0].keyPair!);
      } catch (e: unknown) {
        const data = (e as AxiosError).response?.data;
        if (data) {
          console.error('failed to create multisig tx on signavault: ', e);
          toast.error('Failed to create the vote');
        }
        // throw e
      }
    };

    const signMultisigTx = async (
      wallet: MultisigWallet,
      tx: ModelMultisigTx
    ) => {
      const msg = Buffer.from(tx.id, 'hex');
      try {
        for (const w of wallet.wallets) {
          const staticKey = w.keyPair;
          const privKey = staticKey?.getPrivateKeyString();
          const keychain = new KeyChain(wallet.hrp, wallet.pchainId);
          const key = keychain.importKey(privKey ?? '');

          if (key) {
            const addrStr = bintools.addressToString(
              wallet.hrp,
              wallet.pchainId,
              key.getAddress()
            );
            const owner = tx.owners.find(o => o.address === addrStr);
            if (owner && !owner.signature) {
              const signature = key.sign(msg);
              await signavaultApi.signMultisigTx(tx.id, {
                signature: signature.toString('hex'),
              });
            }
          }
        }
        toast.success('The transaction has been signed');
      } catch (error) {
        console.error('failed to sign transaction on signavault: ', error);
        toast.error('Failed to sign the transaction');
      }
      const walletAddress = bintools.addressToString(
        wallet.hrp,
        wallet.pchainId,
        wallet?.keyData.alias
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await getMultisigTxForAlias(walletAddress, wallet.wallets[0].keyPair!);
    };

    const abortSignavault = async (
      wallet: MultisigWallet,
      tx: ModelMultisigTx
    ) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signingKeyPair = wallet.wallets?.[0]?.keyPair;

      if (!signingKeyPair) {
        console.warn('wallet returned undefined staticKeyPair');
        return;
      }
      const signatureAliasTimestamp = signingKeyPair
        .sign(
          Buffer.from(
            createHash('sha256').update(Buffer.from(timestamp)).digest()
          )
        )
        ?.toString('hex');
      try {
        await signavaultApi.cancelMultisigTx(tx.id, {
          timestamp: timestamp,
          signature: signatureAliasTimestamp,
          id: tx?.id,
        });
        toast.success('The transaction has been cancelled successfully');
      } catch (error) {
        console.error('failed to cancel the tx on signavault: ', error);
        toast.error('Failed to cancel the transaction');
      }
      const walletAddress = bintools.addressToString(
        wallet.hrp,
        wallet.pchainId,
        wallet?.keyData.alias
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await getMultisigTxForAlias(walletAddress, wallet.wallets[0].keyPair!);
    };

    const executeMultisigTx = async (
      wallet: MultisigWallet,
      tx: ModelMultisigTx,
      onSuccess?: (txID?: string) => void
    ) => {
      // Recover data from tx
      // The SECP256k1 OutputOwners to sign (in general 1 msig alias)
      const outputOwners = OutputOwners.fromArray(
        Buffer.from(tx.outputOwners, 'hex')
      );
      // Msig Alias converted into OutputOwner
      const outputOwner = new OutputOwners(
        wallet.keyData.owner.addresses.map((addr: string) =>
          bintools.stringToAddress(addr)
        ),
        new BN(wallet.keyData.owner.locktime),
        wallet.keyData.owner.threshold
      );

      // Crreate Multisig KeyChain
      const msKeyChain = new MultisigKeyChain(
        wallet.hrp,
        wallet.pchainId,
        Buffer.from(tx.unsignedTx, 'hex'),
        PlatformVMConstants.SECPMULTISIGCREDENTIAL,
        outputOwners,
        new Map([[wallet.keyData.alias.toString('hex'), outputOwner]])
      );

      // Read all existing signatures and add them into the new keychain
      const signedLookup = new Set<string>();
      tx.owners.forEach(o => {
        if (o.signature) {
          const address = bintools.stringToAddress(o.address);
          signedLookup.add(address.toString('hex'));
          msKeyChain.addKey(
            new MultisigKeyPair(
              msKeyChain,
              address,
              Buffer.from(o.signature, 'hex')
            )
          );
        }
      });

      // Add potential additional signatures
      const addSigs = (tx.metadata ?? '').split('|');
      addSigs.forEach(item => {
        const addrSig = item.split('#');
        if (addrSig.length == 2)
          msKeyChain.addKey(
            new MultisigKeyPair(
              msKeyChain,
              Buffer.from(addrSig[0], 'hex'),
              Buffer.from(addrSig[1], 'hex')
            )
          );
      });
      const kcData = {
        kc: msKeyChain,
        signers: signedLookup,
      };
      // Add our own signatures. we usw the last for signing external rq
      const msg = Buffer.from(tx.id, 'hex');
      // This wallet signs the signed TX for verification
      let signer: SECP256k1KeyPair | undefined = undefined;
      for (const w of wallet.wallets) {
        const key = w.keyPair;
        if (key) {
          signer = key;
          kcData.kc.addKey(
            new MultisigKeyPair(kcData.kc, key.getAddress(), key.sign(msg))
          );
        }
      }
      if (!signer) throw Error('No signing wallets available');
      // This prepares signatureIndices in kexChain for signing.
      // Sign will provide them in a MultisigCredential structure to the node
      try {
        kcData.kc.buildSignatureIndices();
      } catch (error) {
        console.error('buildSignatureIndices encounters exception: ', error);
      }

      const utx = new PlatformUnsignedTx();
      utx.fromBuffer(Buffer.from(tx.unsignedTx, 'hex'));
      const signedTx = utx.sign(kcData.kc);
      const signedTxBytes = signedTx.toBuffer();

      const signedTxHash = Buffer.from(
        createHash('sha256').update(signedTxBytes).digest()
      );
      const signature = signer.sign(signedTxHash);

      try {
        const response = await signavaultApi.issueMultisigTx({
          signature: signature.toString('hex'),
          signedTx: signedTxBytes.toString('hex'),
        });
        const { txID } = response.data;
        const alias = bintools.addressToString(
          wallet.hrp,
          wallet.pchainId,
          wallet.keyData.alias
        );
        getMultisigTxForAlias(alias, wallet.wallets[0].keyPair!);
        onSuccess && onSuccess(txID);
      } catch (error) {
        console.error('failed to issueMultisigTx on SignaVault', error);
        toast.error(
          error.response.data.error,
          'Failed to execute the multisig transaction'
        );
      }
    };

    if (activeWallet && caminoClient) {
      const pchain = caminoClient.PChain();
      let walletAddress, signer, multisigWallet;
      if (isMultiSigWallet(activeWallet)) {
        multisigWallet = activeWallet as MultisigWallet;
        walletAddress = bintools.addressToString(
          multisigWallet.hrp,
          multisigWallet.pchainId,
          multisigWallet.keyData.alias
        );
        signer = multisigWallet.wallets[0].keyPair; // pchain.keyChain().importKey();
        getMultisigTxForAlias(walletAddress, signer!);
      } else {
        const singletonWallet = activeWallet as SingletonWallet;
        walletAddress =
          singletonWallet.platformKeyChain?.getAddressStrings()[0];
        signer = pchain.keyChain().importKey(singletonWallet.key);
        setPendingMultisigTx(undefined);
      }
      getAddressState(walletAddress, caminoClient);

      return {
        pchainAPI: pchain,
        signer,
        currentWalletAddress: walletAddress,
        multisigWallet,
        tryToSignMultisig: (unsignedTx: PlatformUnsignedTx) =>
          tryToCreateMultisig(activeWallet as MultisigWallet, unsignedTx),
        signMultisigTx: (tx: ModelMultisigTx) =>
          signMultisigTx(activeWallet as MultisigWallet, tx),
        abortSignavault: (tx: ModelMultisigTx) =>
          abortSignavault(activeWallet as MultisigWallet, tx),
        executeMultisigTx:
          (onSuccess?: (txID?: string) => void) => (tx: ModelMultisigTx) =>
            executeMultisigTx(activeWallet as MultisigWallet, tx, onSuccess),
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
    pendingMultisigTx,
    multisigWallet,
    tryToSignMultisig,
    signMultisigTx,
    abortSignavault,
    executeMultisigTx,
  };
};
export default useWallet;
