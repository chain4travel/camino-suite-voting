import React, { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { filter, map } from 'lodash';
import Paragraph from '@/components/Paragraph';
import StateButton from '@/components/StateButton';
import { Proposal, Vote, VotingOption } from '@/types';
import { toPastTense } from '@/helpers/string';

interface ExtraInfo {
  label: string;
  value: number | string;
}
interface ProposalStatusProps {
  proposal: Proposal;
  extraInfo?: ExtraInfo | ExtraInfo[];
}
const ProposalStatus = ({ proposal, extraInfo }: ProposalStatusProps) => {
  const voted = proposal?.voted.flatMap((v: Vote) =>
    filter(proposal.options, (opt: VotingOption) => opt.option === v.option)
  );
  const { getVotedState, extraInfoComponent } = useMemo(() => {
    let extraInfoComponent = null;
    let getVotedState = (option: VotingOption) =>
      toPastTense(String(option.label));
    switch (proposal?.type) {
      case 'BASE_FEE':
        {
          const info = extraInfo as ExtraInfo;
          extraInfoComponent = (
            <>
              <Typography variant="h5">{`${info?.label} prior to proposal`}</Typography>
              <Typography variant="body1" color="text.secondary">
                {info?.value} nCAM
              </Typography>
            </>
          );
          getVotedState = (option: VotingOption) =>
            `New Base Fee ${option.value} nCAM`;
        }
        break;
      case 'FEE_DISTRIBUTION':
        {
          const info = extraInfo as ExtraInfo[];
          extraInfoComponent = (
            <>
              <Typography variant="h5">
                Distribution prior to proposal
              </Typography>
              {map(info, distribution => (
                <Stack
                  key={`dist-${distribution.label}`}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body1" color="text.secondary">
                    {distribution.label}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {distribution.value}%
                  </Typography>
                </Stack>
              ))}
            </>
          );
          getVotedState = (option: VotingOption) =>
            `Distribution #${option.option}`;
        }
        break;
      default:
    }
    return {
      getVotedState,
      extraInfoComponent,
    };
  }, [proposal?.type]);
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
              {proposal?.status}
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
        {extraInfo && (
          <Paragraph spacing="sm" divider>
            {extraInfoComponent}
          </Paragraph>
        )}
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
