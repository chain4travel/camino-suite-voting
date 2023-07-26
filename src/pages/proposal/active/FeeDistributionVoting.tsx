import React from 'react';
import { Stack, Typography } from '@mui/material';
import { map } from 'lodash';
import type { Proposal, VotingOption } from '@/types';
import VotingOptionCard from './VotingOptionCard';
import DistributionBar, {
  VOTE_DISTRIBUTION_COLORS,
} from '@/components/DistributionBar';
import { Circle } from '@mui/icons-material';
import useVote from '@/hooks/useVote';
interface FeeDistributionVotingProps {
  data: Proposal;
  isConsortiumMember?: boolean;
}
const FeeDistributionVoting = ({
  data,
  isConsortiumMember,
}: FeeDistributionVotingProps) => {
  const {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote,
  } = useVote();

  const handleSelectChange = (option: VotingOption | null) => {
    setSelectedOption(
      selectedOption?.option === option?.option ? null : option
    );
  };
  const handleConfirmToVote = (option: VotingOption) => {
    setConfirmedOption(option.option);
    submitVote({
      proposalId: data.id,
      votingType: data.type,
      votes: [option],
    });
  };

  return (
    <Stack direction="row" sx={{ marginRight: 3 }} spacing={3} width="100%">
      {data.options.map(opt => (
        <VotingOptionCard
          key={`fee-dist-${data.id}-${opt.option}`}
          option={opt}
          isConsortiumMember={isConsortiumMember}
          title={`Distribution #${opt.option}`}
          voted={data.voted}
          selected={selectedOption?.option}
          onSelect={handleSelectChange}
          onVote={() => handleConfirmToVote(opt)}
          isSubmitting={confirmedOption === opt.option}
          renderContent={(option: VotingOption) => {
            const values = option.value as number[];
            const labels = option.label as string[];
            const distributions = map(values, (value, idx) => ({
              percent: value,
              label: labels[idx],
            }));
            return (
              <Stack spacing={1.5}>
                <DistributionBar data={distributions} variant="vote" />
                <Stack spacing={0.5}>
                  {map(distributions, (distribution, idx: number) => (
                    <Stack
                      key={`fee-dist-${data.id}-${opt.option}-${idx}`}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Circle
                        sx={{
                          color: VOTE_DISTRIBUTION_COLORS[idx],
                          fontSize: 8,
                        }}
                      />
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Typography variant="caption" color="text.secondary">
                          {distribution.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {distribution.percent}%
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            );
          }}
        />
      ))}
    </Stack>
  );
};
export default FeeDistributionVoting;
