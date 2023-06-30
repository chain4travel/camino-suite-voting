import React, { useMemo } from 'react';
import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { find, countBy, reduce, filter, map } from 'lodash';
import { DateTime } from 'luxon';
import Big from 'big.js';

import { Percentage, Vote, VotingOption, VotingType } from '@/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useProposal } from '@/hooks/useProposals';
import { useBaseFee } from '@/hooks/useRpc';
import DistributionBar from '@/components/DistributionBar';
import ProposalStatus from './ProposalStatus';
import VoteResultTable from './VoteResultTable';
import VoteResult from './VoteResult';
import { toPastTense } from '@/helpers/string';
import VoteOptions from './VoteOptions';

const Detail = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const { type, id } = useParams();
  const navigate = useNavigate();
  const {
    proposal,
    error: _error,
    isLoading: _isLoading,
  } = useProposal(type!, id!);
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
          votedDateTime: v.votedDateTime
            ? DateTime.fromSeconds(v.votedDateTime).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )
            : '-',
          option: v.option
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
                headline={
                  votingType?.brief ??
                  votingType?.abbr ??
                  votingType?.name ??
                  ''
                }
                sx={{ marginBottom: 0 }}
              />
              <Typography variant="h5" color="text.secondary">
                {DateTime.fromSeconds(proposal?.endDateTime ?? 0).toFormat(
                  'dd.MM.yyyy hh:mm:ss a'
                )}
              </Typography>
              <VoteResult
                result={{ ...result, baseFee, target: proposal?.target }}
                votingType={votingType?.id}
              />
            </Stack>
            <Stack>
              <Header variant="h6" headline="Vote options" />
              <VoteOptions
                options={proposal?.options.map(opt => ({
                  ...opt,
                  percent: statistics?.summary[opt.option].percent,
                }))}
                votingType={votingType?.id}
                result={result}
                baseFee={baseFee}
              />
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
              votingType?.id === 'BASE_FEE' && (
                <>
                  <Typography variant="h5">{`${
                    votingType?.abbr ?? votingType?.name
                  } prior to proposal`}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {result?.value} nCAM
                  </Typography>
                </>
              )
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
                let extraInfo = null;
                if (votingType?.id === 'BASE_FEE') {
                  const absoluteChange = new Big(option.value)
                    .minus(baseFee)
                    .toString();
                  const percentageChange = new Big(absoluteChange)
                    .times(100)
                    .div(baseFee)
                    .toFixed(2);
                  extraInfo = (
                    <>
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
                }
                return (
                  <>
                    {votingType?.id !== 'BASE_FEE' && (
                      <Typography color="text.primary" variant="body2">
                        {toPastTense(option.label)}
                      </Typography>
                    )}
                    <Typography color="text.primary" fontWeight={700}>
                      {statistics.summary?.[option.option]?.count} /{' '}
                      {statistics.summary?.[option.option]?.percent}%
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
                (t: Percentage, key: 'true' | 'false') => ({
                  ...t,
                  isParticipated: key,
                  percentage: t.percent,
                })
              )}
              renderContent={(
                turnout: Percentage & {
                  isParticipated: 'true' | 'false';
                  count: number;
                }
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
            <VoteResultTable votes={votes} />
          </Stack>
        </Stack>
      </Container>
    </>
  );
};
export default Detail;
