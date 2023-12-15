import { AxiosError } from 'axios';
import createHash from 'create-hash';
import { difference, find, map } from 'lodash';
import { BinTools, Buffer, BN } from '@c4tplatform/caminojs/dist';
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners,
  SECP256k1KeyPair,
  SignatureError,
} from '@c4tplatform/caminojs/dist/common';
import {
  KeyChain,
  PlatformVMConstants,
  UnsignedTx as PlatformUnsignedTx,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import useWallet from './useWallet';
import useToast from './useToast';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import { useWalletStore } from '@/store';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseUnsignedTx } from '@/helpers/tx';
import { PendingMultisigTx } from '@/types';

export const usePendingMultisigTx = () => {
  const { multisigWallet, signavaultApi, signer } = useWallet();
  const bintools = BinTools.getInstance();
  const setPendingMultisigTxs = useWalletStore(
    state => state.setPendingMultisigTxs
  );
  let alias: string | undefined;
  if (multisigWallet) {
    alias = bintools.addressToString(
      multisigWallet?.hrp,
      multisigWallet?.pchainId,
      multisigWallet?.keyData.alias
    );
  }

  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ['getPendingMultisigTxs', alias],
    queryFn: async () => {
      if (alias && multisigWallet && signer) {
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
          const unlinkedAddresses = multisigWallet.unlinkedOwners.map(ulink =>
            bintools.addressToString(
              multisigWallet.hrp,
              multisigWallet.pchainId,
              ulink
            )
          );
          const walletAddress = difference(
            multisigWallet.keyData.owner.addresses,
            unlinkedAddresses
          );
          const isSigned = !!find(
            tx.owners,
            owner => walletAddress.includes(owner.address) && owner.signature
          );
          const unsignedTx = parseUnsignedTx(
            tx.unsignedTx,
            multisigWallet?.hrp,
            multisigWallet?.pchainId
          );
          return { ...tx, ...unsignedTx, isSigned };
        });
        setPendingMultisigTxs(pendingTxs);
        return pendingTxs;
      }
      return;
    },
  });

  return {
    pendingMultisigTxs: data,
    alias,
    error,
    refetch,
    isFetching,
  };
};

export const usePendingMultisigAddProposalTxs = () => {
  const { pendingMultisigTxs, alias, refetch, isFetching } =
    usePendingMultisigTx();

  let pendingMultisigAddProposalTxs: PendingMultisigTx[] = [];
  if (pendingMultisigTxs) {
    pendingMultisigAddProposalTxs = map(pendingMultisigTxs, msigTx => {
      const isCreaterAlias = msigTx.alias === alias;

      let canExecute = false;
      const threshold = msigTx.threshold;
      if (threshold) {
        let signers = 0;
        msigTx.owners.forEach(owner => {
          if (owner.signature) signers++;
        });
        canExecute = signers >= threshold;
      }
      return {
        ...msigTx,
        isCreaterAlias,
        canExecute,
      };
    }).filter(
      unsignedTx => unsignedTx.typeId === PlatformVMConstants.ADDPROPOSALTX
    );
  }

  return {
    pendingMultisigAddProposalTxs,
    refetch,
    isFetching,
  };
};

export const usePendingMultisigAddVoteTxs = () => {
  const { pendingMultisigTxs, refetch, isFetching } = usePendingMultisigTx();

  const pendingMultisigAddVoteTxs = useMemo(() => {
    const pendingMultisigAddVoteTxs: PendingMultisigTx[] = map(
      pendingMultisigTxs,
      msigTx => {
        let canExecute = false;
        const threshold = msigTx.threshold;
        if (threshold) {
          let signers = 0;
          msigTx.owners.forEach(owner => {
            if (owner.signature) signers++;
          });
          canExecute = signers >= threshold;
        }
        return { ...msigTx, canExecute };
      }
    ).filter(unsignedTx => unsignedTx.typeId === PlatformVMConstants.ADDVOTETX);

    return pendingMultisigAddVoteTxs;
  }, [pendingMultisigTxs]);

  return {
    pendingMultisigAddVoteTxs,
    refetch,
    isFetching,
  };
};

