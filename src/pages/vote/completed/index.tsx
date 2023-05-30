import React, { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  Container,
  FormControlLabel,
  ListItem,
  RadioGroup,
  Stack,
} from '@mui/material';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Proposal, VotingType } from '@/types';
import { useCompletedVotes } from '@/hooks/useProposals';
import useToast from '@/hooks/toast';
import { DatePicker } from '@mui/x-date-pickers';
import { PersonAdd } from '@mui/icons-material';
import ListItemDuration from '@/components/ListItemDuration';
import RadioButton from '@/components/RadioButton';

const CompletedVotes = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const [votingType, setVotingType] = useState('NEW_MEMBER');
  const { votes, error, isLoading } = useCompletedVotes(votingType);
  const toast = useToast();

  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch votes');
    }
  }, [error]);

  return (
    <Container>
      <Header headline="Completed votes" variant="h4" />
      <Stack spacing="16px">
        <Stack direction="row" spacing="12px">
          <DatePicker sx={{ flex: 1 }} />
          <DatePicker sx={{ flex: 1 }} />
          <Button
            variant="contained"
            color="primary"
            sx={{ minWidth: '100px' }}
          >
            Apply
          </Button>
        </Stack>
        <RadioGroup name="votingType" value={votingType} row>
          {votingTypes.map(vtype => (
            <FormControlLabel
              key={vtype.id}
              label=""
              value={vtype.id}
              sx={{ marginLeft: 0 }}
              control={
                <RadioButton
                  startIcon={vtype.icon}
                  label={vtype.abbr ?? vtype.name}
                  onClick={() => setVotingType(vtype.id)}
                  checked={votingType === vtype.id}
                />
              }
            />
          ))}
        </RadioGroup>
      </Stack>
      {votes.map((vote: Proposal) => (
        <ListItem key={vote.id}>
          <ListItemDuration
            startTimestamp={vote.startDateTime}
            endTimestamp={vote.endDateTime}
          />
        </ListItem>
      ))}
    </Container>
  );
};
export default CompletedVotes;
