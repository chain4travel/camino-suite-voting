import { useQuery, useMutation } from '@tanstack/react-query';
import { platformvm } from '@c4tplatform/caminojs/dist';
import { Serialization } from '@c4tplatform/caminojs/dist/utils/serialization';
import { DateTime } from 'luxon';

import {
  fetchProposalDetail,
  fetchCompletedVotes,
  fetchActiveVotings,
} from '@/apis/proposals';
import { ProposalTypes, VotingOption } from '@/types';
import useWallet from './useWallet';
import useToast from './useToast';

const serialization = Serialization.getInstance();
export const useActiveVotings = (page = 0) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getActiveVotings', page],
    async () => fetchActiveVotings(page)
  );

  console.debug('useActiveVotings data: ', data, isLoading, error, isSuccess);

  const proposals =
    data?.data.dacProposals.map(proposal => {
      const optionsBuf = serialization.typeToBuffer(proposal.options, 'base64');
      const options = JSON.parse(optionsBuf.toString());
      const proposalType = Object.values(ProposalTypes)[proposal.type];
      return {
        ...proposal,
        typeId: proposal.type,
        type: proposalType,
        options: options.map((opt: number, idx: number) => ({
          option: idx,
          value: opt,
        })),
      };
    }) ?? [];

  return {
    isLoading,
    error,
    proposals,
  };
};

export const useCompletedVotes = (type: string, page = 0) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getCompletedVotes', type, page],
    async () => fetchCompletedVotes(type, page)
  );

  console.debug('useCompletedVotes data: ', data, isLoading, error, isSuccess);

  return {
    votes: data?.data ?? [],
    error,
    isLoading,
    // totalCount: data?.data?.totalCount ?? 0,
  };
};

export const useProposal = (type: string, id: string) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getActiveProposal', type, id],
    async () => fetchProposalDetail(type, id)
  );

  console.debug('useActiveProposal data: ', data, isLoading, error, isSuccess);

  return {
    proposal: data?.data,
    error,
    isLoading,
    // totalCount: data?.data?.totalCount ?? 0,
  };
};

export const useAddProposal = (
  proposalType: number | string,
  option?: { onSuccess?: (data: any) => void; onSettled?: (data: any) => void }
) => {
  const toast = useToast();
  const { pchainAPI, signer } = useWallet();
  const mutation = useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      votingOptions,
    }: {
      startDate: DateTime;
      endDate: DateTime;
      votingOptions: VotingOption[];
    }) => {
      let proposal: platformvm.Proposal;
      switch (proposalType) {
        case 0:
        case 'BASE_FEE':
          proposal = new platformvm.BaseFeeProposal(
            startDate.toUnixInteger(),
            endDate.toUnixInteger()
          );
          votingOptions
            .map((opt: VotingOption) => opt.value)
            .forEach(opt => proposal.addBaseFeeOption(opt));
          break;
        default:
          throw `Unsupported proposal type: ${proposalType}`;
      }

      const txs = await pchainAPI.getUTXOs(
        pchainAPI.keyChain().getAddressStrings()
      );
      const unsignedTx = await pchainAPI.buildAddProposalTx(
        txs.utxos,
        pchainAPI.keyChain().getAddressStrings(),
        pchainAPI.keyChain().getAddressStrings(),
        proposal,
        signer.getAddress(),
        0
      );
      const tx = unsignedTx.sign(pchainAPI.keyChain());
      console.debug('tx', tx);
      const txid: string = await pchainAPI.issueTx(tx);
      return txid;
    },
    onSuccess: data => {
      option?.onSuccess
        ? option.onSuccess(data)
        : toast.success(`AddProposalTx sent with TxID: ${data}`);
    },
    onError: error => toast.error(`Failed to add proposal: ${error}`),
    onSettled: option && option.onSettled,
  });

  return mutation.mutate;
};
