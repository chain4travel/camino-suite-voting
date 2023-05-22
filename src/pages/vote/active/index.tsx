import React, { useMemo } from 'react';
import { NavLink, useLoaderData } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useActiveVotings } from '@/hooks/useProposals';
import Header from '@/components/Header';
import Votings from './Votings';
import GroupHeader from './GroupHeader';

type VotingType = {
  id: string;
  name: string;
};
const ActiveVotings = () => {
  const { palette } = useTheme();
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const { proposals, isError, isLoading } = useActiveVotings();
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
      <Header headline="Active Votings">
        <NavLink to="/vote/create">
          <Button variant="contained" color="primary">
            Create Vote
          </Button>
        </NavLink>
      </Header>
      {Object.entries(groupedProposals ?? {}).map(
        ([votingType, group]: [string, any]) => (
          <Accordion key={votingType} defaultExpanded={group.data.length > 0}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor:
                  palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              }}
            >
              <GroupHeader group={group} />
            </AccordionSummary>
            <AccordionDetails style={{ padding: 0 }}>
              <Votings data={group} />
            </AccordionDetails>
          </Accordion>
        )
      )}
    </Container>
  );
};
export default ActiveVotings;
