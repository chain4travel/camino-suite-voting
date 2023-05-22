import React from 'react';
import { Check, Close } from '@mui/icons-material';
import {
  Button,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type { Proposal } from '@/types';

interface NewMemberVotingProps {
  data: Proposal;
  disableParentRipple: (disabled: boolean) => void;
}
const NewMemberVoting = ({
  data,
  disableParentRipple,
}: NewMemberVotingProps) => {
  const { palette } = useTheme();
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
        {data.options.map(opt => (
          <Button
            key={opt.option}
            variant="contained"
            startIcon={opt.value ? <Check /> : <Close />}
            sx={{
              backgroundColor: opt.value
                ? 'primary'
                : palette.mode === 'dark'
                ? 'grey.200'
                : 'grey.700',
            }}
            onClick={() => {
              disableParentRipple(true);
            }}
          >
            {opt.label}
          </Button>
        ))}
      </Stack>
    </>
  );
};
export default NewMemberVoting;
