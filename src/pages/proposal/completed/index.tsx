import Button from '@/components/Button';
import CaminoDatePicker from '@/components/DatePicker';
import Header from '@/components/Header';
import Paper from '@/components/Paper';
import RadioButton from '@/components/RadioButton';
import RefreshButton from '@/components/RefreshButton';
import { useCompletedVotes } from '@/hooks/useProposals';
import useToast from '@/hooks/useToast';
import { useVotingTypeStore } from '@/store';
import { Proposal, ProposalType, ProposalTypes } from '@/types';
import {
  Box,
  FormControlLabel,
  List,
  ListItemButton,
  RadioGroup,
  Stack,
  useTheme,
} from '@mui/material';
import { DateTime } from 'luxon';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import NoProposals from '../active/NoProposals';
import TransactionFee from './BaseFee';
import ExcludeMember from './ExcludeMember';
import TransactionFeeDistribution from './FeeDistribution';
import GeneralVote from './GeneralVote';
import GrantProgram from './GrantProgram';
import NewMemberVote from './NewMemberVote';

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
  const { proposals, error, isFetching, refetch } = useCompletedVotes(
    Object.values(ProposalTypes).indexOf(votingType as ProposalTypes),
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
  const theme = useTheme();
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
    <Paper sx={{ p: 2 }}>
      <Header headline="Completed Proposals" variant="h6">
        <RefreshButton loading={isFetching} onRefresh={refetch} />
      </Header>
      <Stack spacing="16px">
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <CaminoDatePicker
            label="Voting from"
            sx={{
              flex: 1,
            }}
            onChange={(datetime: DateTime | null) => {
              startTime.current = datetime;
            }}
          />
          <CaminoDatePicker
            label="Voting till"
            sx={{
              flex: 1,
            }}
            onChange={(datetime: DateTime | null) =>
              (endTime.current = datetime)
            }
          />
          <Button
            variant="contained"
            sx={{ minWidth: '100px' }}
            onClick={() => submitFilter()}
            loading={isFetching}
            loadingPosition="start"
            startIcon={null}
          >
            Apply
          </Button>
        </Box>
        <RadioGroup
          name="votingType"
          value={votingType}
          onChange={handleChange}
          row
          sx={{
            display: 'flex',
            gap: '16px',
            marginLeft: '16px',
          }}
        >
          {proposalTypes
            .filter(pType => !pType.disabled)
            .map(pType => (
              <FormControlLabel
                key={pType.id}
                label={pType.name}
                value={pType.name}
                sx={{
                  margin: '0 !important',
                  color:
                    votingType === pType.name
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  fontSize: '14px',
                  fontFamily: 'Inter',
                }}
                control={
                  <RadioButton
                    label={pType.name}
                    checked={votingType === pType.name}
                    sx={{
                      width: '20px',
                      height: '20px',
                      marginRight: '8px',
                      background: 'none',
                    }}
                  />
                }
              />
            ))}
        </RadioGroup>
      </Stack>
      <List sx={{ maxWidth: 'none', marginTop: '16px' }}>
        {proposals.length > 0 ? (
          proposals.map((proposal, index: number) => {
            return (
              <ListItemButton
                key={proposal.id}
                onClick={() => navigate(`${proposal.typeId}/${proposal.id}`)}
                divider={proposals.length !== index + 1 && true}
                sx={{ px: 0, py: '16px' }}
              >
                {voteItem(proposal as Proposal)}
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
