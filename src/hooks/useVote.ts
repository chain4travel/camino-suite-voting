import { useState } from 'react';
import { VotingOption } from '@/types';
import { useSubmitVote } from './useRpc';

const useVote = () => {
  const [selectedOption, setSelectedOption] = useState<VotingOption | null>(
    null
  );
  const [confirmedOption, setConfirmedOption] = useState<
    string | number | null
  >(null);
  const submitVote = useSubmitVote({
    onSettled: () => {
      setConfirmedOption(null);
      setSelectedOption(null);
    },
  });

  return {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote: submitVote.mutate,
  };
};
export default useVote;
