import React from 'react';
import { ListItemText, Stack, Typography } from '@mui/material';
import type { Applicant, Proposal } from '@/types';
import GrantProgramVotingOptions from './GrantProgramVotingOptions';

interface GrantProgramVotingProps {
  data: Proposal;
  isConsortiumMember?: boolean;
}
const GrantProgramVoting = ({
  data,
  isConsortiumMember,
}: GrantProgramVotingProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={3}>
      <ListItemText
        primary={(data.target! as Applicant).name}
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
            {(data.target! as Applicant).additionalInfo ??
              (data.target! as Applicant).companyDescription}
          </Typography>
        }
        primaryTypographyProps={{
          sx: { fontWeight: 500, marginBottom: 1 },
        }}
      />
      {isConsortiumMember && <GrantProgramVotingOptions data={data} />}
    </Stack>
  );
};
export default GrantProgramVoting;
