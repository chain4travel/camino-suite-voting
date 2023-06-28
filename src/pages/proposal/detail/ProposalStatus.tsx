import React, { ReactNode, useCallback } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { filter } from 'lodash';
import Paragraph from '@/components/Paragraph';
import StateButton from '@/components/StateButton';
import { Proposal, Vote, VotingOption } from '@/types';
import { toPastTense } from '@/helpers/string';

interface ProposalStatusProps {
  proposal: Proposal;
  extraInfo?: ReactNode;
}
const ProposalStatus = ({ proposal, extraInfo }: ProposalStatusProps) => {
  const voted = proposal?.voted.flatMap((v: Vote) =>
    filter(proposal.options, (opt: VotingOption) => opt.option === v.option)
  );
  const getVotedState = useCallback(
    (option: VotingOption) => {
      switch (proposal.type) {
        case 'BASE_FEE':
          return `New Base Fee ${option.value} nCAM`;
        default:
          return toPastTense(option.label);
      }
    },
    [proposal?.type]
  );
  return (
    <Box
      padding={3}
      minWidth={300}
      border="1px solid"
      borderColor="divider"
      borderRadius={3}
    >
      <Paragraph spacing="lg">
        <Paragraph divider>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Status</Typography>
            <StateButton variant="contained" sx={{ minWidth: 0 }}>
              PASSED
            </StateButton>
          </Stack>
        </Paragraph>
        <Paragraph spacing="sm" divider>
          <Typography variant="h5">Proposal period</Typography>
          <Paragraph>
            <Typography variant="body1" color="text.secondary">
              Start:{' '}
              {DateTime.fromSeconds(proposal?.startDateTime ?? 0).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              End:{' '}
              {DateTime.fromSeconds(proposal?.endDateTime ?? 0).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )}
            </Typography>
          </Paragraph>
        </Paragraph>
        <Paragraph spacing="sm" divider>
          {extraInfo}
        </Paragraph>
        <Paragraph spacing="md">
          <Typography variant="h5">Your vote</Typography>
          <Paragraph spacing="sm">
            {voted?.map((v: VotingOption) => (
              <StateButton
                key={v.option}
                variant="outlined"
                color="accent"
                sx={{ textTransform: 'none' }}
              >
                {getVotedState(v)}
              </StateButton>
            ))}
          </Paragraph>
          <Box />
        </Paragraph>
      </Paragraph>
    </Box>
  );
};
export default ProposalStatus;
