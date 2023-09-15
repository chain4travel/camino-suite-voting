import { Stack, Typography } from '@mui/material';
import React from 'react';
import { map } from 'lodash';
import Big from 'big.js';
import DistributionBar from '@/components/DistributionBar';
import {
  Percentage,
  ProposalTypes,
  Statistics,
  VoteData,
  VotingOption,
} from '@/types';
import VoteResultTable from './VoteResultTable';

interface CompletedStatisticsProps {
  statistics?: Statistics;
  options?: VotingOption[];
  proposalType?: string;
  baseFee?: string | number;
  votes?: VoteData[];
}
const CompletedStatistics = ({
  statistics,
  options,
  proposalType,
  baseFee,
  votes,
}: CompletedStatisticsProps) => {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h5">Proposal Distribution</Typography>
        <Typography variant="body2" color="text.secondary">
          Cast votes: {statistics?.totalVotes}
        </Typography>
        <DistributionBar
          variant="proposal"
          data={options?.map((option: VotingOption) => ({
            ...option,
            percent: statistics?.summary?.[option.option]?.percent ?? 0,
          }))}
          renderContent={(option: VotingOption & Percentage) => {
            let extraInfo = null;
            let label = (
              <Typography color="grey.50" variant="caption">
                {option.label}
              </Typography>
            );
            switch (proposalType) {
              case ProposalTypes.BaseFee:
                {
                  const absoluteChange = new Big(option.value as number).minus(
                    baseFee!
                  );
                  const percentageChange =
                    Number(baseFee) > 0
                      ? new Big(absoluteChange)
                          .times(100)
                          .div(baseFee!)
                          .toFixed(2)
                      : 0;
                  const sign = absoluteChange.s > 0 ? '+' : '';
                  extraInfo = (
                    <>
                      <Typography
                        color="text.primary"
                        variant="caption"
                        component="p"
                      >
                        {option.value} nCAM
                      </Typography>
                      <Typography
                        color="text.primary"
                        variant="caption"
                        component="p"
                      >
                        {sign} {absoluteChange.toString()} nCAM
                      </Typography>
                      <Typography
                        color="text.primary"
                        variant="caption"
                        component="p"
                      >
                        {sign} {Number(percentageChange)}%
                      </Typography>
                    </>
                  );
                }
                break;
              case ProposalTypes.FeeDistribution:
                label = (
                  <Typography color="text.primary" variant="body2">
                    {`Distribution #${option.option}`}
                  </Typography>
                );
                break;
            }
            return (
              <>
                {label}
                <Typography color="text.primary" fontWeight={700}>
                  {statistics?.summary?.[option.option]?.percent ?? 0}% /{' '}
                  {statistics?.summary?.[option.option]?.count ?? 0}
                </Typography>
                {extraInfo}
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
              percent: t.percent,
            })
          )}
          renderContent={(
            turnout: Percentage & {
              isParticipated: 'true' | 'false';
              count: number;
            }
          ) => (
            <>
              <Typography color="grey.900" variant="caption">
                {turnout.isParticipated === 'true'
                  ? 'Participated'
                  : 'Did not participate'}
              </Typography>
              <Typography color="grey.900" fontWeight={700}>
                {turnout.percent}% / {turnout.count}
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
  );
};
export default CompletedStatistics;
