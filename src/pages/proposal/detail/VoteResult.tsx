import { VotingOption } from '@/types';
import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import Big from 'big.js';
import Paragraph from '@/components/Paragraph';
import DistributionBar, {
  VOTE_DISTRIBUTION_COLORS,
} from '@/components/DistributionBar';
import { Circle } from '@mui/icons-material';

interface VoteResultProps {
  result: VotingOption & { baseFee?: number; target?: string };
  votingType?: string;
}
const VoteResult = ({ result, votingType }: VoteResultProps) => {
  const content = useMemo(() => {
    if (result.value) {
      switch (votingType) {
        case 'BASE_FEE': {
          if (!result.baseFee) {
            console.error('type BASE_FEE must provide current baseFee');
            return null;
          }
          const absoluteChange = new Big(result.value as number).minus(
            result.baseFee
          );
          const percentageChange = absoluteChange
            .times(100)
            .div(result.baseFee);
          const sign = absoluteChange.s > 0 ? '+' : '';
          return (
            <Paragraph spacing={1.5}>
              <Typography variant="h6">Vote Result</Typography>
              <Paragraph>
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
                    {sign} {Number(percentageChange.toFixed(2))}%
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Absolute Change
                  </Typography>
                  <Typography color="text.secondary">
                    {sign} {absoluteChange.toString()} nCAM
                  </Typography>
                </Stack>
              </Paragraph>
            </Paragraph>
          );
        }
        case 'NEW_MEMBER':
          return (
            <Typography>
              {result.target} - {result.value ? 'Admitted' : 'Declined'}
            </Typography>
          );
        case 'EXCLUDE_MEMBER':
          return (
            <Typography>
              {result.target} - {result.value ? 'Excluded' : 'Declined'}
            </Typography>
          );
        case 'FEE_DISTRIBUTION': {
          const values = result.value as number[];
          const labels = result.label as string[];
          return (
            <Paragraph spacing={1.5}>
              <Typography variant="h6">{`Vote Result: Distribution #${result.option}`}</Typography>
              <DistributionBar
                data={values.map(v => ({ percent: v }))}
                variant="vote"
              />
              {labels.map((label, idx) => (
                <Stack
                  key={`vote-dist-${label}`}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Circle
                    sx={{
                      color: VOTE_DISTRIBUTION_COLORS[idx],
                      fontSize: 12,
                    }}
                  />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography color="text.secondary">
                      {values[idx]}%
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Paragraph>
          );
        }
        default:
      }
      return null;
    }
  }, [result, votingType]);

  return (
    <Box
      padding={1.5}
      border="1px solid"
      borderColor="accent.main"
      borderRadius={1}
    >
      {content}
    </Box>
  );
};
export default VoteResult;
