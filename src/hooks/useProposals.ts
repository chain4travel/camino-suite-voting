import { useQuery, useMutation } from '@tanstack/react-query';
import { BinTools, platformvm } from '@c4tplatform/caminojs/dist';
import { Serialization } from '@c4tplatform/caminojs/dist/utils/serialization';
import { DateTime } from 'luxon';

import {
  fetchProposalDetail,
  fetchCompletedVotes,
  fetchActiveVotings,
} from '@/apis/proposals';
import { APIProposal, ProposalTypes, VotingOption } from '@/types';
import useWallet from './useWallet';
import useToast from './useToast';
import { find } from 'lodash';
import useNetwork from './useNetwork';
import { KeyPair } from '@c4tplatform/caminojs/dist/apis/platformvm';

const serialization = Serialization.getInstance();
const parseAPIProposals = (proposals?: APIProposal[]) => {
  if (!proposals) return [];

  return proposals.map(proposal => {
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
      startTimestamp: DateTime.fromISO(proposal.startTime).toUnixInteger(),
      endTimestamp: DateTime.fromISO(proposal.endTime).toUnixInteger(),
      description: serialization
        .typeToBuffer(proposal.memo, 'base64')
        .toString(),
    };
  });
};

export const useActiveVotings = (signer: KeyPair, page = 0) => {
  const { data, isInitialLoading, isLoading, isSuccess, error } = useQuery(
    ['getActiveVotings', page],
    async () => fetchActiveVotings(page)
  );

  console.debug('useActiveVotings isInitialLoading: ', isInitialLoading);
  console.debug('useActiveVotings data: ', data, isLoading, error, isSuccess);

  const proposals = parseAPIProposals(data?.data.dacProposals);

  return {
    isLoading,
    isInitialLoading,
    error,
    proposals,
  };
};

export const useCompletedVotes = (type: number, page = 0) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getCompletedVotes', type, page],
    async () => fetchCompletedVotes(type)
  );

  console.debug('useCompletedVotes data: ', data, isLoading, error, isSuccess);
  const votes = parseAPIProposals(data?.data.dacProposals);

  return {
    votes,
    error,
    isLoading,
    // totalCount: data?.data?.totalCount ?? 0,
  };
};

export const useProposal = (type: string, id: string, signer: KeyPair) => {
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getProposalDetail', type, id],
    async () => fetchProposalDetail(id)
  );

  console.debug('useProposal data: ', data, isLoading, error, isSuccess);
  const votes = data?.data.dacVotes.map(vote => {
    const votedOptionsBuf = serialization.typeToBuffer(
      vote.votedOptions,
      'base64'
    );
    const votedOptions = JSON.parse(votedOptionsBuf.toString());
    const votedDateTime = DateTime.fromISO(vote.votedAt).toUnixInteger();
    const voterAddrBuf = serialization.typeToBuffer(vote.voterAddr, 'cb58');
    const voterAddr = BinTools.getInstance().addressToString(
      signer.getHRP(),
      signer.getChainID(),
      voterAddrBuf
    );
    return {
      ...vote,
      votedDateTime,
      votedOptions,
      voterAddr,
    };
  });
  const { isInitialLoading, proposals } = useActiveVotings(signer);
  const proposal = find(proposals, { id });
  console.debug(
    'isInitialLoading to fetch active votings',
    isInitialLoading,
    proposal
  );
  // Find voted by current wallet
  const voted = find(votes, { voterAddr: signer.getAddressString() });

  return {
    proposal: {
      ...proposal,
      voted: voted?.votedOptions.map((v: number) => ({ option: v })),
      votes,
    },
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
      description,
    }: {
      startDate: DateTime;
      endDate: DateTime;
      votingOptions: VotingOption[];
      description: string;
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
        0,
        serialization.typeToBuffer(description, 'utf8')
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
