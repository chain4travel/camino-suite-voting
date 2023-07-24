import { Applicant, VotingOption } from '@/types';
import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import Big from 'big.js';
import Paragraph from '@/components/Paragraph';
import DistributionBar, {
  VOTE_DISTRIBUTION_COLORS,
} from '@/components/DistributionBar';
import { Circle } from '@mui/icons-material';
import Tag from '@/components/Tag';

interface VoteResultProps {
  result: VotingOption & { baseFee?: number; target?: string | Applicant };
  votingType?: string;
}
const VoteResult = ({ result, votingType }: VoteResultProps) => {
  const { content, noBox } = useMemo(() => {
    let content,
      noBox = false;
    // No matter result.value, default display
    if (result.target) {
      switch (votingType) {
        case 'GENERAL':
          content = (
            <Stack spacing={1} alignItems="flex-start">
              <Typography fontWeight={600}>{String(result.target)}</Typography>
            </Stack>
          );
          break;
        case 'NEW_MEMBER':
          content = (
            <Stack spacing={1} alignItems="flex-start">
              <Typography fontWeight={600}>{String(result.target)}</Typography>
            </Stack>
          );
          break;
        case 'EXCLUDE_MEMBER':
          content = (
            <Stack spacing={1} alignItems="flex-start">
              <Typography fontWeight={600}>{String(result.target)}</Typography>
            </Stack>
          );
          break;
        case 'GRANT':
          {
            const applicant = result.target as Applicant;
            noBox = true;
            content = (
              <Paragraph spacing="md">
                <Stack direction="row">
                  <Stack spacing={0.5} flex={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="grey.400"
                    >
                      Company name
                    </Typography>
                    <Typography variant="body2" color="grey.100">
                      {applicant.companyName}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5} flex={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="grey.400"
                    >
                      Company website
                    </Typography>
                    <Typography variant="body2" color="grey.100">
                      {applicant.companyWebsite}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row">
                  <Stack spacing={0.5} flex={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="grey.400"
                    >
                      Applicant name
                    </Typography>
                    <Typography variant="body2" color="grey.100">
                      {applicant.name}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5} flex={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="grey.400"
                    >
                      Applicant email
                    </Typography>
                    <Typography variant="body2" color="grey.100">
                      {applicant.email}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row">
                  <Stack spacing={0.5} flex={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="grey.400"
                    >
                      Applicant p-chain address
                    </Typography>
                    <Typography variant="body2" color="grey.100">
                      {applicant.pchainAddress}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5} flex={1} alignItems="flex-start">
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="grey.400"
                    >
                      Company industry
                    </Typography>
                    <Tag label={applicant.companyIndustry.toUpperCase()} />
                  </Stack>
                </Stack>
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="grey.400"
                  >
                    Company stage
                  </Typography>
                  <Tag
                    color="success"
                    label={applicant.companyStage.toUpperCase()}
                  />
                </Stack>
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="grey.400"
                  >
                    Company description
                  </Typography>
                  <Typography variant="body2" color="grey.100">
                    {applicant.companyDescription}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="grey.400"
                  >
                    Number of funds
                  </Typography>
                  <Tag label={String(applicant.numberOfFunds).toUpperCase()} />
                </Stack>
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="grey.400"
                  >
                    Use of funds
                  </Typography>
                  <Typography variant="body2" color="grey.100">
                    {applicant.useOfFunds}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="grey.400"
                  >
                    Pitch deck
                  </Typography>
                  <Typography variant="body2" color="grey.100">
                    {applicant.pitchDeck}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="grey.400"
                  >
                    Additional info about the application / company
                  </Typography>
                  <Typography variant="body2" color="grey.100">
                    {applicant.additionalInfo}
                  </Typography>
                </Stack>
              </Paragraph>
            );
          }
          break;
        default:
      }
    }
    // Has result value
    if (result.value) {
      switch (votingType) {
        case 'GENERAL':
          content = (
            <Stack spacing={1} alignItems="flex-start">
              <Typography fontWeight={600}>{String(result.target)}</Typography>
              <Tag
                color={result.value ? 'success' : 'error'}
                label={result.value ? 'ACCEPTED' : 'Declined'}
              />
            </Stack>
          );
          break;
        case 'BASE_FEE':
          {
            if (!result.baseFee) {
              console.error('type BASE_FEE must provide current baseFee');
              return { content: null, noBox };
            }
            const absoluteChange = new Big(result.value as number).minus(
              result.baseFee
            );
            const percentageChange = absoluteChange
              .times(100)
              .div(result.baseFee);
            const sign = absoluteChange.s > 0 ? '+' : '';
            content = (
              <Paragraph spacing={1.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">Vote Result</Typography>
                  <Tag color="success" label="WINNER" />
                </Stack>
                <Paragraph>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      New Base Fee
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {result?.value} nCAM
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Percentage Change
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {sign} {Number(percentageChange.toFixed(2))}%
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Absolute Change
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {sign} {absoluteChange.toString()} nCAM
                    </Typography>
                  </Stack>
                </Paragraph>
              </Paragraph>
            );
          }
          break;
        case 'NEW_MEMBER':
          content = (
            <Stack spacing={1} alignItems="flex-start">
              <Typography fontWeight={600}>{String(result.target)}</Typography>
              <Tag
                color={result.value ? 'success' : 'error'}
                label={result.value ? 'Admitted' : 'Declined'}
              />
            </Stack>
          );
          break;
        case 'EXCLUDE_MEMBER':
          content = (
            <Stack spacing={1} alignItems="flex-start">
              <Typography fontWeight={600}>{String(result.target)}</Typography>
              <Tag
                color={result.value ? 'success' : 'error'}
                label={result.value ? 'Excluded' : 'Declined'}
              />
            </Stack>
          );
          break;
        case 'FEE_DISTRIBUTION': {
          const values = result.value as number[];
          const labels = result.label as string[];
          content = (
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
          break;
        }
        default:
      }
    }
    return {
      content,
      noBox,
    };
  }, [result, votingType]);

  return content ? (
    <Box
      padding={noBox ? 0 : 2.5}
      border={noBox ? 0 : '2px solid'}
      borderColor="success.main"
      borderRadius={1}
    >
      {content}
    </Box>
  ) : null;
};
export default VoteResult;
