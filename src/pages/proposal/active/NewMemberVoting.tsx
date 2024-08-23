import React from 'react';
import { Box, ListItemText, Stack, Typography } from '@mui/material';
import sanitizeHtml from 'sanitize-html';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import type { Proposal } from '@/types';
import DefaultVotingOptions from './DefaultVotingOptions';
import LongString from '@/components/LongString';
import { useProposalDescription } from '@/hooks/useProposalDescription';

interface NewMemberVotingProps {
  data: Proposal;
  multisigFunctions: {
    signMultisigTx?: (tx: ModelMultisigTx) => Promise<void>;
    abortSignavault?: (tx: ModelMultisigTx) => Promise<void>;
    executeMultisigTx?: (
      onSuccess?: (txID?: string) => void
    ) => (tx: ModelMultisigTx) => Promise<void> | undefined;
  };
  isConsortiumMember?: boolean;
  refresh?: () => void;
  onVoteSuccess?: (data?: string) => void;
}
const NewMemberVoting = ({
  data,
  isConsortiumMember,
  refresh,
  onVoteSuccess,
  multisigFunctions,
}: NewMemberVotingProps) => {
  const description = useProposalDescription(data.id);
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          mb: '4px !important',
          alignItems: 'start',
          flexWrap: 'wrap',
        }}
      >
        <LongString value={String(data.target)} />
        <Typography
          component="caption"
          color="text.secondary"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            textAlign: 'start',
          }}
          variant="caption"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(description ?? ''),
          }}
        />
      </Box>
      {isConsortiumMember && (
        <DefaultVotingOptions
          data={data}
          isConsortiumMember={isConsortiumMember}
          multisigFunctions={multisigFunctions}
          onRefresh={refresh}
          onVoteSuccess={onVoteSuccess}
          compact
        />
      )}
    </Box>
  );
};
export default NewMemberVoting;
