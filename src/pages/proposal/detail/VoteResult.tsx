import { VotingOption } from '@/types';
import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import Big from 'big.js';
import Paragraph from '@/components/Paragraph';

interface VoteResultProps {
  result: VotingOption & { baseFee?: number; target?: string };
  votingType?: string;
}
const VoteResult = ({ result, votingType }: VoteResultProps) => {
  const content = useMemo(() => {
    if (result.value) {
      switch (votingType) {
        case 'BASE_FEE': {
          const absoluteChange = new Big(result.value).minus(result.baseFee);
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
