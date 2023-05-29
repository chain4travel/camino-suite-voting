import React from 'react';
import { Check, Close } from '@mui/icons-material';
import { ListItemText, Stack, Typography } from '@mui/material';
import type { Proposal } from '@/types';
import Button from '@/components/Button';

interface NewMemberVotingProps {
  data: Proposal;
  disableParentRipple?: (disabled: boolean) => void;
}
const NewMemberVoting = ({
  data,
  disableParentRipple,
}: NewMemberVotingProps) => {
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
              onClick={() => {
                disableParentRipple && disableParentRipple(true);
              }}
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
