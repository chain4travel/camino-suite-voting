import React, { useEffect, useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import {
  Paper,
  FormControlLabel,
  List,
  ListItemButton,
  RadioGroup,
  Stack,
} from '@mui/material';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Proposal, VotingType } from '@/types';
import { useCompletedVotes } from '@/hooks/useProposals';
import useToast from '@/hooks/useToast';
import { DatePicker } from '@mui/x-date-pickers';
import ListItemStatus from '@/components/ListItemStatus';
import RadioButton from '@/components/RadioButton';
import NewMemberVote from './NewMemberVote';
import ExcludeMember from './ExcludeMember';
import TransactionFee from './BaseFee';
import TransactionFeeDistribution from './FeeDistribution';
import { ArrowForwardIos } from '@mui/icons-material';

const CompletedVotes = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const [votingType, setVotingType] = useState('NEW_MEMBER');
  const { votes, error, isLoading } = useCompletedVotes(votingType);
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch votes');
    }
  }, [error]);

  const { voteItem } = useMemo(() => {
    const selectedVotingType = votingTypes.find(
      vtype => vtype.id === votingType
    );
    const voteTypeName = selectedVotingType?.abbr ?? selectedVotingType?.name;
    let voteItem = (_data: Proposal): JSX.Element | null => null;
    switch (votingType) {
      case 'NEW_MEMBER':
        voteItem = (data: Proposal) => (
          <NewMemberVote data={data} voteTypeName={voteTypeName} />
        );
        break;
      case 'EXCLUDE_MEMBER':
        voteItem = (data: Proposal) => (
          <ExcludeMember data={data} voteTypeName={voteTypeName} />
        );
        break;
      case 'BASE_FEE':
        voteItem = (data: Proposal) => <TransactionFee data={data} />;
        break;
      case 'FEE_DISTRIBUTION':
        voteItem = (data: Proposal) => (
          <TransactionFeeDistribution data={data} />
        );
        break;
      default:
        console.warn(`Unsupport voting type ${votingType}`);
    }
    return {
      voteItem,
    };
  }, [votingType]);

  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Completed Proposals" variant="h5" />
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
      <List>
        {votes.map((vote: Proposal) => {
          return (
            <ListItemButton
              key={vote.id}
              onClick={() => navigate(`${vote.type}/${vote.id}`)}
            >
              <ListItemStatus
                startTimestamp={vote.startDateTime}
                endTimestamp={vote.endDateTime}
              />
              {voteItem(vote)}
              <ArrowForwardIos />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
};
export default CompletedVotes;
