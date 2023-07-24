import React, { useMemo } from 'react';
import { Container, Divider, Stack, Typography } from '@mui/material';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { find, countBy, reduce, filter, map } from 'lodash';
import { DateTime } from 'luxon';
import Big from 'big.js';

import { Statistics, Vote, VotingOption, VotingType } from '@/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useProposal } from '@/hooks/useProposals';
import { useBaseFee, useFeeDistribution } from '@/hooks/useRpc';
import ProposalStatus from './ProposalStatus';
import VoteResult from './VoteResult';
import VoteOptions from './VoteOptions';
import OngoingState from './OngoingState';
import CompletedStatistics from './CompletedStatistics';

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
  const { feeDistribution } = useFeeDistribution();

  const votingType = votingTypes.find(vtype => vtype.id === type);
  const { result, statistics, votes, isCompleted } = useMemo(() => {
    if (proposal?.votes) {
      const summary = countBy(proposal.votes, 'option');
      const turnouts = countBy(proposal.votes, v => !!v.option);
      const totalVotes = filter(proposal.votes, v => !!v.option).length;
      const statistics: Statistics = {
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
        isCompleted: proposal.status === 'PASSED',
      };
    }
    return {};
  }, [proposal]);
  const extraInfo = useMemo(() => {
    if (votingType) {
      switch (votingType.id) {
        case 'BASE_FEE':
          return {
            label: votingType?.abbr ?? votingType?.name,
            value: baseFee,
          };
        case 'FEE_DISTRIBUTION':
          return map(feeDistribution, distribution => ({
            label: distribution.label,
            value: distribution.value,
          }));
        default:
      }
    }
  }, [votingType, result, baseFee]);

  return (
    <>
      <Stack padding={2} alignItems="flex-start">
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => navigate(-1)}
          sx={{ py: 1.25, px: 2 }}
        >
          Back to all Proposals
        </Button>
      </Stack>
      <Container>
        <Stack direction="row" spacing={4} alignItems="flex-start">
          <Stack spacing={2}>
            <Stack spacing={2}>
              <Header
                variant="h3"
                headline={
                  votingType?.brief ??
                  votingType?.abbr ??
                  votingType?.name ??
                  ''
                }
                sx={{ margin: 0 }}
              />
              <Typography
                variant="caption"
                color="info.light"
                letterSpacing={2}
              >
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
                proposal={proposal}
                options={proposal?.options.map((opt: VotingOption) => ({
                  ...opt,
                  percent: statistics?.summary[opt.option]?.percent ?? 0,
                }))}
                votingType={votingType?.id}
                result={result}
                baseFee={baseFee}
              />
            </Stack>
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography color="grey.400">{proposal?.description}</Typography>
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
          <ProposalStatus proposal={proposal} extraInfo={extraInfo} />
        </Stack>
      </Container>
      <Divider color="divider" variant="fullWidth" sx={{ my: 4 }} />
      <Container sx={{ paddingBottom: 5 }}>
        {isCompleted ? (
          <CompletedStatistics
            statistics={statistics}
            options={proposal.options}
            votingType={votingType?.id}
            baseFee={baseFee}
            votes={votes}
          />
        ) : (
          <OngoingState />
        )}
      </Container>
    </>
  );
};
export default Detail;
