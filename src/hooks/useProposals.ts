import { useQuery, useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { filter, find, map, orderBy } from 'lodash';
import { BinTools, platformvm } from '@c4tplatform/caminojs/dist';
import { Serialization } from '@c4tplatform/caminojs/dist/utils/serialization';
import {
  KeyPair,
  PlatformVMConstants,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
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
  ProposalStatuses,
  ProposalTypes,
  VotingOption,
} from '@/types';
import { parseUnsignedTx } from '@/helpers/tx';
import useWallet from './useWallet';
import useToast from './useToast';
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
    const now = DateTime.now();
    const startTime = DateTime.fromISO(proposal.startTime);
    const endTime = DateTime.fromISO(proposal.endTime);
    const inactive = startTime > now;
    const isCompleted =
      (Object.values(ProposalStatuses).indexOf(ProposalStatuses.Completed) &
        (proposal.status ?? 0)) >
      0;
    return {
      ...proposal,
      outcome,
      typeId: proposal.type,
      type: proposalType,
      options: options.map((opt: number, idx: number) => ({
        option: idx,
        value: opt,
      })),
      startTimestamp: startTime.toUnixInteger(),
      endTimestamp: endTime.toUnixInteger(),
      inactive,
      isCompleted,
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
  currentWalletAddress?: string
) => {
  if (!proposals) return [];
  return proposals.map(proposalWrapper => {
    const proposal = parseAPIProposal(proposalWrapper.dacProposal);
    const votes = proposalWrapper.dacVotes.map(vote => parseAPIVote(vote, hrp));
    let voted;
    if (currentWalletAddress) {
      voted = find(votes, { voterAddr: currentWalletAddress });
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

export const useActiveVotings = (currentWalletAddress?: string, page = 0) => {
  const { activeNetwork } = useNetwork();
  const { data, isInitialLoading, isLoading, refetch, error } = useQuery(
    ['getActiveVotings', page],
    async () => fetchActiveVotings(page),
    { notifyOnChangeProps: ['data', 'error'] }
  );

  console.debug('useActiveVotings isInitialLoading: ', isInitialLoading);
  const proposals = parseAPIProposals(
    activeNetwork?.name ?? 'local',
    data?.data.dacProposals,
    currentWalletAddress
  );

  return {
    isLoading,
    isInitialLoading,
    error,
    refetch,
    proposals: proposals ?? [],
  };
};

export const useUpcomingVotings = (page = 0) => {
  const { proposals, isLoading, error } = useActiveVotings(undefined, page);
  const upcomings = filter(proposals, proposal => proposal.inactive);
  return {
    proposals: upcomings,
    isLoading,
    error,
  };
};

export const useCompletedVotes = (
  type: number,
  startTime?: string,
  endTime?: string,
  page = 0
) => {
  const { activeNetwork } = useNetwork();
  const { data, isLoading, error } = useQuery(
    ['getCompletedVotes', type, startTime, endTime, page],
    async () => fetchCompletedVotes(type, startTime, endTime),
    {
      refetchOnWindowFocus: false,
      notifyOnChangeProps: ['data', 'error'],
    }
  );
  const proposals = parseAPIProposals(
    activeNetwork?.name ?? 'local',
    data?.data.dacProposals
  );
  const sortedProposals = orderBy(proposals, ['startTimestamp'], ['desc']);

  return {
    proposals: sortedProposals.map((p, idx) => ({
      ...p,
      seq: sortedProposals.length - idx,
    })),
    error,
    isLoading,
  };
};

export const useProposal = (id: string, signer?: KeyPair) => {
  const { activeNetwork } = useNetwork();
  const { data, isLoading, error, refetch } = useQuery(
    ['getProposalDetail', id],
    async () => fetchProposalDetail(id),
    {
      notifyOnChangeProps: ['data', 'error'],
    }
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
    refetch,
  };
};

export const useAddProposal = (
  proposalType: number | string,
  option?: { onSuccess?: (data: any) => void; onSettled?: (data: any) => void }
) => {
  const toast = useToast();
  const { pchainAPI, signer, multisigWallet, tryToSignMultisig } = useWallet();
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

      // Non-multisig wallet
      if (!multisigWallet) {
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
      }

      // Multisig Wallet
      const multisigAlias = BinTools.getInstance().addressToString(
        multisigWallet.hrp,
        multisigWallet.pchainId,
        multisigWallet.keyData.alias
      );
      const txs = await pchainAPI?.getUTXOs([multisigAlias]);
      const unsignedTx = await pchainAPI.buildAddProposalTx(
        txs.utxos,
        [multisigAlias, ...multisigWallet.keyData.owner.addresses],
        [multisigAlias],
        proposal,
        multisigWallet.keyData.alias,
        0,
        serialization.typeToBuffer(description, 'utf8'),
        undefined,
        multisigWallet.keyData.owner.threshold
      );
      // - check signavault to get pending Txs
      tryToSignMultisig && (await tryToSignMultisig(unsignedTx));
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

export const usePendingMultisigProposals = () => {
  const {
    pendingMultisigTx,
    multisigWallet,
    signMultisigTx,
    executeMultisigTx,
    abortSignavault,
  } = useWallet();

  const { pendingMultisigAddProposalTxs } = useMemo(() => {
    let pendingMultisigAddProposalTxs: any[] = [];
    if (multisigWallet) {
      pendingMultisigAddProposalTxs = map(
        pendingMultisigTx,
        (msigTx: ModelMultisigTx) => {
          const unsignedTx = parseUnsignedTx(msigTx.unsignedTx);
          const aliasAddress = BinTools.getInstance().addressToString(
            multisigWallet.hrp,
            multisigWallet.pchainId,
            multisigWallet.keyData.alias
          );
          const isCreaterAlias = aliasAddress === msigTx.alias;

          let canExecuteMultisigTx = false;
          const threshold = msigTx.threshold;
          if (threshold) {
            let signers = 0;
            msigTx.owners.forEach(owner => {
              if (owner.signature) signers++;
            });
            canExecuteMultisigTx = signers >= threshold;
          }
          return {
            ...msigTx,
            ...unsignedTx,
            isCreaterAlias,
            canExecuteMultisigTx,
          };
        }
      ).filter(
        unsignedTx => unsignedTx.typeId === PlatformVMConstants.ADDPROPOSALTX
      );
    }

    return {
      pendingMultisigAddProposalTxs,
    };
  }, [pendingMultisigTx]);

  return {
    pendingMultisigAddProposalTxs,
    signMultisigTx,
    executeMultisigTx,
    abortSignavault,
  };
};
