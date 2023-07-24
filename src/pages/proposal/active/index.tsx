import React, { useMemo, useState } from 'react';
import { NavLink, useLoaderData } from 'react-router-dom';
import { FormControlLabel, Stack } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { filter } from 'lodash';
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
import Checkbox from '@/components/Checkbox';
import Paper from '@/components/Paper';

const ActiveVotings = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const [onlyTodo, setOnlyTodo] = useState(false);
  const { proposals, error, isLoading } = useActiveVotings();
  const { option: dialogOption } = useDialogStore(state => ({
    option: state.option,
  }));
  const groupedProposals = useMemo(() => {
    let filteredProposals = proposals;
    if (onlyTodo) {
      filteredProposals = filter(
        proposals,
        proposal => !proposal.voted || proposal.voted.length === 0
      );
    }
    return filteredProposals.reduce((result: any, proposal: any) => {
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
  }, [proposals, onlyTodo]);
  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Ongoing Proposals" variant="h5">
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControlLabel
            control={<Checkbox />}
            onChange={(_event, checked) => setOnlyTodo(checked)}
            label="Show only TODO"
          />
          <NavLink to="/proposal/create">
            <Button variant="contained" color="primary">
              Create new
            </Button>
          </NavLink>
        </Stack>
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
    </Paper>
  );
};
export default ActiveVotings;
