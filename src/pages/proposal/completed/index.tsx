import React, { useEffect, useMemo } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import {
  FormControlLabel,
  List,
  ListItemButton,
  RadioGroup,
  Stack,
} from '@mui/material';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Proposal, ProposalType, ProposalTypes } from '@/types';
import { useCompletedVotes } from '@/hooks/useProposals';
import useToast from '@/hooks/useToast';
import { DatePicker } from '@mui/x-date-pickers';
import ListItemStatus from '@/components/ListItemStatus';
import RadioButton from '@/components/RadioButton';
import NewMemberVote from './NewMemberVote';
import ExcludeMember from './ExcludeMember';
import GeneralVote from './GeneralVote';
import GrantProgram from './GrantProgram';
import TransactionFee from './BaseFee';
import TransactionFeeDistribution from './FeeDistribution';
import { useVotingTypeStore } from '@/store';
import Paper from '@/components/Paper';

const CompletedVotes = () => {
  const { selectVotingType: votingType, setSelectVotingType } =
    useVotingTypeStore();
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const { votes, error, isLoading } = useCompletedVotes(
    Object.values(ProposalTypes).indexOf(votingType)
  );
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch votes');
    }
  }, [error]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectVotingType((event.target as HTMLInputElement).value);
  };

  const { voteItem } = useMemo(() => {
    const selectedVotingType = proposalTypes.find(
      vtype => vtype.name === votingType
    );
    const voteTypeName = selectedVotingType?.abbr ?? selectedVotingType?.name;
    let voteItem = (_data: Proposal): JSX.Element | null => null;
    switch (votingType) {
      case ProposalTypes.General:
        voteItem = (data: Proposal) => (
          <GeneralVote data={data} voteTypeName={voteTypeName} />
        );
        break;
      case ProposalTypes.NewMember:
        voteItem = (data: Proposal) => (
          <NewMemberVote data={data} voteTypeName={voteTypeName} />
        );
        break;
      case ProposalTypes.GrantProgram:
        voteItem = (data: Proposal) => (
          <GrantProgram data={data} voteTypeName={voteTypeName} />
        );
        break;
      case ProposalTypes.ExcludeMember:
        voteItem = (data: Proposal) => (
          <ExcludeMember data={data} voteTypeName={voteTypeName} />
        );
        break;
      case ProposalTypes.BaseFee:
        voteItem = (data: Proposal) => <TransactionFee data={data} />;
        break;
      case ProposalTypes.FeeDistribution:
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
        <RadioGroup
          name="votingType"
          value={votingType}
          onChange={handleChange}
          row
        >
          {proposalTypes
            .filter(pType => pType.id === 0)
            .map(pType => (
              <FormControlLabel
                key={pType.id}
                label={pType.abbr ?? pType.name}
                value={pType.id}
                sx={{ marginLeft: 0 }}
                control={
                  <RadioButton
                    label={pType.abbr ?? pType.name}
                    checked={votingType === pType.name}
                  />
                }
              />
            ))}
        </RadioGroup>
      </Stack>
      <List>
        {votes.map((vote: Proposal, index: number) => {
          return (
            <ListItemButton
              key={vote.id}
              onClick={() => navigate(`${vote.type}/${vote.id}`)}
              divider={votes.length !== index + 1 && true}
              sx={{ px: 0 }}
            >
              <Stack width="100%">
                <Stack>
                  {voteItem(vote)}
                  <ListItemStatus
                    startTimestamp={vote.startTimestamp}
                    endTimestamp={vote.endTimestamp}
                  />
                </Stack>
                <Stack></Stack>
              </Stack>
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
};
export default CompletedVotes;
