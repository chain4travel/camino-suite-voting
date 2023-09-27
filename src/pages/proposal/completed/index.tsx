import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import {
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  RadioGroup,
  Stack,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
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
import { DateTime } from 'luxon';
import NoProposals from '../active/NoProposals';

const CompletedVotes = () => {
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const { selectVotingType: votingType, setSelectVotingType } =
    useVotingTypeStore();
  const startTime = useRef<DateTime | null>(null);
  const endTime = useRef<DateTime | null>(null);
  const [filter, setFilter] = useState<{
    startTime?: DateTime | null;
    endTime?: DateTime | null;
  }>({ startTime: null, endTime: null });
  const { proposals, error, isLoading, refetch } = useCompletedVotes(
    Object.values(ProposalTypes).indexOf(votingType),
    filter.startTime?.toUTC().toISO(),
    filter.endTime?.toUTC().toISO()
  );
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch proposals');
    }
  }, [error]);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectVotingType((event.target as HTMLInputElement).value);
  };

  const submitFilter = () => {
    setFilter({
      startTime: startTime.current?.startOf('day'),
      endTime: endTime.current?.endOf('day'),
    });
  };

  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Completed Proposals" variant="h5">
        <IconButton color="inherit" onClick={() => refetch()}>
          <Refresh />
        </IconButton>
      </Header>
      <Stack spacing="16px">
        <Stack direction="row" spacing="12px">
          <DatePicker
            label="From"
            sx={{ flex: 1 }}
            onChange={(datetime: DateTime | null) =>
              (startTime.current = datetime)
            }
          />
          <DatePicker
            label="To"
            sx={{ flex: 1 }}
            onChange={(datetime: DateTime | null) =>
              (endTime.current = datetime)
            }
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ minWidth: '100px' }}
            onClick={() => submitFilter()}
            loading={isLoading}
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
            .filter(pType => !pType.disabled)
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
        {proposals.length > 0 ? (
          proposals.map((proposal, index: number) => {
            return (
              <ListItemButton
                key={proposal.id}
                onClick={() => navigate(`${proposal.typeId}/${proposal.id}`)}
                divider={proposals.length !== index + 1 && true}
                sx={{ px: 0, py: 2 }}
              >
                <Stack width="100%">
                  <Stack>
                    {voteItem(proposal as Proposal)}
                    <ListItemStatus
                      startTimestamp={proposal.startTimestamp}
                      endTimestamp={proposal.endTimestamp}
                    />
                  </Stack>
                  <Stack></Stack>
                </Stack>
              </ListItemButton>
            );
          })
        ) : (
          <NoProposals type="completed" />
        )}
      </List>
    </Paper>
  );
};
export default CompletedVotes;
