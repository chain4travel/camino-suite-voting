import React from 'react';
import { Box, ListItemText, Stack, Typography } from '@mui/material';
import sanitizeHtml from 'sanitize-html';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import type { Proposal } from '@/types';
import DefaultVotingOptions from './DefaultVotingOptions';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import LongString from '@/components/LongString';
import DOMPurify from 'dompurify';

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
  const { description, isLoading, error } = useProposalDescription(data.id);
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
        }}
      >
        <LongString value={String(data.target)} />
        {isLoading ? (
          <Box
            sx={{
              width: '100%',
              height: '20px',
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
          />
        ) : error ? (
          data.description ? (
            <Typography
              component="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                textAlign: 'start',
              }}
              variant="caption"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(data.description),
              }}
            />
          ) : (
            <Typography variant="caption" color="error">
              Failed to load description
            </Typography>
          )
        ) : (
          <Typography
            component="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              textAlign: 'start',
            }}
            variant="caption"
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        )}
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
export default ExcludeMemberVoting;
