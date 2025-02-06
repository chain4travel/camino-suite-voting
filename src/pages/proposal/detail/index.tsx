import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import Big from 'big.js';
import { countBy, filter, find, map, reduce } from 'lodash';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';

import Button from '@/components/Button';
import Header from '@/components/Header';
import { countMultipleOptionsBy, sanitizeOptions } from '@/helpers/util';
import { useEligibleCMembers, useProposal } from '@/hooks/useProposals';
import { useBaseFee, useFeeDistribution } from '@/hooks/useRpc';
import useWallet from '@/hooks/useWallet';
import { useWalletStore } from '@/store';
import {
  Proposal,
  ProposalType,
  ProposalTypes,
  Statistics,
  Vote,
  VotingOption,
} from '@/types';
import CompletedStatistics from './CompletedStatistics';
import OngoingState from './OngoingState';
import ProposalStatus from './ProposalStatus';
import VoteResult from './VoteResult';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import { Serialization } from '@c4tplatform/caminojs/dist/utils';
import VotingSection from './VotingSection';
const serialization = Serialization.getInstance();
const Detail = () => {
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const wallet = useWallet();
  const { currentWalletAddress, addressState } = useWalletStore(state => ({
    currentWalletAddress: state.currentWalletAddress,
    addressState: state.addressState,
  }));
  const { isConsortiumMember } = addressState;
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { proposal, refetch } = useProposal(
    id!,
    currentWalletAddress,
    wallet.pchainAPI
  );
  const { baseFee } = useBaseFee();
  const { feeDistribution } = useFeeDistribution();
  const proposalWithEligibles = useEligibleCMembers(proposal as Proposal);
  const proposalType = proposalTypes.find(vtype => vtype.id === Number(type));
  const { result, statistics, votes, isCompleted, isAdminProposal } =
    useMemo(() => {
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
            let option = '';
            let op;
            switch (proposalWithEligibles.type) {
              case ProposalTypes.BaseFee:
                option = `Future Base Fee ${
                  proposalWithEligibles.options.find((opt: VotingOption) =>
                    participant?.votedOptions.includes(opt.option)
                  )?.value
                } nCAM`;
                break;
              case ProposalTypes.General:
                op = proposalWithEligibles.options.find((opt: VotingOption) =>
                  participant?.votedOptions.includes(opt.option)
                )?.option;
                if (op !== undefined) {
                  option = `Option ${Number(op) + 1}`;
                }
                break;
              case ProposalTypes.NewMember:
              case ProposalTypes.ExcludeMember:
                option = proposalWithEligibles.options.find(
                  (opt: VotingOption) =>
                    participant?.votedOptions.includes(opt.option)
                )?.value
                  ? 'Accept'
                  : 'Decline';
                break;
              default:
                console.warn(
                  'Unsupported proposal type: ',
                  proposalWithEligibles.type
                );
            }
            return {
              id: nodeId,
              address: eligible.consortiumMemberAddress,
              votedDateTime: participant?.votedDateTime
                ? DateTime.fromSeconds(participant.votedDateTime).toFormat(
                    'dd.MM.yyyy - hh:mm:ss a'
                  )
                : '-',
              option: participant?.votedOptions
                ? option
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
          isAdminProposal: proposalWithEligibles.isAdminProposal,
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
  const { description, isLoading, error } = useProposalDescription(id);
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Stack spacing={2} sx={{ flex: '1' }}>
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
              {proposalType?.name === ProposalTypes.General && (
                <Typography
                  variant="h6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(
                      proposal.memo
                        ? serialization.decoder(
                            proposal.memo as string,
                            'base64',
                            'base64',
                            'utf8'
                          )
                        : 'No Title Provided',
                      sanitizeOptions
                    ),
                  }}
                ></Typography>
              )}
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
            {isAdminProposal ? (
              <Typography variant="body2">
                Executed by the administrator.
              </Typography>
            ) : (
              <Stack>
                <Header variant="h6" headline="Voting options" />
                <VotingSection
                  proposalWithEligibles={proposalWithEligibles}
                  isConsortiumMember={isConsortiumMember}
                  statistics={statistics}
                  result={result}
                  baseFee={baseFee}
                  refetch={refetch}
                />
              </Stack>
            )}
            {isAdminProposal && (
              <Typography variant="caption">
                This is the record of public actions taken per the Camino
                Network Foundation procedures.
              </Typography>
            )}
            <Stack spacing={1.5} alignItems="flex-start">
              {isLoading ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '20px',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                />
              ) : error ? (
                <Typography variant="caption" color="error">
                  Failed to load description
                </Typography>
              ) : (
                <Typography
                  component="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    textAlign: 'start',
                  }}
                  variant="caption"
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                />
              )}
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
        </Box>
      </Container>
      <Divider color="divider" variant="fullWidth" sx={{ my: 4 }} />
      <Container sx={{ paddingBottom: 5 }}>
        {isAdminProposal ? null : isCompleted ? (
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
export default React.memo(Detail);
