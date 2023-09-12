import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { VotingOption } from '@/types';
import useToast from './useToast';
import useWallet from './useWallet';

const useSubmitVote = (option?: {
  onSuccess?: (d: any) => void;
  onSettled?: () => void;
}) => {
  const toast = useToast();
  const { pchainAPI, signer } = useWallet();
  const mutation = useMutation({
    mutationFn: async ({
      proposalId,
      optionIndex,
    }: {
      proposalId: string;
      optionIndex: number;
    }) => {
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
    },
    onSuccess:
      (option && option.onSuccess) ||
      (() => toast.success('Successfully voted')),
    onError: (error, any) => toast.error(`Failed to vote: ${error}`),
    onSettled: option && option.onSettled,
  });

  return mutation;
};

const useVote = (onSuccess: (d: any) => void) => {
  const [selectedOption, setSelectedOption] = useState<VotingOption | null>(
    null
  );
  const [confirmedOption, setConfirmedOption] = useState<
    string | number | null
  >(null);
  const submitVote = useSubmitVote({
    onSuccess,
    onSettled: () => {
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
