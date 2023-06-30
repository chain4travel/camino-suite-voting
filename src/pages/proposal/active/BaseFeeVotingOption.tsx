import React from 'react';
import { Stack, Typography } from '@mui/material';
import type { VotingOption } from '@/types';
import Big from 'big.js';

interface BaseFeeVotingOptionProps {
  option: VotingOption;
  baseFee: number;
}
const BaseFeeVotingOption = ({ option, baseFee }: BaseFeeVotingOptionProps) => {
  if (baseFee <= 0) {
    console.warn('Invalid number of base fee: ', baseFee);
    return null;
  }
  const absoluteChange = new Big(Number(option.value)).minus(baseFee);
  const percentageChange = absoluteChange.times(100).div(baseFee);
  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Percentage Change:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {percentageChange.toFixed(2)}%
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Absolute Change:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {absoluteChange.toString()} nCAM
        </Typography>
      </Stack>
    </>
  );
};
export default BaseFeeVotingOption;
