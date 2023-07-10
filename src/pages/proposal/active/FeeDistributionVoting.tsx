import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { map } from 'lodash';
import type { Proposal, VotingOption } from '@/types';
import { useVote } from '@/hooks/useRpc';
import VotingOptionCard from './VotingOptionCard';
import DistributionBar, {
  VOTE_DISTRIBUTION_COLORS,
} from '@/components/DistributionBar';
import { Circle } from '@mui/icons-material';
interface FeeDistributionVotingProps {
  data: Proposal;
  disableParentRipple?: (disabled: boolean) => void;
}
const FeeDistributionVoting = ({
  data,
  disableParentRipple,
}: FeeDistributionVotingProps) => {
  const [selectToVote, setSelectToVote] = useState<string | number | null>(
    null
  );
  const [votingOption, setVotingOption] = useState<string | number | null>(
    null
  );
  const vote = useVote({ onSettled: () => setVotingOption(null) });

  const handleSelectChange = (option: string | number | null) => {
    setSelectToVote(selectToVote === option ? null : option);
    disableParentRipple && disableParentRipple(true);
  };
  const handleConfirmToVote = (option: VotingOption) => {
    setVotingOption(option.option);
    vote.mutate({
      proposalId: data.id,
      votingType: data.type,
      votes: [option],
    });
  };

  return (
    <Stack direction="row" sx={{ marginRight: 3 }} spacing={3} width="100%">
      {data.options.map(opt => (
        <VotingOptionCard
          key={`${opt.option}`}
          option={opt}
          title={`Distribution #${opt.option}`}
          voted={data.voted}
          selected={selectToVote}
          onSelect={handleSelectChange}
          onVote={() => handleConfirmToVote(opt)}
          isSubmitting={votingOption === opt.option}
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
                    <Stack direction="row" alignItems="center" spacing={1}>
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
