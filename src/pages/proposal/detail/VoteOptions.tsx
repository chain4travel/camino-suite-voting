import React from 'react';
import { filter } from 'lodash';
import { Stack, Typography } from '@mui/material';
import Big from 'big.js';
import { Percentage, Proposal, Vote, VotingOption } from '@/types';
import DistributionBar from '@/components/DistributionBar';
import Tag from '@/components/Tag';
import { Cancel, CheckCircle } from '@mui/icons-material';
import GrantProgramVotingOptions from '../active/GrantProgram/GrantProgramVotingOptions';
import BaseFeeVoting from '../active/BaseFeeVoting';

type VotedOption = VotingOption & Percentage;

interface VoteOptionsProps {
  proposal: Proposal;
  options: VotedOption[];
  result?: Vote;
  votingType?: string;
  baseFee?: number;
}
const VoteOptions = ({
  proposal,
  options,
  votingType,
  result,
  baseFee,
}: VoteOptionsProps) => {
  if (!options) return null;

  if (!result) {
    let item;
    switch (votingType) {
      case 'BASE_FEE':
        item = <BaseFeeVoting data={proposal} />;
        break;
      case 'GRANT':
        item = <GrantProgramVotingOptions data={proposal} showFullText />;
        break;
    }
    return (
      <Stack
        direction={options.length < 3 ? 'row' : 'column'}
        spacing={options.length < 3 ? 1 : 2}
      >
        {item}
      </Stack>
    );
  }

  return (
    <Stack direction={options.length < 3 ? 'row' : 'column'} spacing={1.5}>
      {filter(options, opt => opt.value !== baseFee).map(opt => {
        let label;
        let extraInfo = null;
        let labelDirection = 'column';
        let labelSpacing = 1;
        switch (votingType) {
          case 'BASE_FEE':
            {
              if (baseFee) {
                label = (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >{`Future Base Fee ${opt.value} nCAM`}</Typography>
                );
                labelDirection = 'row';
                labelSpacing = 3;
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
              label = (
                <Typography
                  variant="body2"
                  fontWeight={600}
                >{`Distribution #${opt.option}`}</Typography>
              );
              const values = opt.value as number[];
              extraInfo = (
                <DistributionBar
                  data={values.map(percent => ({ percent }))}
                  variant={opt.option === result.option ? 'vote' : 'default'}
                />
              );
            }
            break;
          default: {
            label = (
              <Stack direction="row" spacing={1}>
                {opt.value ? <CheckCircle /> : <Cancel />}
                <Typography variant="body2" fontWeight={600}>
                  {opt.label}
                </Typography>
              </Stack>
            );
          }
        }
        return (
          <Stack
            key={opt.option}
            padding={2.5}
            border="1px solid"
            borderColor="divider"
            borderRadius={2}
            flex={1}
            spacing={1}
            justifyContent="space-between"
          >
            <Stack
              direction={labelDirection}
              justifyContent="space-between"
              alignItems="center"
              spacing={labelSpacing}
            >
              {label}
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
