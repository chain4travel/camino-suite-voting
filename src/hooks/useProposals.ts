import { useQuery, useMutation } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { platformvm } from '@c4tplatform/caminojs/dist';
import { Serialization } from '@c4tplatform/caminojs/dist/utils/serialization';
import { KeyPair } from '@c4tplatform/caminojs/dist/apis/platformvm';
import {
  fetchProposalDetail,
  fetchCompletedVotes,
  fetchActiveVotings,
} from '@/apis/proposals';
import {
  APIPRoposalWrapper,
  APIProposal,
  APIVote,
  Proposal,
  ProposalTypes,
  VotingOption,
} from '@/types';
import useWallet from './useWallet';
import useToast from './useToast';
import { find } from 'lodash';
import useNetwork from './useNetwork';

const serialization = Serialization.getInstance();
const parseAPIProposal = (proposal?: APIProposal) => {
  if (proposal) {
    const optionsBuf = serialization.typeToBuffer(proposal.options, 'base64');
    const options = JSON.parse(optionsBuf.toString());
    let outcome;
    if (proposal.outcome) {
      const outcomeBuf = serialization.typeToBuffer(proposal.outcome, 'base64');
      outcome = JSON.parse(outcomeBuf.toString());
    }
    const proposalType = Object.values(ProposalTypes)[proposal.type];
    return {
      ...proposal,
      outcome,
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
  }
  return;
};
const parseAPIProposals = (
  hrp: string,
  proposals?: APIPRoposalWrapper[],
  signer?: KeyPair
) => {
  if (!proposals) return [];
  return proposals.map(proposalWrapper => {
    const proposal = parseAPIProposal(proposalWrapper.dacProposal);
    const votes = proposalWrapper.dacVotes.map(vote => parseAPIVote(vote, hrp));
    let voted;
    if (signer) {
      voted = find(votes, { voterAddr: signer.getAddressString() });
      voted = voted?.votedOptions.map((v: number) => ({ option: v }));
    }

    return {
      ...proposal,
      votes,
      voted,
    };
  });
};
const parseAPIVote = (vote: APIVote, hrp: string) => {
  const votedOptionsBuf = serialization.typeToBuffer(
    vote.votedOptions,
    'base64'
  );
  const votedOptions = JSON.parse(votedOptionsBuf.toString());
  const votedDateTime = DateTime.fromISO(vote.votedAt).toUnixInteger();
  return {
    ...vote,
    votedDateTime,
    votedOptions,
  };
};

export const useActiveVotings = (signer?: KeyPair, page = 0) => {
  const { activeNetwork } = useNetwork();
  const { data, isInitialLoading, isLoading, isSuccess, error } = useQuery(
    ['getActiveVotings', page],
    async () => fetchActiveVotings(page)
  );

  console.debug('useActiveVotings isInitialLoading: ', isInitialLoading);
  const proposals = parseAPIProposals(
    activeNetwork?.name ?? 'local',
    data?.data.dacProposals,
    signer
  );

  return {
    isLoading,
    isInitialLoading,
    error,
    proposals: proposals ?? [],
  };
};

export const useCompletedVotes = (
  type: number,
  startTime?: string,
  endTime?: string,
  page = 0
) => {
  const { activeNetwork } = useNetwork();
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getCompletedVotes', type, startTime, endTime, page],
    async () => fetchCompletedVotes(type, startTime, endTime),
    { refetchOnWindowFocus: false }
  );
  const votes = parseAPIProposals(
    activeNetwork?.name ?? 'local',
    data?.data.dacProposals
  );

  return {
    votes,
    error,
    isLoading,
    // totalCount: data?.data?.totalCount ?? 0,
  };
};

export const useProposal = (id: string, signer?: KeyPair) => {
  const { activeNetwork } = useNetwork();
  const { data, isLoading, isSuccess, error } = useQuery(
    ['getProposalDetail', id],
    async () => fetchProposalDetail(id)
  );

  const proposal = parseAPIProposal(data?.data.dacProposal);
  const votes = data?.data.dacVotes.map((vote: APIVote) =>
    parseAPIVote(vote, activeNetwork!.name)
  );

  // Find voted by current wallet
  let voted;
  if (signer) {
    voted = find(votes, { voterAddr: signer.getAddressString() });
  }

  return {
    proposal: {
      ...(proposal ?? {}),
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
            startDate.startOf('day').toUnixInteger(),
            endDate.endOf('day').toUnixInteger()
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

export const useEligibleCMembers = (proposal: Proposal) => {
  const { caminoClient } = useNetwork();
  const { data, error } = useQuery({
    queryKey: ['getEligibleCMembers', proposal.id],
    queryFn: async () =>
      caminoClient?.PChain().getValidatorsAt(proposal.blockHeight),
  });

  return {
    ...proposal,
    error,
    eligibleCMembers: data?.validators,
  };
};
