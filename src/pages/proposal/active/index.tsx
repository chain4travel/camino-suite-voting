import React, { useMemo } from 'react';
import { NavLink, useLoaderData } from 'react-router-dom';
import { Container } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useActiveVotings } from '@/hooks/useProposals';
import Header from '@/components/Header';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@/components/Accordion';
import Button from '@/components/Button';
import { VotingType } from '@/types';
import VotingList from './VotingList';
import GroupHeader from './GroupHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useDialogStore } from '@/store';

const ActiveVotings = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const { proposals, error, isLoading } = useActiveVotings();
  const { option: dialogOption } = useDialogStore(state => ({
    option: state.option,
  }));
  const groupedProposals = useMemo(() => {
    return proposals.reduce((result: any, proposal: any) => {
      const votingType = votingTypes.find(
        (vtype: VotingType) => vtype.id === proposal.type
      );
      if (votingType) {
        const currentData = result[votingType.id]
          ? result[votingType.id].data
          : [];
        return {
          ...result,
          [votingType.id]: {
            type: votingType.id,
            name: votingType.name,
            icon: votingType.icon,
            data: [...currentData, proposal],
          },
        };
      } else {
        console.warn(
          `unsupported voting type(${proposal.type}) of proposal(${proposal.id})`
        );
      }
      return result;
    }, {});
  }, [proposals]);
  return (
    <Container>
      <Header headline="Ongoing Proposals" variant="h4">
        <NavLink to="/proposal/create">
          <Button variant="contained" color="primary">
            Create new
          </Button>
        </NavLink>
      </Header>
      {Object.entries(groupedProposals ?? {}).map(
        ([votingType, group]: [string, any]) => (
          <Accordion key={votingType} defaultExpanded={group.data.length > 0}>
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
      )}
      <ConfirmDialog {...dialogOption} />
    </Container>
  );
};
export default ActiveVotings;
