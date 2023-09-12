import React, { MouseEventHandler, MouseEvent, useMemo } from 'react';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { filter, find } from 'lodash';
import type { Proposal, VotingOption } from '@/types';
import Button from '@/components/Button';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import useVote from '@/hooks/useVote';

interface GrantProgramVotingOptionsProps {
  data: Proposal;
  showFullText?: boolean;
}
const GrantProgramVotingOptions = ({
  data,
  showFullText,
}: GrantProgramVotingOptionsProps) => {
  const {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote,
  } = useVote();

  const voted = filter(
    data.options,
    opt => !!find(data.voted, v => v.option === opt.option)
  );

  const triggerVoting =
    (option: VotingOption): MouseEventHandler<HTMLButtonElement> =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setSelectedOption(option);
    };

  const actionButtons = useMemo(() => {
    const isVoted = voted.length > 0;
    // Voted state
    if (isVoted) {
      return voted.map(v => (
        <StateButton
          key={`voted-${v.option}`}
          variant="contained"
          color={v.value ? 'success' : 'error'}
          startIcon={v.value ? <CheckCircle /> : <Cancel />}
          fullWidth
        >
          You {toPastTense(String(v.label))}
        </StateButton>
      ));
    }

    // Multisig pending state
    const isMultisigPending = !isVoted && data.multisig && data.multisig.voted;
    if (isMultisigPending) {
      const votedOption = find(data.options, {
        option: data.multisig!.voted.option,
      });
      if (votedOption) {
        const isAccepted = votedOption.value;
        return (
          <Button
            key={`multisig-voted-${votedOption?.option}`}
            variant={isAccepted ? 'contained' : 'outlined'}
            startIcon={isAccepted ? <CheckCircle /> : <Cancel />}
            onClick={triggerVoting(votedOption)}
            loading={confirmedOption === votedOption.option}
            loadingPosition="start"
            color={isAccepted ? 'primary' : 'inherit'}
            fullWidth
          >
            {votedOption.label}
          </Button>
        );
      }
    }

    // default non-voted state
    return data.options
      .map(opt => (
        <Button
          key={opt.option}
          variant={opt.value ? 'contained' : 'outlined'}
          startIcon={
            opt.value ? <CheckCircle /> : showFullText ? <Cancel /> : null
          }
          onClick={triggerVoting(opt)}
          loadingPosition="start"
          color={opt.value ? 'primary' : 'inherit'}
          fullWidth={showFullText || !!opt.value}
        >
          {opt.value ? opt.label : showFullText ? opt.label : <Cancel />}
        </Button>
      ))
      .reverse();
  }, [voted, data.options, data.multisig]);

  const confirmVoting =
    (option: VotingOption): MouseEventHandler<HTMLButtonElement> =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setConfirmedOption(option.option);
      submitVote({
        proposalId: data.id,
        votingType: data.type,
        votes: [option],
      });
    };
  const cancelConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedOption(null);
  };

  return (
    <Stack
      direction="row"
      sx={{ minWidth: showFullText ? '100%' : 240 }}
      spacing={1.5}
    >
      {selectedOption
        ? [
            <Button
              key="btn-cancel"
              fullWidth
              variant={'outlined'}
              startIcon={showFullText ? <Cancel /> : null}
              onClick={cancelConfirm}
              color="inherit"
            >
              {showFullText ? 'Cancel' : <Cancel />}
            </Button>,
            <Button
              key="btn-confirm"
              fullWidth
              startIcon={<CheckCircle />}
              variant="contained"
              loading={!!confirmedOption}
              loadingPosition="start"
              color={selectedOption.value ? 'success' : 'error'}
              onClick={confirmVoting(selectedOption)}
            >
              Confirm {selectedOption.label}
            </Button>,
          ]
        : actionButtons}
    </Stack>
  );
};
export default GrantProgramVotingOptions;
