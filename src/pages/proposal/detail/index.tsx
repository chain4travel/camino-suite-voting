import React, { useMemo } from 'react';
import { Container, Divider, Stack, Typography } from '@mui/material';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { find, countBy, reduce, filter, map } from 'lodash';
import { DateTime } from 'luxon';
import Big from 'big.js';
import sanitizeHtml from 'sanitize-html';

import {
  Statistics,
  Vote,
  VotingOption,
  ProposalType,
  ProposalTypes,
  Proposal,
} from '@/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useEligibleCMembers, useProposal } from '@/hooks/useProposals';
import { useBaseFee, useFeeDistribution } from '@/hooks/useRpc';
import useWallet from '@/hooks/useWallet';
import { countMultipleOptionsBy } from '@/helpers/util';
import ProposalStatus from './ProposalStatus';
import VoteResult from './VoteResult';
import VoteOptions from './VoteOptions';
import OngoingState from './OngoingState';
import CompletedStatistics from './CompletedStatistics';

const Detail = () => {
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const wallet = useWallet();
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { proposal, refetch } = useProposal(id!, wallet.currentWalletAddress);
  const { baseFee } = useBaseFee();
  const { feeDistribution } = useFeeDistribution();
  const proposalWithEligibles = useEligibleCMembers(proposal as Proposal);

  const proposalType = proposalTypes.find(vtype => vtype.id === Number(type));
  const { result, statistics, votes, isCompleted } = useMemo(() => {
    if (proposalWithEligibles?.votes) {
      const summary = countMultipleOptionsBy(
        proposalWithEligibles.votes,
        'votedOptions'
      );
      const eligibleVotes = Object.keys(
        proposalWithEligibles.eligibleCMembers ?? {}
      ).length;
      const turnouts = countBy(
        proposalWithEligibles.votes,
        v => v.votedOptions.length > 0
      );
      if (proposalWithEligibles.votes.length < eligibleVotes) {
        turnouts.false =
          (turnouts.false ?? 0) +
          eligibleVotes -
          proposalWithEligibles.votes.length;
      }
      const totalVotes = filter(
        proposalWithEligibles.votes,
        v => v.votedOptions.length > 0
      ).length;
      const statistics: Statistics = {
        eligibleVotes,
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
              percent: eligibleVotes
                ? new Big(count).div(eligibleVotes).times(100).toFixed(2)
                : 0,
            },
          }),
          {}
        ),
      };
      const votes = map(
        proposalWithEligibles.eligibleCMembers,
        (eligible: any, nodeId: string) => {
          const participant = find(
            proposalWithEligibles.votes,
            (v: Vote) => v.voterAddr === eligible.consortiumMemberAddress
          );
          return {
            id: nodeId,
            address: eligible.consortiumMemberAddress,
            votedDateTime: participant?.votedDateTime
              ? DateTime.fromSeconds(participant.votedDateTime).toFormat(
                  'dd.MM.yyyy - hh:mm:ss a'
                )
              : '-',
            option: participant?.votedOptions
              ? `Future Base Fee ${
                  proposalWithEligibles.options.find((opt: VotingOption) =>
                    participant.votedOptions.includes(opt.option)
                  )?.value
                } nCAM`
              : 'Did not participate',
            disabled: !participant?.votedOptions,
          };
        }
      );
      return {
        result: find(
          proposalWithEligibles.options,
          opt => opt.option === proposalWithEligibles.outcome
        ),
        statistics,
        votes,
        isCompleted: proposalWithEligibles.isCompleted,
      };
    }
    return {};
  }, [proposalWithEligibles]);
  const extraInfo = useMemo(() => {
    if (proposalType) {
      switch (proposalType.name) {
        case ProposalTypes.BaseFee:
          return {
            label: proposalType?.abbr ?? proposalType?.name,
            value: baseFee,
          };
        case ProposalTypes.FeeDistribution:
          return map(feeDistribution, distribution => ({
            label: distribution.label,
            value: distribution.value,
          }));
        default:
      }
    }
  }, [proposalType, result, baseFee]);

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
        <Stack
          direction="row"
          spacing={4}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Stack spacing={2}>
            <Stack spacing={2}>
              <Header
                variant="h3"
                headline={
                  proposalType?.brief ??
                  proposalType?.name ??
                  proposalType?.abbr ??
                  ''
                }
                sx={{ margin: 0 }}
              />
              <Typography
                variant="caption"
                color="info.light"
                letterSpacing={2}
              >
                {DateTime.fromSeconds(
                  proposalWithEligibles?.endTimestamp ?? 0
                ).toFormat('dd.MM.yyyy hh:mm:ss a')}
              </Typography>
              <VoteResult
                result={{
                  ...result,
                  baseFee,
                  target: proposalWithEligibles?.target,
                  status: proposalWithEligibles.status,
                }}
                proposalType={proposalType?.name}
              />
            </Stack>
            <Stack>
              <Header variant="h6" headline="Voting options" />
              <VoteOptions
                proposal={proposalWithEligibles}
                isConsortiumMember={wallet.isConsortiumMember}
                options={proposalWithEligibles?.options?.map(
                  (opt: VotingOption) => ({
                    ...opt,
                    label:
                      opt.value === true
                        ? 'Accept'
                        : opt.value === false
                        ? 'Decline'
                        : opt.label,
                    percent: statistics?.summary[opt.option]?.percent ?? 0,
                  })
                )}
                result={result}
                baseFee={baseFee}
                refresh={refetch}
              />
            </Stack>
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography
                component="p"
                color="grey.400"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    proposalWithEligibles?.description ?? ''
                  ),
                }}
              />
              {proposalWithEligibles?.forumLink && (
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
            proposal={proposalWithEligibles}
            extraInfo={extraInfo}
            isLoggedIn={!!wallet?.signer}
          />
        </Stack>
      </Container>
      <Divider color="divider" variant="fullWidth" sx={{ my: 4 }} />
      <Container sx={{ paddingBottom: 5 }}>
        {isCompleted ? (
          <CompletedStatistics
            statistics={statistics}
            options={proposalWithEligibles.options}
            proposalType={proposalType?.name}
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