export const useMultisig = () => {
  const { multisigWallet, signavaultApi } = useWallet();
  const toast = useToast();
  const bintools = BinTools.getInstance();
  const { refetch } = usePendingMultisigTx();

  const {
    tryToCreateMultisig,
    signMultisigTx,
    abortSignavault,
    executeMultisigTx,
  } = useMemo(() => {
    let tryToCreateMultisig, signMultisigTx, abortSignavault, executeMultisigTx;
    if (multisigWallet) {
      tryToCreateMultisig = async (unsignedTx: PlatformUnsignedTx) => {
        // Create the hash from the tx
        const txbuff = unsignedTx.toBuffer();
        const msg: Buffer = Buffer.from(
          createHash('sha256').update(txbuff).digest()
        );

        const outputOwner = new OutputOwners(
          multisigWallet.keyData.owner.addresses.map((addr: string) =>
            bintools.stringToAddress(addr)
          ),
          new BN(multisigWallet.keyData.owner.locktime),
          multisigWallet.keyData.owner.threshold
        );

        // Crreate Multisig KeyChain
        const msKeyChain = new MultisigKeyChain(
          multisigWallet.hrp,
          multisigWallet.pchainId,
          msg,
          PlatformVMConstants.SECPMULTISIGCREDENTIAL,
          unsignedTx.getTransaction().getOutputOwners(),
          new Map([[multisigWallet.keyData.alias.toString('hex'), outputOwner]])
        );

        // Insert all signatures
        const walletSigs: Buffer[] = [];
        multisigWallet.wallets.forEach(w => {
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
          multisigWallet.hrp,
          multisigWallet.pchainId,
          multisigWallet.keyData.alias
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
          await refetch();
        } catch (e: unknown) {
          const data = (e as AxiosError).response?.data;
          if (data) {
            console.error('failed to create multisig tx on signavault: ', e);
            toast.error('Failed to create the vote');
          }
          // throw e
        }
      };

      signMultisigTx = async (tx: ModelMultisigTx) => {
        const msg = Buffer.from(tx.id, 'hex');
        try {
          for (const w of multisigWallet.wallets) {
            const staticKey = w.keyPair;
            const privKey = staticKey?.getPrivateKeyString();
            const keychain = new KeyChain(
              multisigWallet.hrp,
              multisigWallet.pchainId
            );
            const key = keychain.importKey(privKey ?? '');

            if (key) {
              const addrStr = bintools.addressToString(
                multisigWallet.hrp,
                multisigWallet.pchainId,
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await refetch();
      };

      abortSignavault = async (tx: ModelMultisigTx) => {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signingKeyPair = multisigWallet.wallets?.[0]?.keyPair;

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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await refetch();
      };

      executeMultisigTx = async (
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
          multisigWallet.keyData.owner.addresses.map((addr: string) =>
            bintools.stringToAddress(addr)
          ),
          new BN(multisigWallet.keyData.owner.locktime),
          multisigWallet.keyData.owner.threshold
        );

        // Crreate Multisig KeyChain
        const msKeyChain = new MultisigKeyChain(
          multisigWallet.hrp,
          multisigWallet.pchainId,
          Buffer.from(tx.unsignedTx, 'hex'),
          PlatformVMConstants.SECPMULTISIGCREDENTIAL,
          outputOwners,
          new Map([[multisigWallet.keyData.alias.toString('hex'), outputOwner]])
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
        for (const w of multisigWallet.wallets) {
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
          refetch();
          onSuccess && onSuccess(txID);
        } catch (error) {
          console.error('failed to issueMultisigTx on SignaVault', error);
          toast.error(
            error.response.data.error,
            'Failed to execute the multisig transaction'
          );
        }
      };
    }
    return {
      tryToCreateMultisig,
      signMultisigTx,
      abortSignavault,
      executeMultisigTx,
    };
  }, [multisigWallet]);

  return {
    tryToCreateMultisig,
    signMultisigTx,
    abortSignavault,
    executeMultisigTx:
      (onSuccess?: (txID?: string) => void) => (tx: ModelMultisigTx) =>
        executeMultisigTx?.(tx, onSuccess),
  };
};
