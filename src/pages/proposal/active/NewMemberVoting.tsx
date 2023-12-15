import React from 'react';
import { ListItemText, Stack, Typography } from '@mui/material';
import sanitizeHtml from 'sanitize-html';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import type { Proposal } from '@/types';
import DefaultVotingOptions from './DefaultVotingOptions';

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
  return (
    <Stack direction="row" alignItems="center" spacing={3}>
      <ListItemText
        primary={String(data.target)}
        secondary={
          <Typography
            component="p"
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
              __html: sanitizeHtml(data.description ?? ''),
            }}
          />
        }
        primaryTypographyProps={{
          sx: { fontWeight: 500, marginBottom: 1 },
        }}
      />
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
    </Stack>
  );
};
export default NewMemberVoting;
