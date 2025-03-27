import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@/components/Accordion';
import Header from '@/components/Header';
import Paper from '@/components/Paper';
import RefreshButton from '@/components/RefreshButton';
import { useUpcomingVotings } from '@/hooks/useProposals';
import { ProposalType } from '@/types';
import { ExpandMore } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import NoProposals from '../active/NoProposals';
import VotingList from '../active/VotingList';
import GroupHeader from './GroupHeader';
import { useTheme } from '@mui/material';
import { Alert } from '@mui/material';
import { useNetworkStore } from '@/store';

const UpcomingVotings = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const { proposals, error, refetch, isFetching } = useUpcomingVotings();
  const { currentNetwork } = useNetworkStore(state => ({
    currentNetwork: state.currentNetwork,
  }));
  const groupedProposals = useMemo(() => {
    if (error) return {};
    return proposals.reduce((result: any, proposal: any) => {
      const proposalType = proposalTypes.find(
        (vtype: ProposalType) => vtype.id === proposal.typeId
      );
      if (proposalType) {
        const currentData = result[proposalType.id]
          ? result[proposalType.id].data
          : [];
        return {
          ...result,
          [proposalType.id]: {
            type: proposal.type,
            typeId: proposal.typeId,
            name: proposalType.name,
            icon: proposalType.icon,
            data: [...currentData, proposal],
          },
        };
      } else {
        console.warn(
          `unsupported proposal type(${proposal.type}) of proposal(${proposal.id})`
        );
      }
      return result;
    }, {});
  }, [proposals, currentNetwork, error]);
  return (
    <Paper sx={{ p: 2 }}>
      <Header headline="Upcoming Proposals" variant="h6">
        <RefreshButton loading={isFetching} onRefresh={refetch} />
      </Header>
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {(error as Error)?.message || 'An error occurred'}. Please try again.
        </Alert>
      ) : null}
      {!isFetching && Object.entries(groupedProposals ?? {}).length > 0 ? (
        Object.entries(groupedProposals ?? {}).map(
          ([proposalType, group]: [string, any]) => (
            <Accordion
              key={proposalType + currentNetwork}
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
                  border: 0,
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
                <VotingList data={group} />
              </AccordionDetails>
            </Accordion>
          )
        )
      ) : (
        <NoProposals type="upcoming" />
      )}
    </Paper>
  );
};
export default React.memo(UpcomingVotings);
