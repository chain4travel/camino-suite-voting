import React from 'react';
import { Stack, Typography } from '@mui/material';
import Big from 'big.js';
import { findIndex } from 'lodash';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import type { Proposal, VotingOption } from '@/types';
import { useBaseFee } from '@/hooks/useRpc';
import useVote from '@/hooks/useVote';
import VotingOptionCard from './VotingOptionCard';

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
const BaseFeeVoting = ({
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
  const { baseFee } = useBaseFee();

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

  return (
    <Stack direction="row" sx={{ marginRight: 3 }} spacing={3} width="100%">
      {data.options
        .map(opt => {
          const compare = Number(opt.value) - Number(baseFee);
          const label =
            compare > 0
              ? 'Increase Base Fee'
              : compare < 0
              ? 'Decrease Base Fee'
              : 'Retain Base Fee';
          return {
            ...opt,
            label,
          };
        })
        .map(opt => (
          <VotingOptionCard
            key={`basefee-${data.id}-${opt.option}`}
            option={opt}
            title={String(opt.label)}
            isConsortiumMember={isConsortiumMember}
            voted={data.voted}
            selected={selectedOption?.option}
            inactive={data.inactive || data.isCompleted}
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
            renderContent={(option: VotingOption) => {
              if (Number(baseFee) <= 0) {
                console.warn('Invalid number of base fee: ', baseFee);
                return null;
              }
              const absoluteChange = new Big(Number(option.value)).minus(
                baseFee
              );
              const percentageChange = absoluteChange.times(100).div(baseFee);
              return (
                <>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Future Base Fee:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.value} nCAM
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Percentage Change:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {percentageChange.toFixed(2)}%
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Absolute Change:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {absoluteChange.toString()} nCAM
                    </Typography>
                  </Stack>
                </>
              );
            }}
          />
        ))}
    </Stack>
  );
};
export default BaseFeeVoting;
