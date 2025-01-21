import ListItemStatus from '@/components/ListItemStatus';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import { getOptionLabel, sanitizeOptions } from '@/helpers/util';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import type { Proposal, VotingOption } from '@/types';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, ListItemText, Stack, Typography } from '@mui/material';
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
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '0px 12px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: '1 1 60%',
        }}
      >
        <Typography variant="body2">
          {(data.target as string) ?? voteTypeName}
        </Typography>
        <Typography
          variant="caption"
          className="clamp-3-lines"
          sx={{
            color: '#CBD5E1',
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(description ?? '', sanitizeOptions),
          }}
        ></Typography>
        <ListItemStatus
          startTimestamp={data.startTimestamp}
          endTimestamp={data.endTimestamp}
          isCompleted
        />
      </Box>
      <Box>
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
      </Box>
    </Box>
  );
};

export default React.memo(ExcludeMember);
