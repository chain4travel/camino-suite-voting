import React, { useMemo } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, ListItemText, Stack, Typography } from '@mui/material';
import type { Proposal, VotingOption } from '@/types';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import ListItemStatus from '@/components/ListItemStatus';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import { getOptionLabel } from '@/helpers/util';

interface GeneralVoteProps {
  data: Proposal;
  voteTypeName?: string;
}
const GeneralVote = ({ data, voteTypeName }: GeneralVoteProps) => {
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
        <Typography
          variant="caption"
          className="clamp-3-lines"
          sx={{
            color: '#CBD5E1',
          }}
          dangerouslySetInnerHTML={{ __html: description }}
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
          <StateButton variant="contained" color="error">
            Failed
          </StateButton>
        )}
      </Box>
    </Box>
  );
};
export default GeneralVote;
