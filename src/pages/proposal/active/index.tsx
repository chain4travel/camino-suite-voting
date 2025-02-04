import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@/components/Accordion';
import Checkbox from '@/components/Checkbox';
import Header from '@/components/Header';
import Paper from '@/components/Paper';
import RefreshButton from '@/components/RefreshButton';
import { usePendingMultisigAddVoteTxs } from '@/hooks/useMultisig';
import { useActiveVotings } from '@/hooks/useProposals';
import useWallet from '@/hooks/useWallet';
import { useWalletStore } from '@/store';
import { ProposalType } from '@/types';
import { ExpandMore } from '@mui/icons-material';
import { FormControlLabel, Stack, useTheme } from '@mui/material';
import { filter, find } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import GroupHeader from './GroupHeader';
import NoProposals from './NoProposals';
import VotingList from './VotingList';

const ActiveVotings = () => {
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const wallet = useWallet();
  const { currentWalletAddress, addressState } = useWalletStore(state => ({
    currentWalletAddress: state.currentWalletAddress,
    addressState: state.addressState,
  }));
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
        (vtype: ProposalType) => vtype.id === proposal.typeId && !vtype.disabled
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
    <Paper sx={{ p: 2 }}>
      <Header headline="Ongoing Proposals" variant="h6">
        <Stack direction="row" alignItems="center" spacing={1}>
          {isConsortiumMember && (
            <FormControlLabel
              control={<Checkbox />}
              onChange={(_event, checked) => setOnlyTodo(checked)}
              label="Show only TODO"
              sx={{
                '& .Mui-checked ': {
                  color: `${theme.palette.text.primary} !important`,
                },
              }}
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
              sx={{
                borderRadius: '12px',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  background: isDark
                    ? '#0F182A'
                    : `${theme.palette.background.default} !important`,
                  borderRadius: '0',
                }}
              >
                <GroupHeader group={group} />
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: 0,
                  borderRadius: 0,
                  '& .MuiList-root': {
                    borderRadius: 0,
                    maxWidth: 'none',
                  },
                }}
              >
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
export default React.memo(ActiveVotings);
