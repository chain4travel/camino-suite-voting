import React, { useMemo } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ListItemText, Stack, Typography } from '@mui/material';
import type { Proposal, VotingOption } from '@/types';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';

interface GeneralVoteProps {
  data: Proposal;
  voteTypeName?: string;
}
const GeneralVote = ({ data, voteTypeName }: GeneralVoteProps) => {
  const votedList: VotingOption[] = useMemo(
    () => data.options.filter(opt => data.outcome === opt.option),
    [data.outcome]
  );

  return (
    <Stack
      direction="row"
      spacing="12px"
      marginRight="24px"
      alignItems="center"
    >
      <ListItemText
        primary={data.target ?? voteTypeName}
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
      />
      {votedList.map(voted => (
        <StateButton
          variant="contained"
          key={voted.option}
          startIcon={voted.value ? <CheckCircle /> : <Cancel />}
          color={voted.value ? 'success' : 'error'}
        >
          {toPastTense(voted.label)}
        </StateButton>
      ))}
      {votedList.length === 0 && <StateButton>Not participated</StateButton>}
    </Stack>
  );
};
export default GeneralVote;
