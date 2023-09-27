import React, { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ExpandMore, Refresh } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useUpcomingVotings } from '@/hooks/useProposals';
import Header from '@/components/Header';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@/components/Accordion';
import { ProposalType } from '@/types';
import Paper from '@/components/Paper';
import VotingList from '../active/VotingList';
import GroupHeader from './GroupHeader';
import NoProposals from '../active/NoProposals';

const UpcomingVotings = () => {
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const { proposals, error, refetch } = useUpcomingVotings();
  const groupedProposals = useMemo(() => {
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
  }, [proposals]);
  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Upcoming Proposals" variant="h5">
        <IconButton color="inherit" onClick={() => refetch()}>
          <Refresh />
        </IconButton>
      </Header>
      {Object.entries(groupedProposals ?? {}).length > 0 ? (
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
export default UpcomingVotings;
