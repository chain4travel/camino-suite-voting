import React, { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { filter, map } from 'lodash';
import Paragraph from '@/components/Paragraph';
import StateButton from '@/components/StateButton';
import { Proposal, Vote, VotingOption } from '@/types';
import { toPastTense } from '@/helpers/string';
import Tag from '@/components/Tag';
import { Cancel, CheckCircle } from '@mui/icons-material';

interface ExtraInfo {
  label: string;
  value: number | string;
}
interface ProposalStatusProps {
  proposal: Proposal;
  extraInfo?: ExtraInfo | ExtraInfo[];
}
const ProposalStatus = ({ proposal, extraInfo }: ProposalStatusProps) => {
  const voted = proposal?.voted?.flatMap((v: Vote) =>
    filter(proposal.options, (opt: VotingOption) => opt.option === v.option)
  );
  const isCompleted = proposal?.status === 'PASSED';
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
              <Typography
                variant="caption"
                fontWeight={600}
                letterSpacing={2}
                sx={{ textTransform: 'uppercase' }}
              >{`${info?.label} prior to proposal`}</Typography>
              <Typography variant="body2" color="text.secondary">
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
              <Typography
                variant="caption"
                fontWeight={600}
                letterSpacing={2}
                sx={{ textTransform: 'uppercase' }}
              >
                Distribution prior to proposal
              </Typography>
              {map(info, distribution => (
                <Stack
                  key={`dist-${distribution.label}`}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" color="text.secondary">
                    {distribution.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
      padding={2.5}
      minWidth={339}
      borderRadius={1.5}
      sx={{ backgroundColor: 'grey.900' }}
    >
      <Paragraph spacing="md">
        <Paragraph divider>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Status</Typography>
            <Tag
              color={isCompleted ? 'success' : 'default'}
              label={proposal?.status}
            />
          </Stack>
        </Paragraph>
        <Paragraph spacing={1.5} divider>
          <Typography
            variant="caption"
            fontWeight={600}
            letterSpacing={2}
            sx={{ textTransform: 'uppercase' }}
          >
            Proposal period
          </Typography>
          <Paragraph spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Start:{' '}
              {DateTime.fromSeconds(proposal?.startDateTime ?? 0).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End:{' '}
              {DateTime.fromSeconds(proposal?.endDateTime ?? 0).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )}
            </Typography>
          </Paragraph>
        </Paragraph>
        {extraInfo && (
          <Paragraph spacing={1.5} divider>
            {extraInfoComponent}
          </Paragraph>
        )}
        <Paragraph spacing="md">
          <Typography
            variant="caption"
            fontWeight={600}
            letterSpacing={2}
            sx={{ textTransform: 'uppercase' }}
          >
            Your vote
          </Typography>
          <Paragraph spacing="sm" alignItems="flex-start">
            {voted ? (
              voted.map((v: VotingOption) => (
                <StateButton
                  key={v.option}
                  variant="contained"
                  color={v.value ? 'success' : 'error'}
                  startIcon={v.value ? <CheckCircle /> : <Cancel />}
                  sx={{ textTransform: 'none' }}
                >
                  {getVotedState(v)}
                </StateButton>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                You have not voted yet
              </Typography>
            )}
          </Paragraph>
        </Paragraph>
      </Paragraph>
    </Box>
  );
};
export default ProposalStatus;
