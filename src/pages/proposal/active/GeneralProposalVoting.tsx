import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Big from 'big.js';
import { findIndex } from 'lodash';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import type { Proposal, VotingOption } from '@/types';
import { useBaseFee } from '@/hooks/useRpc';
import sanitizeHtml from 'sanitize-html';
import useVote from '@/hooks/useVote';
import VotingOptionCard from './VotingOptionCard';
import { Serialization } from '@c4tplatform/caminojs/dist/utils';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import { sanitizeOptions } from '@/helpers/util';

const serialization = Serialization.getInstance();
interface BaseFeeVotingProps {
  data: Proposal;
  isConsortiumMember?: boolean;
  refresh?: () => void;
  onVoteSuccess?: (data?: string) => void;
  multisigFunctions: {
    signMultisigTx?: (tx: ModelMultisigTx) => Promise<void>;
    abortSignavault?: (tx: ModelMultisigTx) => Promise<void>;
    executeMultisigTx?: (
      onSuccess?: (txID?: string) => void
    ) => (tx: ModelMultisigTx) => Promise<void> | undefined;
  };
}
const GeneralProposalVoting = ({
  data,
  isConsortiumMember,
  refresh,
  onVoteSuccess,
  multisigFunctions,
}: BaseFeeVotingProps) => {
  const {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote,
  } = useVote(onVoteSuccess, refresh);
  const { signMultisigTx, abortSignavault, executeMultisigTx } =
    multisigFunctions;

  const handleSelectChange = (option: VotingOption | null) => {
    setSelectedOption(
      selectedOption?.option === option?.option ? null : option
    );
  };
  const handleConfirmToVote = (option: VotingOption) => {
    setConfirmedOption(option.option);
    const optionIndex = findIndex(
      data.options,
      opt => opt.option === option.option
    );
    submitVote({
      proposalId: data.id,
      optionIndex,
    });
  };
  const description = useProposalDescription(data.id);
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
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
          __html: sanitizeHtml(description ?? '', sanitizeOptions),
        }}
      />
      <Stack direction="row" sx={{ marginRight: 3 }} spacing={3} width="100%">
        {data.options.map((opt, index) => {
          return (
            <VotingOptionCard
              key={`basefee-${data.id}-${opt.option}`}
              option={opt}
              title={String('Option ' + index)}
              isConsortiumMember={isConsortiumMember}
              voted={data.voted}
              selected={selectedOption?.option}
              inactive={data.inactive || data.isCompleted || !data.canVote}
              onSelect={handleSelectChange}
              onVote={() => handleConfirmToVote(opt)}
              isSubmitting={confirmedOption === opt.option}
              pendingMultisigTx={data.pendingMultisigTx}
              signMultisigTx={signMultisigTx}
              abortSignavault={abortSignavault}
              executeMultisigTx={executeMultisigTx?.(txId => {
                onVoteSuccess?.(txId);
                setTimeout(() => refresh?.(), 500);
              })}
              renderContent={option => {
                return (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {serialization.decoder(
                          option.value as string,
                          'base64',
                          'base64',
                          'utf8'
                        )}
                      </Typography>
                    </Stack>
                  </>
                );
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
export default GeneralProposalVoting;
