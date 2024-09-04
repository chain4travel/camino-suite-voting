import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import { getOptionLabel } from '@/helpers/util';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import type { Proposal, VotingOption } from '@/types';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ListItemText, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';

interface NewMemberVoteProps {
  data: Proposal;
  voteTypeName?: string;
}

const ExcludeMember = ({ data, voteTypeName }: NewMemberVoteProps) => {
  const outcome: VotingOption[] = useMemo(
    () => data.options.filter(opt => data.outcome === opt.option),
    [data.outcome]
  );
  const description = useProposalDescription(data.id);
  return (
    <Stack direction="row" spacing={2.5} alignItems="flex-end">
      <ListItemText
        primary={(data.target as string) ?? voteTypeName}
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
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(description ?? ''),
            }}
          />
        }
      />
      {outcome.map(voted => (
        <StateButton
          variant="contained"
          key={voted.option}
          startIcon={voted.value ? <CheckCircle /> : <Cancel />}
          color={voted.value ? 'success' : 'error'}
        >
          {toPastTense(String(getOptionLabel(voted)))}
        </StateButton>
      ))}
      {outcome.length === 0 && (
        <StateButton variant="contained">Failed</StateButton>
      )}
    </Stack>
  );
};

export default React.memo(ExcludeMember);
