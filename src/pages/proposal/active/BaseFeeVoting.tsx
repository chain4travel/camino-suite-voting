import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import Big from 'big.js';
import type { Proposal, VotingOption } from '@/types';
import { useBaseFee, useVote } from '@/hooks/useRpc';
import VotingOptionCard from './VotingOptionCard';
interface BaseFeeVotingProps {
  data: Proposal;
  disableParentRipple?: (disabled: boolean) => void;
}
const BaseFeeVoting = ({ data, disableParentRipple }: BaseFeeVotingProps) => {
  const [selectToVote, setSelectToVote] = useState<string | number | null>(
    null
  );
  const [votingOption, setVotingOption] = useState<string | number | null>(
    null
  );
  const { baseFee } = useBaseFee();
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
          title={String(opt.label)}
          voted={data.voted}
          selected={selectToVote}
          onSelect={handleSelectChange}
          onVote={() => handleConfirmToVote(opt)}
          isSubmitting={votingOption === opt.option}
          renderContent={(option: VotingOption) => {
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
          }}
        />
      ))}
    </Stack>
  );
};
export default BaseFeeVoting;
