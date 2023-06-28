import React, { MouseEventHandler, MouseEvent, useState } from 'react';
import { Check, Close } from '@mui/icons-material';
import { IconButton, ListItemText, Stack, Typography } from '@mui/material';
import { filter, find } from 'lodash';
import type { Proposal, VotingOption } from '@/types';
import Button from '@/components/Button';
import { useVote } from '@/hooks/useRpc';
import StateButton from '@/components/StateButton';

interface ExcludeMemberVotingProps {
  data: Proposal;
}
const ExcludeMemberVoting = ({ data }: ExcludeMemberVotingProps) => {
  const [votingOption, setVotingOption] = useState<string | number | null>(
    null
  );
  const [needConfirm, setNeedConfirm] = useState<VotingOption | null>(null);
  const vote = useVote({ onSettled: () => setVotingOption(null) });

  const voted = filter(
    data.options,
    opt => !!find(data.voted, v => v.option === opt.option)
  );

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
      setNeedConfirm(option);
    };
  const confirmVoting =
    (option: VotingOption): MouseEventHandler<HTMLButtonElement> =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleConfirmToVote(option);
      setNeedConfirm(null);
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
        sx={{ marginRight: 3 }}
        primaryTypographyProps={{
          sx: { fontWeight: 500, marginBottom: 1 },
        }}
      />
      <Stack
        direction="row"
        sx={{ marginRight: 3, minWidth: 220 }}
        spacing={1.5}
      >
        {voted.length > 0
          ? voted.map(v => (
              <StateButton
                key={`voted-${v.option}`}
                variant="outlined"
                color={v.value ? 'accent' : 'error'}
                startIcon={v.value ? <Check /> : <Close />}
                fullWidth
              >
                {v.label}
              </StateButton>
            ))
          : needConfirm
          ? [
              <IconButton
                key="btn-cancel"
                color="inherit"
                sx={{
                  backgroundColor: 'grey.700',
                  borderRadius: 1,
                  paddingX: 2,
                }}
                onClick={() => setNeedConfirm(null)}
              >
                <Close />
              </IconButton>,
              <Button
                key="btn-confirm"
                fullWidth
                startIcon={<Check />}
                variant="contained"
                color="accent"
                onClick={confirmVoting(needConfirm)}
              >
                Confirm
              </Button>,
            ]
          : data.options
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
export default ExcludeMemberVoting;
