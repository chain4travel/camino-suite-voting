import React, { forwardRef, useMemo } from 'react';
import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { find, countBy, reduce, filter, map } from 'lodash';
import { DateTime } from 'luxon';
import Big from 'big.js';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import { Circle } from '@mui/icons-material';

import { Percentage, Vote, VotingOption, VotingType } from '@/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useProposal } from '@/hooks/useProposals';
import { useBaseFee } from '@/hooks/useRpc';
import DistributionBar from '@/components/DistributionBar';
import ProposalStatus from './ProposalStatus';

const TablePaper = styled(Paper)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

interface VoteData {
  id: number;
  address: string;
  votedTime: string;
  votedOption: string;
}
const columns = [
  { dataKey: 'address', label: 'ADDRESS / NAME', width: '100%' },
  { dataKey: 'votedTime', label: 'TIME OF VOTE', width: 260 },
  { dataKey: 'votedOption', label: 'VOTE FOR', width: 260 },
];
const VirtuosoTableComponents: TableComponents<VoteData> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={TablePaper} {...props} ref={ref} />
  )),
  Table: props => (
    <Table
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
    />
  ),
  TableHead,
  TableRow: props => <TableRow {...props} />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

const Detail = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const { type, id } = useParams();
  const navigate = useNavigate();
  const {
    proposal,
    error: _error,
    isLoading: _isLoading,
  } = useProposal(type, id);
  const { baseFee } = useBaseFee();

  const votingType = votingTypes.find(vtype => vtype.id === type);
  const { result, statistics, votes } = useMemo(() => {
    if (proposal) {
      const summary = countBy(proposal.votes, 'option');
      const turnouts = countBy(proposal.votes, v => !!v.option);
      const totalVotes = filter(proposal.votes, v => !!v.option).length;
      const statistics = {
        eligibleVotes: proposal.votes.length,
        totalVotes,
        summary: reduce(
          summary,
          (acc, count, option) => ({
            ...acc,
            [option]: {
              count,
              percent: new Big(count).div(totalVotes).times(100).toFixed(2),
            },
          }),
          {}
        ),
        turnouts: reduce(
          turnouts,
          (acc, count, option) => ({
            ...acc,
            [option]: {
              count,
              percent: new Big(count)
                .div(proposal.votes.length)
                .times(100)
                .toFixed(2),
            },
          }),
          {}
        ),
      };
      const votes = proposal.votes.map((v: Vote, idx: number) => {
        return {
          id: idx,
          address: v.address,
          votedTime: v.votedDateTime
            ? DateTime.fromSeconds(v.votedDateTime).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )
            : '-',
          votedOption: v.option
            ? `Future Base Fee ${
                proposal.options.find(
                  (opt: VotingOption) => opt.option === v.option
                )?.value
              } nCAM`
            : 'Did not participate',
          disabled: !v.option,
        };
      });
      return {
        result: find(
          proposal.options,
          opt => opt.option === proposal.result?.[0]?.option
        ),
        statistics,
        votes,
      };
    }
    return {};
  }, [proposal]);

  return (
    <>
      <Stack paddingY={2} alignItems="flex-start">
        <Button variant="text" color="inherit" onClick={() => navigate(-1)}>
          Back to all Proposals
        </Button>
      </Stack>
      <Container sx={{ paddingBottom: 5 }}>
        <Stack direction="row" spacing={15} alignItems="flex-start">
          <Stack spacing={5}>
            <Stack spacing={1}>
              <Header
                variant="h2"
                headline={votingType?.abbr ?? votingType?.name ?? ''}
                sx={{ marginBottom: 0 }}
              />
              <Typography variant="h5" color="text.secondary">
                {DateTime.fromSeconds(proposal?.endDateTime ?? 0).toFormat(
                  'dd.MM.yyyy hh:mm:ss a'
                )}
              </Typography>
              <Box
                padding={2}
                border="1px solid"
                borderColor="accent.main"
                borderRadius={1}
              >
                <Typography variant="h6">Vote Result</Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    New Base Fee
                  </Typography>
                  <Typography color="text.secondary">
                    {result?.value} nCAM
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Percentage Change
                  </Typography>
                  <Typography color="text.secondary">
                    {((result?.value - baseFee) * 100) / baseFee} %
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Absolute Change
                  </Typography>
                  <Typography color="text.secondary">
                    {result?.value - baseFee} nCAM
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Stack>
              <Header variant="h6" headline="Vote options" />
              <Stack direction="row" spacing={1.5}>
                {filter(proposal?.options, opt => opt.value !== baseFee).map(
                  opt => (
                    <Box
                      key={opt.option}
                      padding={2}
                      border="1px solid"
                      borderColor="divider"
                      borderRadius={2}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={3}
                      >
                        <Typography variant="body2">
                          Future Base Fee {opt.value} nCAM
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            opt.option === result.option
                              ? 'accent.main'
                              : 'text.secondary'
                          }
                          textAlign="right"
                        >
                          VOTED {statistics.summary[opt.option]?.percent ?? 0}%
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Percentage Change
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {((opt.value - baseFee) * 100) / baseFee}%
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Absolute Change
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opt.value - baseFee} nCAM
                        </Typography>
                      </Stack>
                    </Box>
                  )
                )}
              </Stack>
            </Stack>
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography color="text.secondary">
                {proposal?.description}
              </Typography>
              {proposal?.forumLink && (
                <Button
                  sx={{
                    backgroundColor: '#242729',
                    color: 'white',
                    paddingX: 2,
                    paddingY: 1,
                  }}
                >
                  OPEN FORUM
                </Button>
              )}
            </Stack>
          </Stack>
          <ProposalStatus
            proposal={proposal}
            extraInfo={
              <>
                <Typography variant="h5">{`${
                  votingType?.abbr ?? votingType?.name
                } prior to proposal`}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {result?.value} nCAM
                </Typography>
              </>
            }
          />
        </Stack>
        <Divider
          color="divider"
          variant="fullWidth"
          sx={{ marginTop: 5, marginBottom: 3 }}
        />
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h5">Proposal Distribution</Typography>
            <Typography variant="body2" color="text.secondary">
              Cast votes: {statistics?.totalVotes}
            </Typography>
            <DistributionBar
              data={proposal?.options.map((option: VotingOption) => ({
                ...option,
                percentage: statistics.summary?.[option.option]?.percent,
              }))}
              renderContent={(option: VotingOption & Percentage) => {
                const absoluteChange = new Big(option.value)
                  .minus(baseFee)
                  .toString();
                const percentageChange = new Big(absoluteChange)
                  .times(100)
                  .div(baseFee)
                  .toFixed(2);
                return (
                  <>
                    <Typography color="text.primary" fontWeight={700}>
                      {statistics.summary?.[option.option]?.count} /{' '}
                      {statistics.summary?.[option.option]?.percent}%
                    </Typography>
                    <Typography color="text.primary" variant="body2">
                      {option.value} nCAM
                    </Typography>
                    <Typography color="text.primary" variant="body2">
                      {absoluteChange} nCAM
                    </Typography>
                    <Typography color="text.primary" variant="body2">
                      {percentageChange}%
                    </Typography>
                  </>
                );
              }}
            />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h5">Proposal Turnouts</Typography>
            <Typography variant="body2" color="text.secondary">
              Eligible votes: {statistics?.eligibleVotes}
            </Typography>
            <DistributionBar
              variant="turnouts"
              data={map(
                statistics?.turnouts,
                (t: Percentage, key: boolean) => ({
                  ...t,
                  isParticipated: key,
                  percentage: t.percent,
                })
              )}
              renderContent={(
                turnout: Percentage & { isParticipated: boolean; count: number }
              ) => (
                <>
                  <Typography color="grey.900" variant="body2">
                    {turnout.isParticipated === 'true'
                      ? 'Participated'
                      : 'Did not participate'}
                  </Typography>
                  <Typography color="grey.900" fontWeight={700}>
                    {turnout.count} / {turnout.percent}%
                  </Typography>
                </>
              )}
            />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h5">Vote result per validator</Typography>
            <Typography variant="body2" color="text.secondary">
              Eligible validators: {statistics?.eligibleVotes}
            </Typography>
            <TablePaper sx={{ height: 400, width: '100%' }}>
              <TableVirtuoso
                data={votes}
                components={VirtuosoTableComponents}
                fixedHeaderContent={() => (
                  <TableRow>
                    {columns.map((column, idx) => (
                      <TableCell
                        key={column.dataKey}
                        variant="head"
                        align="left"
                        style={{ width: column.width }}
                        sx={{
                          backgroundColor: 'grey.800',
                          borderColor: 'divider',
                          color: 'grey.500',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {idx === 0 ? <Circle /> : null}
                          <Typography>{column.label}</Typography>
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                )}
                itemContent={(_index: number, row: VoteData) => {
                  return (
                    <>
                      {columns.map(column => (
                        <TableCell
                          key={column.dataKey}
                          align="left"
                          sx={{ borderColor: 'divider' }}
                        >
                          {row[column.dataKey]}
                        </TableCell>
                      ))}
                    </>
                  );
                }}
              />
            </TablePaper>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};
export default Detail;
