import React from 'react';
import { Stack, Typography } from '@mui/material';
import Big from 'big.js';
import type { Proposal, VotingOption } from '@/types';
import { useBaseFee } from '@/hooks/useRpc';
import VotingOptionCard from './VotingOptionCard';
import useVote from '@/hooks/useVote';
interface BaseFeeVotingProps {
  data: Proposal;
  isConsortiumMember?: boolean;
}
const BaseFeeVoting = ({ data, isConsortiumMember }: BaseFeeVotingProps) => {
  const {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote,
  } = useVote();
  const { baseFee } = useBaseFee();

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
          key={`basefee-${data.id}-${opt.option}`}
          option={opt}
          title={String(opt.label)}
          isConsortiumMember={isConsortiumMember}
          voted={data.voted}
          selected={selectedOption?.option}
          onSelect={handleSelectChange}
          onVote={() => handleConfirmToVote(opt)}
          isSubmitting={confirmedOption === opt.option}
          renderContent={(option: VotingOption) => {
            if (Number(baseFee) <= 0) {
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
