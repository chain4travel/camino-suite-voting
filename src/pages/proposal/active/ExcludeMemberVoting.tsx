import React from 'react';
import { ListItemText, Stack, Typography } from '@mui/material';
import sanitizeHtml from 'sanitize-html';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import type { Proposal } from '@/types';
import DefaultVotingOptions from './DefaultVotingOptions';

interface ExcludeMemberVotingProps {
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
const ExcludeMemberVoting = ({
  data,
  isConsortiumMember,
  refresh,
  onVoteSuccess,
  multisigFunctions,
}: ExcludeMemberVotingProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <ListItemText
        primary={String(data.target)}
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
              __html: sanitizeHtml(data.description ?? ''),
            }}
          />
        }
        sx={{ marginRight: 3 }}
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
export default ExcludeMemberVoting;
