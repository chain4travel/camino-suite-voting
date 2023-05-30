import React, { MouseEventHandler, MouseEvent, useState } from 'react';
import { Check, Close } from '@mui/icons-material';
import { ListItemText, Stack, Typography } from '@mui/material';
import type { Proposal, VotingOption } from '@/types';
import Button from '@/components/Button';
import useDialog from '@/hooks/dialog';
import { useVote } from '@/hooks/useRpc';

interface NewMemberVotingProps {
  data: Proposal;
  disableParentRipple?: (disabled: boolean) => void;
}
const NewMemberVoting = ({
  data,
  disableParentRipple,
}: NewMemberVotingProps) => {
  const [votingOption, setVotingOption] = useState<string | number | null>(
    null
  );
  const { show } = useDialog();
  const vote = useVote({ onSettled: () => setVotingOption(null) });

  const handleConfirmToVote = (option: VotingOption) => {
    vote.mutate({
      proposalId: data.id,
      votingType: data.type,
      votes: [option],
    });
    setVotingOption(option.option);
  };
  const triggerVoting =
    (option: VotingOption): MouseEventHandler<HTMLButtonElement> =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      disableParentRipple && disableParentRipple(true);
      show({
        title: 'Are you sure?',
        message:
          'We will forword your proposal to the members connected to your multisig wallet for approval.',
        onConfirm: () => handleConfirmToVote(option),
      });
      // onVote();
    };

  return (
    <>
      <ListItemText
        primary={data.target}
        secondary={
          <Typography
            color="text.secondary"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
            }}
            variant="body2"
          >
            {data.description}
          </Typography>
        }
        sx={{ marginRight: '24px' }}
        primaryTypographyProps={{
          sx: { fontWeight: 500, marginBottom: '8px' },
        }}
      />
      <Stack direction="row" sx={{ marginRight: '24px' }} spacing="12px">
        {data.options
          .map(opt => (
            <Button
              key={opt.option}
              variant="contained"
              startIcon={opt.value ? <Check /> : <Close />}
              onClick={triggerVoting(opt)}
              loading={votingOption === opt.option}
              color={opt.value ? 'primary' : 'inherit'}
            >
              {opt.label}
            </Button>
          ))
          .reverse()}
      </Stack>
    </>
  );
};
export default NewMemberVoting;
