import React, { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { FormControlLabel, Stack } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { filter, find } from 'lodash';
import { useActiveVotings } from '@/hooks/useProposals';
import useWallet from '@/hooks/useWallet';
import Header from '@/components/Header';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@/components/Accordion';
import { ProposalType } from '@/types';
import Checkbox from '@/components/Checkbox';
import Paper from '@/components/Paper';
import RefreshButton from '@/components/RefreshButton';
import { usePendingMultisigAddVoteTxs } from '@/hooks/useMultisig';
import { useWalletStore } from '@/store';
import VotingList from './VotingList';
import GroupHeader from './GroupHeader';
import NoProposals from './NoProposals';

const ActiveVotings = () => {
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const wallet = useWallet();
  const { currentWalletAddress, addressState } = useWalletStore(state => ({
    currentWalletAddress: state.currentWalletAddress,
    addressState: state.addressState,
  }));
  const { isConsortiumMember } = addressState;
  const [onlyTodo, setOnlyTodo] = useState(false);
  const { proposals, error, refetch, isFetching } = useActiveVotings(
    wallet.pchainAPI,
    currentWalletAddress
  );
  const {
    pendingMultisigAddVoteTxs,
    refetch: refetchPendingMultisigTxs,
    isFetching: isFetchingPendingMultisigTxs,
  } = usePendingMultisigAddVoteTxs();
  const groupedProposals = useMemo(() => {
    let filteredProposals = filter(proposals, proposal => !proposal.inactive);
    if (onlyTodo) {
      filteredProposals = filter(
        proposals,
        proposal => !proposal.voted || proposal.voted.length === 0
      );
    }
    return filteredProposals.reduce((result: any, proposal: any) => {
      const proposalType = proposalTypes.find(
        (vtype: ProposalType) => vtype.id === proposal.typeId
      );
      if (proposalType) {
        const currentData = result[proposalType.id]
          ? result[proposalType.id].data
          : [];
        const pendingMultisigTx = find(
          pendingMultisigAddVoteTxs,
          msigTx => msigTx.proposalId === proposal.id
        );
        return {
          ...result,
          [proposalType.id]: {
            type: proposal.type,
            typeId: proposal.typeId,
            name: proposalType.name,
            icon: proposalType.icon,
            data: [...currentData, { ...proposal, pendingMultisigTx }],
          },
        };
      } else {
        console.warn(
          `unsupported proposal type(${proposal.type}) of proposal(${proposal.id})`
        );
      }
      return result;
    }, {});
  }, [proposals, onlyTodo, pendingMultisigAddVoteTxs]);
  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Ongoing Proposals" variant="h5">
        <Stack direction="row" alignItems="center" spacing={1}>
          {isConsortiumMember && (
            <FormControlLabel
              control={<Checkbox />}
              onChange={(_event, checked) => setOnlyTodo(checked)}
              label="Show only TODO"
            />
          )}
          <RefreshButton
            loading={isFetching || isFetchingPendingMultisigTxs}
            onRefresh={() => {
              refetch();
              refetchPendingMultisigTxs();
            }}
          />
        </Stack>
      </Header>
      {Object.entries(groupedProposals).length > 0 ? (
        Object.entries(groupedProposals ?? {}).map(
          ([proposalType, group]: [string, any]) => (
            <Accordion
              key={proposalType}
              defaultExpanded={group.data.length > 0}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: 'grey.800',
                  border: 1,
                  borderColor: 'grey.700',
                }}
              >
                <GroupHeader group={group} />
              </AccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                <VotingList
                  data={group}
                  isConsortiumMember={isConsortiumMember}
                  refresh={refetch}
                />
              </AccordionDetails>
            </Accordion>
          )
        )
      ) : (
        <NoProposals type="ongoing" />
      )}
    </Paper>
  );
};
export default ActiveVotings;
