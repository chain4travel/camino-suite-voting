import React, { useState } from 'react';
import { Stack } from '@mui/material';
import { find } from 'lodash';
import type { Proposal, VotingOption } from '@/types';
import { useBaseFee, useVote } from '@/hooks/useRpc';
import BaseFeeVotingOption from './BaseFeeVotingOption';
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
    <Stack direction="row" sx={{ marginRight: 3 }} spacing={3}>
      {data.options.map(opt => (
        <VotingOptionCard
          key={`${opt.option}`}
          option={opt}
          title={`Future Base Fee ${opt.value} nCAM`}
          isVoted={!!find(data.voted, v => v.option === opt.option)}
          selected={selectToVote}
          onSelect={handleSelectChange}
          onVote={() => handleConfirmToVote(opt)}
          isSubmitting={votingOption === opt.option}
          renderContent={(option: VotingOption) => (
            <BaseFeeVotingOption option={option} baseFee={baseFee} />
          )}
        />
      ))}
    </Stack>
  );
};
export default BaseFeeVoting;
