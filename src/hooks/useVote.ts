import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BinTools } from '@c4tplatform/caminojs/dist';
import { VotingOption } from '@/types';
import useToast from './useToast';
import useWallet from './useWallet';
import { useMultisig } from './useMultisig';

const useSubmitVote = (option?: {
  onSuccess?: (d: any) => void;
  onSettled?: () => void;
}) => {
  const toast = useToast();
  const { pchainAPI, signer, multisigWallet } = useWallet();
  const { tryToCreateMultisig } = useMultisig();
  const mutation = useMutation({
    mutationFn: async ({
      proposalId,
      optionIndex,
    }: {
      proposalId: string;
      optionIndex: number;
    }) => {
      // return if cannot access RPC
      if (!pchainAPI) return;

      // Non-multisig wallet connectd
      if (!multisigWallet && signer) {
        const txs = await pchainAPI.getUTXOs(
          pchainAPI.keyChain().getAddressStrings()
        );
        const unsignedTx = await pchainAPI.buildAddVoteTx(
          txs.utxos,
          pchainAPI.keyChain().getAddressStrings(),
          pchainAPI.keyChain().getAddressStrings(),
          proposalId,
          optionIndex,
          signer.getAddress(),
          0
        );
        const tx = unsignedTx.sign(pchainAPI.keyChain());
        const txid: string = await pchainAPI.issueTx(tx);
        return txid;
      }

      // Multisig Wallet connected
      if (multisigWallet) {
        const multisigAlias = BinTools.getInstance().addressToString(
          multisigWallet.hrp,
          multisigWallet.pchainId,
          multisigWallet.keyData.alias
        );
        const txs = await pchainAPI?.getUTXOs([multisigAlias]);
        const unsignedTx = await pchainAPI?.buildAddVoteTx(
          txs.utxos,
          [multisigAlias, ...multisigWallet.keyData.owner.addresses],
          [multisigAlias],
          proposalId,
          optionIndex,
          multisigWallet.keyData.alias,
          0
        );
        // - check signavault to get pending Txs
        tryToCreateMultisig && (await tryToCreateMultisig(unsignedTx));
      }
    },
    onSuccess:
      (option && option.onSuccess) ||
      (() => toast.success('Successfully voted')),
    onError: error => toast.error(`Failed to vote: ${error}`),
    onSettled: option && option.onSettled,
  });

  return {
    submitVote: mutation,
  };
};

const useVote = (onSuccess?: (d: any) => void, onSettled?: () => void) => {
  const [selectedOption, setSelectedOption] = useState<VotingOption | null>(
    null
  );
  const [confirmedOption, setConfirmedOption] = useState<
    string | number | null
  >(null);
  const { submitVote } = useSubmitVote({
    onSuccess,
    onSettled: () => {
      setTimeout(() => onSettled && onSettled(), 1000);
      setConfirmedOption(null);
      setSelectedOption(null);
    },
  });

  return {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote: submitVote.mutate,
  };
};
export default useVote;
