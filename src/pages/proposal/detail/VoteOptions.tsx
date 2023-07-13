import React from 'react';
import { filter } from 'lodash';
import { Stack, Typography } from '@mui/material';
import Big from 'big.js';
import { Percentage, Vote, VotingOption } from '@/types';
import DistributionBar from '@/components/DistributionBar';
import Tag from '@/components/Tag';

type VotedOption = VotingOption & Percentage;

interface VoteOptionsProps {
  options: VotedOption[];
  result: Vote;
  votingType?: string;
  baseFee?: number;
}
const VoteOptions = ({
  options,
  votingType,
  result,
  baseFee,
}: VoteOptionsProps) => {
  if (!options) return null;

  return (
    <Stack direction={options.length < 3 ? 'row' : 'column'} spacing={1.5}>
      {filter(options, opt => opt.value !== baseFee).map(opt => {
        let label = opt.label;
        let extraInfo = null;
        switch (votingType) {
          case 'BASE_FEE':
            {
              if (baseFee) {
                label = `Future Base Fee ${opt.value} nCAM`;
                const absoluteChange = new Big(opt.value as number).minus(
                  baseFee
                );
                const percentageChange = absoluteChange.times(100).div(baseFee);
                const sign = absoluteChange.s > 0 ? '+' : '';
                extraInfo = (
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Percentage Change
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {sign}
                        {Number(percentageChange.toFixed(2))}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Absolute Change
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {sign}
                        {absoluteChange.toString()} nCAM
                      </Typography>
                    </Stack>
                  </Stack>
                );
              }
            }
            break;
          case 'FEE_DISTRIBUTION':
            {
              label = `Distribution #${opt.option}`;
              const values = opt.value as number[];
              extraInfo = (
                <DistributionBar
                  data={values.map(percent => ({ percent }))}
                  variant={opt.option === result.option ? 'vote' : 'default'}
                />
              );
            }
            break;
          default:
        }
        return (
          <Stack
            key={opt.option}
            padding={2}
            border="1px solid"
            borderColor="divider"
            borderRadius={2}
            flex={1}
            spacing={1}
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={3}
            >
              <Typography variant="body2" fontWeight={600}>
                {label}
              </Typography>
              <Tag
                color={opt.option === result.option ? 'success' : 'default'}
                label={`VOTED ${opt.percent ?? 0}%`}
              />
            </Stack>
            {extraInfo}
          </Stack>
        );
      })}
    </Stack>
  );
};
export default VoteOptions;
