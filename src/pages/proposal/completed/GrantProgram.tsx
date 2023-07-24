import React, { useMemo } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ListItemText, Stack, Typography } from '@mui/material';
import type { Applicant, Proposal, VotingOption } from '@/types';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';

interface GrantProgramProps {
  data: Proposal;
  voteTypeName?: string;
}
const GrantProgram = ({ data, voteTypeName }: GrantProgramProps) => {
  const votedList: VotingOption[] = useMemo(
    () =>
      data.options.filter(opt =>
        data.voted?.find(v => v.option === opt.option)
      ),
    [data.voted]
  );

  function isApplicant(value: unknown): value is Applicant {
    return typeof value !== 'string';
  }

  return (
    <Stack
      direction="row"
      spacing="12px"
      marginRight="24px"
      alignItems="center"
    >
      {isApplicant(data.target) && (
        <ListItemText
          primary={data.target.name ?? voteTypeName}
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
              {data.target.companyDescription}
            </Typography>
          }
        />
      )}
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
export default GrantProgram;
